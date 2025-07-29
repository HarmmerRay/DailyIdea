import type { User } from "../types"
import { UserTable } from "../database/user"

export class UserService {
  private userTable: UserTable | null = null

  constructor() {
    // 延迟初始化
  }

  async init() {
    if (!this.userTable) {
      const { getUserTable } = await import("../database/user")
      const table = await getUserTable()
      if (!table) {
        throw new Error('Failed to initialize user table')
      }
      this.userTable = table
    }
  }

  /**
   * 获取所有用户
   */
  async getAllUsers(): Promise<User[]> {
    await this.init()
    return await this.userTable!.getAll()
  }

  /**
   * 根据 ID 获取用户
   */
  async getUserById(id: string): Promise<User | undefined> {
    await this.init()
    return await this.userTable!.get(id)
  }

  /**
   * 创建用户
   */
  async createUser(userData: Omit<User, 'created_at' | 'updated_at'>): Promise<void> {
    await this.init()
    const now = Date.now()
    const user: User = {
      ...userData,
      created_at: now,
      updated_at: now
    }
    await this.userTable!.create(user)
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, updates: Partial<Omit<User, 'created_at' | 'updated_at'>>): Promise<void> {
    await this.init()
    const user = await this.userTable!.get(id)
    if (!user) throw new Error('User not found')
    
    const updatedUser: User = { 
      ...user, 
      ...updates, 
      updated_at: Date.now() 
    }
    await this.userTable!.create(updatedUser)
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<void> {
    await this.init()
    await this.userTable!.delete(id)
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats() {
    const users = await this.getAllUsers()
    return {
      total: users.length,
      // 由于当前 User 类型没有 status 字段，暂时返回总数
      active: users.length,
      inactive: 0
    }
  }
}

// 导出单例实例
export const userService = new UserService() 