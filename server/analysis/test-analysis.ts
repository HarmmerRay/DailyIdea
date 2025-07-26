import { analyzeBusinessOpportunities, generateOpportunityReport, type ExtendedNewsItem, type AnalysisInput } from './business-opportunity'

/**
 * 模拟测试数据 - 基于当前热点新闻
 */
export const mockNewsData: ExtendedNewsItem[] = [
  {
    id: '1',
    title: 'AI芯片需求暴涨，英伟达股价再创新高',
    url: 'https://example.com/ai-chip-demand',
    platform: 'wallstreetcn',
    timestamp: Date.now() - 1000 * 60 * 30, // 30分钟前
    extra: {
      info: '科技股',
      hover: 'AI芯片需求激增推动英伟达业绩超预期'
    }
  },
  {
    id: '2', 
    title: '新能源汽车充电桩缺口巨大，政策支持力度加大',
    url: 'https://example.com/ev-charging',
    platform: 'cls',
    timestamp: Date.now() - 1000 * 60 * 60, // 1小时前
    extra: {
      info: '政策',
      hover: '充电基础设施建设成为新能源汽车发展瓶颈'
    }
  },
  {
    id: '3',
    title: '短视频直播带货成年轻人创业新选择',
    url: 'https://example.com/live-commerce',
    platform: 'douyin',
    timestamp: Date.now() - 1000 * 60 * 45, // 45分钟前
    extra: {
      info: '热门',
      hover: '直播电商市场规模持续扩大，门槛相对较低'
    }
  },
  {
    id: '4',
    title: '老龄化加剧，智能养老设备需求激增',
    url: 'https://example.com/smart-elderly-care',
    platform: 'zhihu',
    timestamp: Date.now() - 1000 * 60 * 20, // 20分钟前
    extra: {
      info: '社会',
      hover: '人口老龄化趋势下的新兴市场机会'
    }
  },
  {
    id: '5',
    title: '元宇宙概念降温，VR设备销量不及预期',
    url: 'https://example.com/vr-sales-decline',
    platform: 'ithome',
    timestamp: Date.now() - 1000 * 60 * 15, // 15分钟前
    extra: {
      info: '科技',
      hover: 'VR市场遇冷，消费者接受度仍待提升'
    }
  },
  {
    id: '6',
    title: '预制菜市场火爆，食品安全监管趋严',
    url: 'https://example.com/prepared-food-market',
    platform: 'baidu',
    timestamp: Date.now() - 1000 * 60 * 10, // 10分钟前
    extra: {
      info: '消费',
      hover: '预制菜行业快速发展，监管标准逐步完善'
    }
  }
]

/**
 * 创建测试分析输入
 */
export function createTestAnalysisInput(): AnalysisInput {
  const now = Date.now()
  return {
    newsItems: mockNewsData,
    timeRange: {
      start: now - 1000 * 60 * 60 * 2, // 2小时前
      end: now
    },
    platforms: ['wallstreetcn', 'cls', 'douyin', 'zhihu', 'ithome', 'baidu']
  }
}

/**
 * 运行测试分析（需要AI API密钥）
 */
