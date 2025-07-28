import process from "node:process"
import type { Database } from "db0"
import type { UserInfo } from "../types"

export class UserService {
  private db: Database
  private isMySQL: boolean

  constructor(db: Database) {
    this.db = db
    this.isMySQL = !!(process.env.MYSQL_HOST &&
                   process.env.MYSQL_USER &&
                   process.env.MYSQL_PASSWORD &&
                   process.env.MYSQL_DATABASE)
  }

  async init() {
    if (this.isMySQL) {
      // MySQL syntax
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS user (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255),
          data TEXT,
          type VARCHAR(50),
          created BIGINT,
          updated BIGINT
        );
      `).run()
      await this.db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_user_id ON user(id);
      `).run()
    } else {
      throw new Error('MySQL 配置缺失，请检查环境变量')
    }
    logger.success(`init user table`)
  }

  async addUser(id: string, email: string, type: "github") {
    const u = await this.getUser(id)
    const now = Date.now()
    
    if (!u) {
      if (this.isMySQL) {
        // MySQL syntax - use ON DUPLICATE KEY UPDATE
        await this.db.prepare(`INSERT INTO user (id, email, data, type, created, updated) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email), updated = VALUES(updated)`)
          .run(id, email, "", type, now, now)
      } else {
        throw new Error('MySQL 配置缺失，请检查环境变量')
      }
      logger.success(`add user ${id}`)
    } else if (u.email !== email && u.type !== type) {
      await this.db.prepare(`UPDATE user SET email = ?, updated = ? WHERE id = ?`).run(email, now, id)
      logger.success(`update user ${id} email`)
    } else {
      logger.info(`user ${id} already exists`)
    }
  }

  async getUser(id: string) {
    return (await this.db.prepare(`SELECT id, email, data, created, updated FROM user WHERE id = ?`).get(id)) as UserInfo
  }

  async setData(key: string, value: string, updatedTime = Date.now()) {
    const state = await this.db.prepare(
      `UPDATE user SET data = ?, updated = ? WHERE id = ?`,
    ).run(value, updatedTime, key)
    if (!state.success) throw new Error(`set user ${key} data failed`)
    logger.success(`set ${key} data`)
  }

  async getData(id: string) {
    const row: any = await this.db.prepare(`SELECT data, updated FROM user WHERE id = ?`).get(id)
    if (!row) throw new Error(`user ${id} not found`)
    logger.success(`get ${id} data`)
    return row as {
      data: string
      updated: number
    }
  }

  async deleteUser(key: string) {
    const state = await this.db.prepare(`DELETE FROM user WHERE id = ?`).run(key)
    if (!state.success) throw new Error(`delete user ${key} failed`)
    logger.success(`delete user ${key}`)
  }
}