import dayjs from "dayjs"
import { pushRecordsService } from "../../utils/push-records-service"

export default defineEventHandler(async (_event) => {
  try {
    // Get today's push records from service
    const realRecords = await pushRecordsService.getTodayRecords()

    // If we have real records, return them
    if (realRecords.length > 0) {
      return realRecords
    }

    // Otherwise, create mock data for demonstration
    const today = dayjs()
    const mockRecords = [
      {
        id: `today_${Date.now()}_1`,
        title: "科技股市场机遇分析 - AI与半导体板块看涨",
        summary: "基于今日热点新闻分析，AI芯片需求持续上升，建议关注相关概念股投资机会。英伟达、AMD等公司业绩预期良好。",
        sentAt: today.hour(10).minute(0).second(0).toISOString(),
        status: "sent" as const,
        opportunities: [
          { title: "AI芯片投资", category: "tech", confidence: 85 },
          { title: "半导体ETF", category: "finance", confidence: 78 },
          { title: "云计算服务", category: "tech", confidence: 72 },
        ],
      },
      {
        id: `today_${Date.now()}_2`,
        title: "消费板块复苏信号 - 电商平台销售数据走强",
        summary: "多个电商平台发布Q4销售数据，消费回暖趋势明显。建议关注消费类股票和相关供应链投资机会。",
        sentAt: today.hour(15).minute(30).second(0).toISOString(),
        status: "sent" as const,
        opportunities: [
          { title: "电商平台股", category: "consumer", confidence: 80 },
          { title: "物流供应链", category: "consumer", confidence: 75 },
          { title: "品牌消费品", category: "consumer", confidence: 70 },
        ],
      },
    ]

    return mockRecords
  } catch (error) {
    console.error("Error fetching today push records:", error)
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch push records",
    })
  }
})
