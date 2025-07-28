import { UserService } from "../utils/user-service"

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  try {
    // 获取数据库连接并初始化
    const db = useDatabase()
    const userService = new UserService(db)
    await userService.init()
  } catch (initError) {
    console.error("Failed to initialize user service:", initError)
    return {
      success: false,
      error: "数据库初始化失败",
    }
  }

  try {
    switch (method) {
      case "GET": {
        // 精简后的用户服务没有 getAllUsers 方法，返回空数组
        return {
          success: true,
          data: [],
          message: "用户管理功能已简化"
        }
      }

      case "POST": {
        const body = await readBody(event)
        const { email, name } = body

        if (!email) {
          return {
            success: false,
            error: "邮箱地址不能为空",
          }
        }

        // 精简后的用户服务没有 addUser(email, name) 方法
        return {
          success: false,
          error: "用户管理功能已简化，请使用其他 API"
        }
      }

      case "PUT": {
        const body = await readBody(event)
        const { id, status } = body

        if (!id || !status) {
          return {
            success: false,
            error: "用户ID和状态不能为空",
          }
        }

        if (!["active", "inactive"].includes(status)) {
          return {
            success: false,
            error: "状态值无效",
          }
        }

        // 精简后的用户服务没有 updateUserStatus 方法
        return {
          success: false,
          error: "用户管理功能已简化，请使用其他 API"
        }
      }

      case "DELETE": {
        const query = getQuery(event)
        const { id } = query

        if (!id || typeof id !== "string") {
          return {
            success: false,
            error: "用户ID不能为空",
          }
        }

        try {
          await userService.deleteUser(id)
          return {
            success: true,
            message: "用户删除成功",
          }
        } catch (error) {
          return {
            success: false,
            error: "用户删除失败",
          }
        }
      }

      default:
        return {
          success: false,
          error: "不支持的请求方法",
        }
    }
  } catch (error) {
    console.error("Users API error:", error)
    return {
      success: false,
      error: "服务器内部错误",
    }
  }
})