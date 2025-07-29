import process from "node:process"
import type { Database } from "db0"
import type { User, UserRow } from "../types"

const isMySQL = process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_PASSWORD && process.env.MYSQL_DATABASE

export class UserTable {
  private db: Database

  constructor(db: Database) {
    this.db = db
  }

  async init() {
    if (isMySQL) {
      // MySQL syntax
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255),
          avatar VARCHAR(500),
          created_at BIGINT,
          updated_at BIGINT
        );
      `).run()
    } else {
      throw new Error('MySQL 配置缺失，请检查环境变量')
    }
    logger.success(`init users table`)
  }

  async create(user: User) {
    const now = Date.now()
      if (isMySQL) {
        // MySQL syntax - use ON DUPLICATE KEY UPDATE
      await this.db.prepare(
        `INSERT INTO users (id, name, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), avatar = VALUES(avatar), updated_at = VALUES(updated_at)`,
      ).run(user.id, user.name, user.avatar, now, now)
      } else {
      throw new Error('MySQL 配置缺失，请检查环境变量')
      }
    logger.success(`create user ${user.id}`)
  }

  async get(id: string): Promise<User | undefined> {
    const row = (await this.db.prepare(`SELECT id, name, avatar, created_at, updated_at FROM users WHERE id = ?`).get(id)) as UserRow | undefined
    if (row) {
      logger.success(`get user ${id}`)
      return {
        id: row.id,
        name: row.name,
        avatar: row.avatar,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }
    }
  }

  async getAll(): Promise<User[]> {
    const res = await this.db.prepare(`SELECT id, name, avatar, created_at, updated_at FROM users ORDER BY created_at DESC`).all() as any
    const rows = (res.results ?? res) as UserRow[]

    /**
     * https://developers.cloudflare.com/d1/build-with-d1/d1-client-api/#return-object
     * cloudflare d1 .all() will return
     * {
     *   success: boolean
     *   meta:
     *   results:
     * }
     */
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      avatar: row.avatar,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))
  }

  async delete(id: string) {
    await this.db.prepare(`DELETE FROM users WHERE id = ?`).run(id)
    logger.success(`delete user ${id}`)
    }
  }

export async function getUserTable() {
  try {
    const db = useDatabase()
    const userTable = new UserTable(db)
    if (process.env.INIT_TABLE !== "false") await userTable.init()
    return userTable
  } catch (e) {
    logger.error("failed to init database ", e)
  }
}
