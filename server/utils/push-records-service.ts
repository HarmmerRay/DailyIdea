import dayjs from "dayjs"

export interface PushRecord {
  id: string
  title: string
  summary: string
  sentAt: string
  status: "sent" | "pending" | "failed"
  opportunities: {
    title: string
    category: "tech" | "finance" | "consumer" | "policy" | "social"
    confidence: number
  }[]
  emailData?: {
    from: string
    to: string
    subject: string
    html: string
  }
  createdAt: string
  updatedAt: string
}

export class PushRecordsService {
  private db: any

  constructor() {
    this.db = useDatabase()
  }

  /**
   * Save a push record to database
   */
  async savePushRecord(record: Omit<PushRecord, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const id = `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const fullRecord: PushRecord = {
      ...record,
      id,
      createdAt: now,
      updatedAt: now,
    }

    await this.db.set(`push_record:${id}`, JSON.stringify(fullRecord))

    // Also save to daily index for quick queries
    const date = dayjs(record.sentAt).format("YYYY-MM-DD")
    const dailyKey = `push_records_date:${date}`
    const existingRecords = await this.getDailyRecords(date)
    existingRecords.push(fullRecord)

    await this.db.set(dailyKey, JSON.stringify(existingRecords), {
      ttl: 7 * 24 * 3600, // Keep for 7 days
    })

    return id
  }

  /**
   * Get push records for a specific date
   */
  async getDailyRecords(date: string): Promise<PushRecord[]> {
    const dailyKey = `push_records_date:${date}`
    const cached = await this.db.get(dailyKey)

    if (cached) {
      return JSON.parse(cached.data)
    }

    return []
  }

  /**
   * Get today's push records
   */
  async getTodayRecords(): Promise<PushRecord[]> {
    const today = dayjs().format("YYYY-MM-DD")
    return this.getDailyRecords(today)
  }

  /**
   * Get pending records (tomorrow and future)
   */
  async getPendingRecords(): Promise<PushRecord[]> {
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD")
    const tomorrowRecords = await this.getDailyRecords(tomorrow)

    return tomorrowRecords.filter(record => record.status === "pending")
  }

  /**
   * Update push record status
   */
  async updateRecordStatus(id: string, status: PushRecord["status"]): Promise<boolean> {
    try {
      const recordData = await this.db.get(`push_record:${id}`)
      if (!recordData) {
        return false
      }

      const record: PushRecord = JSON.parse(recordData.data)
      record.status = status
      record.updatedAt = new Date().toISOString()

      await this.db.set(`push_record:${id}`, JSON.stringify(record))

      // Update daily index
      const date = dayjs(record.sentAt).format("YYYY-MM-DD")
      const dailyRecords = await this.getDailyRecords(date)
      const updatedRecords = dailyRecords.map(r => r.id === id ? record : r)

      await this.db.set(`push_records_date:${date}`, JSON.stringify(updatedRecords), {
        ttl: 7 * 24 * 3600,
      })

      return true
    } catch (error) {
      console.error("Error updating record status:", error)
      return false
    }
  }

  /**
   * Clean up old records (older than 30 days)
   */
  async cleanupOldRecords(): Promise<void> {
    const cutoffDate = dayjs().subtract(30, "days")

    // This would need to be implemented based on your database structure
    // For now, just log the cleanup action
    console.log(`Cleanup: would remove records older than ${cutoffDate.format("YYYY-MM-DD")}`)
  }
}

// Export singleton instance
export const pushRecordsService = new PushRecordsService()
