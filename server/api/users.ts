import { userService } from "../utils/user-service"

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  try {
    // Initialize tables on first request
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
        const { email, name } = body

        if (!email) {
          return {
            success: false,
            error: "邮箱地址不能为空",
          }
        }

        // Check if email already exists
        const existingUsers = await userService.getAllUsers()
        const emailExists = existingUsers.some(user => user.email === email)

        if (emailExists) {
          return {
            success: false,
            error: "邮箱地址已存在",
          }
        }

        const userId = await userService.addUser(email, name)
        return {
          success: true,
          data: { id: userId },
          message: "用户添加成功",
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

        const success = await userService.updateUserStatus(id, status)
        if (success) {
          return {
            success: true,
            message: "用户状态更新成功",
          }
        } else {
          return {
            success: false,
            error: "用户状态更新失败",
          }
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

        const success = await userService.deleteUser(id)
        if (success) {
          return {
            success: true,
            message: "用户删除成功",
          }
        } else {
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