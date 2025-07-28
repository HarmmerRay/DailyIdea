import { UserService } from "../utils/user-service"

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  try {
    // 获取数据库连接
    const db = useDatabase()
    const userService = new UserService(db)

    switch (method) {
      case "GET": {
        const query = getQuery(event)
        const limit = query.limit ? parseInt(query.limit as string) : 30

        // 暂时返回空数组，因为精简后的用户服务没有 getDailyTasks 方法
        return {
          success: true,
          data: [],
          message: "每日任务功能已简化，请使用其他 API"
        }
      }

      case "POST": {
        const body = await readBody(event)
        const { date, title, summary, recipients, status = "sent" } = body

        if (!date || !title || !recipients) {
          return {
            success: false,
            error: "日期、标题和收件人不能为空",
          }
        }

        // 暂时返回错误，因为精简后的用户服务没有 saveDailyTask 方法
        return {
          success: false,
          error: "每日任务功能已简化，请使用其他 API"
        }
      }

      default:
        return {
          success: false,
          error: "不支持的请求方法",
        }
    }
  } catch (error) {
    console.error("Daily tasks API error:", error)
    return {
      success: false,
      error: "服务器内部错误",
    }
  }
})