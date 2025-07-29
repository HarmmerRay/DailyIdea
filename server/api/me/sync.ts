import process from "node:process"
import { UserService } from "#/utils/user-service"

export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.user
    const db = useDatabase()
    if (!db) throw new Error("Not found database")
    const userService = new UserService(db)
    if (process.env.INIT_TABLE !== "false") await userService.init()
    if (event.method === "GET") {
      const { data, updated } = await userService.getData(id)
      return {
        data: data ? JSON.parse(data) : undefined,
        updatedTime: updated,
      }
    } else if (event.method === "POST") {
      const body = await readBody(event)
      verifyPrimitiveMetadata(body)
      const { updatedTime, data } = body
      await userService.setData(id, JSON.stringify(data), updatedTime)
      return {
        success: true,
        updatedTime,
      }
    }
  } catch (e) {
    logger.error(e)
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "Internal Server Error",
    })
  }
})
