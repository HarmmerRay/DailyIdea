import { userService } from "../utils/user-service"

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  try {
    switch (method) {
      case "GET": {
        const query = getQuery(event)
        const limit = query.limit ? parseInt(query.limit as string) : 30

        const tasks = await userService.getDailyTasks(limit)
        return {
          success: true,
          data: tasks,
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

        const taskId = await userService.saveDailyTask(date, title, summary, recipients, status)
        return {
          success: true,
          data: { id: taskId },
          message: "每日任务记录保存成功",
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