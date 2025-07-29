import type { PushRecord } from "../types"

export class PushRecordsService {
  private db: any = null

  constructor() {
    // 延迟初始化
  }

  async init() {
    if (!this.db) {
      const { useDatabase } = await import("#/database")
      this.db = useDatabase()
    }
  }

  /**
   * 获取所有推送记录
   */
  async getAllRecords(): Promise<PushRecord[]> {
    await this.init()
    const res = await this.db.prepare(`
      SELECT id, date, title, summary, recipients, status, sent_at, created_at, updated_at 
      FROM push_records 
      ORDER BY created_at DESC
    `).all()
    
    const rows = res.results ?? res
    return rows.map((row: any) => ({
      ...row,
      recipients: JSON.parse(row.recipients || "[]"),
      sent_at: new Date(row.sent_at).toISOString(),
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString(),
    }))
  }

  /**
   * 获取今日推送记录
   */
  async getTodayRecord(): Promise<PushRecord | null> {
    const today = new Date().toISOString().split("T")[0]
    await this.init()
    
    const res = await this.db.prepare(`
      SELECT id, date, title, summary, recipients, status, sent_at, created_at, updated_at
      FROM push_records 
      WHERE date = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).all(today)
    
    const rows = res.results ?? res
    if (rows.length === 0) return null
    
    const row = rows[0]
    return {
      ...row,
      recipients: JSON.parse(row.recipients || "[]"),
      sent_at: new Date(row.sent_at).toISOString(),
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString(),
    }
  }

  /**
   * 保存推送记录
   */
  async saveRecord(record: Omit<PushRecord, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    await this.init()
    const id = `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Date.now()
    
    await this.db.prepare(`
      INSERT INTO push_records (id, date, title, summary, recipients, status, sent_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      record.date,
      record.title,
      record.summary,
      JSON.stringify(record.recipients),
      record.status,
      record.sent_at,
      now,
      now
    )
    
    return id
  }

  /**
   * 删除推送记录
   */
  async deleteRecord(id: string): Promise<void> {
    await this.init()
    await this.db.prepare(`DELETE FROM push_records WHERE id = ?`).run(id)
  }

  /**
   * 获取推送统计信息
   */
  async getStats() {
    const records = await this.getAllRecords()
    return {
      total: records.length,
      sent: records.filter(r => r.status === 'sent').length,
      failed: records.filter(r => r.status === 'failed').length
    }
  }
}

// 导出单例实例
export const pushRecordsService = new PushRecordsService() 