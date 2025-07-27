import dayjs from "dayjs"
import { pushRecordsService } from "../../utils/push-records-service"

export default defineEventHandler(async (_event) => {
  try {
    // Get pending push records from service
    const realRecords = await pushRecordsService.getPendingRecords()

    // If we have real pending records, return them
    if (realRecords.length > 0) {
      return realRecords
    }

    // Otherwise, create mock data for demonstration
    const tomorrow = dayjs().add(1, "day")
    const scheduledTime = tomorrow.hour(10).minute(0).second(0)
    const mockRecords = [
      {
        id: `tomorrow_${Date.now()}_1`,
        title: "新能源汽车行业前瞻 - 政策利好与技术突破",
        summary: "基于最新政策动向和技术发展趋势，新能源汽车板块有望迎来新一轮上涨。重点关注电池技术、充电基础设施等细分领域。",
        sentAt: scheduledTime.toISOString(),
        status: "pending" as const,
        opportunities: [
          { title: "电池技术股", category: "tech", confidence: 88 },
          { title: "充电桩建设", category: "tech", confidence: 82 },
          { title: "新能源车企", category: "consumer", confidence: 79 },
        ],
      },
      {
        id: `tomorrow_${Date.now()}_2`,
        title: "医疗健康板块机遇 - 创新药与医疗器械",
        summary: "随着人口老龄化和健康意识提升，医疗健康板块长期向好。关注创新药研发、高端医疗器械等投资方向。",
        sentAt: scheduledTime.toISOString(),
        status: "pending" as const,
        opportunities: [
          { title: "创新药研发", category: "tech", confidence: 90 },
          { title: "医疗器械", category: "tech", confidence: 84 },
          { title: "健康服务", category: "consumer", confidence: 76 },
        ],
      },
      {
        id: `tomorrow_${Date.now()}_3`,
        title: "金融科技趋势分析 - 数字货币与区块链应用",
        summary: "央行数字货币试点扩大，区块链技术在金融领域应用加速。关注相关技术公司和金融机构投资机会。",
        sentAt: scheduledTime.toISOString(),
        status: "pending" as const,
        opportunities: [
          { title: "区块链技术", category: "tech", confidence: 85 },
          { title: "金融科技", category: "finance", confidence: 81 },
          { title: "数字支付", category: "finance", confidence: 77 },
        ],
      },
    ]

    return mockRecords
  } catch (error) {
    console.error("Error fetching tomorrow push records:", error)
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch pending push records",
    })
  }
})
