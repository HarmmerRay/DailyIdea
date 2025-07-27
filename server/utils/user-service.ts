export interface User {
  id: string
  email: string
  name?: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface DailyTask {
  id: string
  date: string
  title: string
  summary?: string
  recipients: string
  status: "sent" | "failed"
  sent_at: string
  created_at: string
  updated_at: string
}

export class UserService {
  private db: any
  private isMySQL: boolean

  constructor() {
    this.db = useDatabase()
    this.isMySQL = process.env.MYSQL_HOST && 
                  process.env.MYSQL_USER && 
                  process.env.MYSQL_PASSWORD && 
                  process.env.MYSQL_DATABASE
  }

  /**
   * Initialize user tables
   */
  async init() {
    if (this.isMySQL) {
      // MySQL syntax
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at BIGINT NOT NULL,
          updated_at BIGINT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `).run()
      
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS daily_tasks (
          id VARCHAR(255) PRIMARY KEY,
          date DATE NOT NULL,
          title VARCHAR(500) NOT NULL,
          summary TEXT,
          recipients TEXT,
          status ENUM('sent', 'failed') DEFAULT 'sent',
          sent_at BIGINT NOT NULL,
          created_at BIGINT NOT NULL,
          updated_at BIGINT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `).run()
    } else {
      // SQLite syntax
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          status TEXT DEFAULT 'active',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `).run()
      
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS daily_tasks (
          id TEXT PRIMARY KEY,
          date TEXT NOT NULL,
          title TEXT NOT NULL,
          summary TEXT,
          recipients TEXT,
          status TEXT DEFAULT 'sent',
          sent_at INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `).run()
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const query = `
        SELECT id, email, name, status, created_at, updated_at 
        FROM users 
        ORDER BY created_at DESC
      `
      const result = await this.db.prepare(query).all()
      const rows = result.results ?? result
      return rows.map((row: any) => ({
        ...row,
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString(),
      }))
    } catch (error) {
      console.error("Error getting users:", error)
      return []
    }
  }

  /**
   * Get active users for email sending
   */
  async getActiveUsers(): Promise<User[]> {
    try {
      const query = `
        SELECT id, email, name, status, created_at, updated_at 
        FROM users 
        WHERE status = 'active' 
        ORDER BY created_at DESC
      `
      const result = await this.db.prepare(query).all()
      const rows = result.results ?? result
      return rows.map((row: any) => ({
        ...row,
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString(),
      }))
    } catch (error) {
      console.error("Error getting active users:", error)
      return []
    }
  }

  /**
   * Add a new user
   */
  async addUser(email: string, name?: string): Promise<string> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Date.now()

    try {
      const query = `
        INSERT INTO users (id, email, name, status, created_at, updated_at)
        VALUES (?, ?, ?, 'active', ?, ?)
      `
      await this.db.prepare(query).run(id, email, name || null, now, now)
      return id
    } catch (error) {
      console.error("Error adding user:", error)
      throw new Error("Failed to add user")
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(id: string, status: "active" | "inactive"): Promise<boolean> {
    try {
      const now = Date.now()
      const query = `
        UPDATE users 
        SET status = ?, updated_at = ? 
        WHERE id = ?
      `
      const result = await this.db.prepare(query).run(status, now, id)
      return result.changes > 0
    } catch (error) {
      console.error("Error updating user status:", error)
      return false
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const query = `DELETE FROM users WHERE id = ?`
      const result = await this.db.prepare(query).run(id)
      return result.changes > 0
    } catch (error) {
      console.error("Error deleting user:", error)
      return false
    }
  }

  /**
   * Save daily task record
   */
  async saveDailyTask(
    date: string,
    title: string,
    summary: string,
    recipients: string[],
    status: "sent" | "failed" = "sent"
  ): Promise<string> {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Date.now()

    try {
      const query = `
        INSERT INTO daily_tasks (id, date, title, summary, recipients, status, sent_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      await this.db.prepare(query).run(
        id,
        date,
        title,
        summary,
        JSON.stringify(recipients),
        status,
        now,
        now,
        now
      )
      return id
    } catch (error) {
      console.error("Error saving daily task:", error)
      throw new Error("Failed to save daily task")
    }
  }

  /**
   * Get daily tasks history
   */
  async getDailyTasks(limit: number = 30): Promise<DailyTask[]> {
    try {
      const query = `
        SELECT id, date, title, summary, recipients, status, sent_at, created_at, updated_at
        FROM daily_tasks 
        ORDER BY date DESC, created_at DESC
        LIMIT ?
      `
      const result = await this.db.prepare(query).all(limit)
      const rows = result.results ?? result
      return rows.map((row: any) => ({
        ...row,
        recipients: JSON.parse(row.recipients || "[]"),
        sent_at: new Date(row.sent_at).toISOString(),
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString(),
      }))
    } catch (error) {
      console.error("Error getting daily tasks:", error)
      return []
    }
  }

  /**
   * Get today's task if exists
   */
  async getTodayTask(): Promise<DailyTask | null> {
    const today = new Date().toISOString().split("T")[0]
    
    try {
      const query = `
        SELECT id, date, title, summary, recipients, status, sent_at, created_at, updated_at
        FROM daily_tasks 
        WHERE date = ?
        ORDER BY created_at DESC
        LIMIT 1
      `
      const result = await this.db.prepare(query).all(today)
      const rows = result.results ?? result
      
      if (rows.length === 0) {
        return null
      }

      const row = rows[0]
      return {
        ...row,
        recipients: JSON.parse(row.recipients || "[]"),
        sent_at: new Date(row.sent_at).toISOString(),
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString(),
      }
    } catch (error) {
      console.error("Error getting today's task:", error)
      return null
    }
  }
}

// Export singleton instance
export const userService = new UserService()