export async function runTestAnalysis(apiKey?: string) {
  console.log('🔍 开始商业机会分析测试...\n')
  
  const input = createTestAnalysisInput()
  
  console.log('📊 输入数据:')
  console.log(`- 新闻条数: ${input.newsItems.length}`)
  console.log(`- 时间范围: ${new Date(input.timeRange.start).toLocaleString()} ~ ${new Date(input.timeRange.end).toLocaleString()}`)
  console.log(`- 数据源: ${input.platforms.join(', ')}\n`)
  
  console.log('📰 热点新闻:')
  input.newsItems.forEach((item, index) => {
    console.log(`${index + 1}. [${item.platform}] ${item.title}`)
  })
  console.log()
  
  if (!apiKey) {
    console.log('⚠️ 未提供AI API密钥，显示模拟分析结果...\n')
    showMockAnalysisResult()
    return
  }
  
  try {
    console.log('🤖 正在调用AI进行分析...')
    const opportunities = await analyzeBusinessOpportunities(input, apiKey)
    
    console.log(`✅ 分析完成，发现 ${opportunities.length} 个商业机会:\n`)
    
    opportunities.forEach((opp, index) => {
      console.log(`${index + 1}. ${opp.title}`)
      console.log(`   领域: ${opp.category} | 市场规模: ${opp.marketSize} | 确信度: ${opp.confidence}%`)
      console.log(`   时间窗口: ${opp.timeframe}`)
      console.log(`   描述: ${opp.description}`)
      console.log(`   风险: ${opp.risks.join(', ')}`)
      console.log(`   建议: ${opp.actionItems.join('; ')}`)
      console.log()
    })
    
    const report = generateOpportunityReport(opportunities)
    console.log('📋 生成的报告:')
    console.log(report)
    
  } catch (error) {
    console.error('❌ 分析失败:', error)
  }
}

/**
 * 显示模拟分析结果
 */
function showMockAnalysisResult() {
  const mockOpportunities = [
    {
      id: 'ai-chip-opportunity',
      title: 'AI计算服务平台创业机会',
      category: 'tech' as const,
      description: 'AI芯片需求暴涨但价格昂贵，可开发云端AI计算服务平台，为中小企业提供按需付费的AI算力',
      marketSize: 'large' as const,
      timeframe: 'short' as const,
      confidence: 85,
      risks: ['技术门槛高', '资金需求大', '巨头竞争激烈'],
      relatedNews: [mockNewsData[0]],
      actionItems: [
        '调研主要AI模型的计算需求',
        '评估云服务基础设施成本',
        '寻找技术合作伙伴'
      ],
      timestamp: Date.now()
    },
    {
      id: 'ev-charging-opportunity',
      title: '社区智能充电桩运营',
      category: 'consumer' as const,
      description: '新能源汽车普及但充电桩不足，可在老旧小区安装智能充电桩，提供充电服务和增值服务',
      marketSize: 'medium' as const,
      timeframe: 'medium' as const,
      confidence: 78,
      risks: ['政策变化风险', '物业协调难度', '投资回收周期长'],
      relatedNews: [mockNewsData[1]],
      actionItems: [
        '联系物业公司建立合作',
        '申请政府补贴政策',
        '开发智能管理系统'
      ],
      timestamp: Date.now()
    },
    {
      id: 'elderly-care-opportunity',
      title: '智能养老设备定制服务',
      category: 'social' as const,
      description: '老龄化加剧带来智能养老需求，可提供个性化智能养老设备定制和上门服务',
      marketSize: 'large' as const,
      timeframe: 'short' as const,
      confidence: 82,
      risks: ['用户接受度待验证', '服务标准化困难', '人员培训成本高'],
      relatedNews: [mockNewsData[3]],
      actionItems: [
        '深入调研老年人实际需求',
        '开发简化的智能设备',
        '建立服务人员培训体系'
      ],
      timestamp: Date.now()
    }
  ]
  
  console.log(`✨ 模拟分析结果 - 发现 ${mockOpportunities.length} 个商业机会:\n`)
  
  mockOpportunities.forEach((opp, index) => {
    console.log(`${index + 1}. ${opp.title}`)
    console.log(`   领域: ${opp.category} | 市场规模: ${opp.marketSize} | 确信度: ${opp.confidence}%`)
    console.log(`   时间窗口: ${opp.timeframe}`)
    console.log(`   描述: ${opp.description}`)
    console.log(`   风险: ${opp.risks.join(', ')}`)
    console.log(`   建议: ${opp.actionItems.join('; ')}`)
    console.log()
  })
  
  const report = generateOpportunityReport(mockOpportunities)
  console.log('📋 生成的报告:')
  console.log(report)
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const apiKey = process.env.OPENAI_API_KEY
  runTestAnalysis(apiKey)
}