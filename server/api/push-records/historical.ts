import { pushRecordsService } from "../../utils/push-records-service"

export default defineEventHandler(async (event) => {
  try {
    const records = await pushRecordsService.getHistoricalRecords()
    return {
      success: true,
      data: records,
    }
  } catch (error) {
    console.error("Error getting historical push records:", error)
    return {
      success: false,
      error: "获取历史推送记录失败",
    }
  }
})