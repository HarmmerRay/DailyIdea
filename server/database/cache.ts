import process from "node:process"
import type { NewsItem } from "@shared/types"
import type { Database } from "db0"
import type { CacheInfo, CacheRow } from "../types"

// 简化的数据库类型检测函数
function isMySQLDatabase(): boolean {
  console.log("process.env.MYSQL_HOST", process.env.MYSQL_HOST)
  console.log("process.env.MYSQL_USER", process.env.MYSQL_USER)
  console.log("process.env.MYSQL_PASSWORD", process.env.MYSQL_PASSWORD)
  console.log("process.env.MYSQL_DATABASE", process.env.MYSQL_DATABASE)
  const hasMySQLConfig = process.env.MYSQL_HOST && 
                        process.env.MYSQL_USER && 
                        process.env.MYSQL_PASSWORD && 
                        process.env.MYSQL_DATABASE
  console.log('hasMySQLConfig', hasMySQLConfig)
  if (hasMySQLConfig) {
    console.log('🔍 检测到 MySQL 配置，使用 MySQL 数据库')
    return true
  } else {
    console.log('❌ 未检测到 MySQL 配置，请配置 MySQL 环境变量')
    return false
  }
}

export class Cache {
  private db
  private isMySQL: boolean
  
  constructor(db: Database) {
    this.db = db
    this.isMySQL = isMySQLDatabase()
  }

  async init() {
    if (this.isMySQL) {
      // MySQL syntax
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS cache (
          id VARCHAR(255) PRIMARY KEY,
          updated BIGINT,
          data TEXT
        );
      `).run()
    } else {
      throw new Error('MySQL 配置缺失，请检查环境变量')
    }
    logger.success(`init cache table`)
  }

  async set(key: string, value: NewsItem[]) {
    const now = Date.now()
    
    if (this.isMySQL) {
      // MySQL syntax - use ON DUPLICATE KEY UPDATE
      await this.db.prepare(
        `INSERT INTO cache (id, data, updated) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated = VALUES(updated)`,
      ).run(key, JSON.stringify(value), now)
    } else {
      throw new Error('MySQL 配置缺失，请检查环境变量')
    }
    logger.success(`set ${key} cache`)
  }

  async get(key: string): Promise<CacheInfo | undefined > {
    const row = (await this.db.prepare(`SELECT id, data, updated FROM cache WHERE id = ?`).get(key)) as CacheRow | undefined
    if (row) {
      logger.success(`get ${key} cache`)
      return {
        id: row.id,
        updated: row.updated,
        items: JSON.parse(row.data),
      }
    }
  }

  async getEntire(keys: string[]): Promise<CacheInfo[]> {
    const keysStr = keys.map(k => `id = '${k}'`).join(" or ")
    const res = await this.db.prepare(`SELECT id, data, updated FROM cache WHERE ${keysStr}`).all() as any
    const rows = (res.results ?? res) as CacheRow[]

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
      updated: row.updated,
      items: JSON.parse(row.data),
    }))
  }

  async delete(key: string) {
    await this.db.prepare(`DELETE FROM cache WHERE id = ?`).run(key)
    logger.success(`delete ${key} cache`)
  }
}

export async function getCacheTable() {
  if (process.env.ENABLE_CACHE === "false") return
  try {
    const db = useDatabase()
    if (process.env.ENABLE_CACHE === "false") return
    const cacheTable = new Cache(db)
    if (process.env.INIT_TABLE !== "false") await cacheTable.init()
    return cacheTable
  } catch (e) {
    logger.error("failed to init database ", e)
  }
}
