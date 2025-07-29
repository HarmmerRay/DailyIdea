import { userService } from "../services/user-service"

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  try {
    // 初始化用户服务
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
        const users = await userService.getAllUsers()
        return {
          success: true,
          data: users,
        }
      }

      case "POST": {
        const body = await readBody(event)
        const { name, avatar } = body

        if (!name) {
          return {
            success: false,
            error: "用户名不能为空",
          }
        }

        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await userService.createUser({ id: userId, name, avatar })
        return {
          success: true,
          data: { id: userId },
          message: "用户创建成功",
        }
      }

      case "PUT": {
        const body = await readBody(event)
        const { id, name, avatar } = body

        if (!id) {
          return {
            success: false,
            error: "用户ID不能为空",
          }
        }

        await userService.updateUser(id, { name, avatar })
        return {
          success: true,
          message: "用户更新成功",
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

        await userService.deleteUser(id)
        return {
          success: true,
          message: "用户删除成功",
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