import type { NewsItem, SourceID } from '../types'

// 扩展NewsItem以包含平台信息
export interface ExtendedNewsItem extends NewsItem {
  platform: SourceID
  timestamp: number
}

export interface BusinessOpportunity {
  id: string
  title: string
  category: 'tech' | 'finance' | 'consumer' | 'policy' | 'social'
  description: string
  marketSize: 'small' | 'medium' | 'large' | 'massive'
  timeframe: 'immediate' | 'short' | 'medium' | 'long'
  confidence: number // 0-100
  risks: string[]
  relatedNews: ExtendedNewsItem[]
  actionItems: string[]
  timestamp: number
}

export interface AnalysisInput {
  newsItems: ExtendedNewsItem[]
  timeRange: {
    start: number
    end: number
  }
  platforms: SourceID[]
}

/**
 * AI商业机会分析的核心prompt模板
 */
export function createBusinessAnalysisPrompt(input: AnalysisInput): string {
  const newsText = input.newsItems.map((item, index) => 
    `${index + 1}. [${item.platform}] ${item.title} - ${item.url}`
  ).join('\n')

  return `
作为一位资深商业分析师，请分析以下${input.newsItems.length}条热点新闻，识别其中的商业机会。

新闻数据（时间范围：${new Date(input.timeRange.start).toISOString()} 到 ${new Date(input.timeRange.end).toISOString()}）：
${newsText}

请按以下格式输出分析结果，以JSON格式返回：

{
  "opportunities": [
    {
      "id": "唯一标识符",
      "title": "商业机会标题",
      "category": "tech|finance|consumer|policy|social",
      "description": "详细描述这个商业机会，包括市场需求、目标用户、解决的问题",
      "marketSize": "small|medium|large|massive",
      "timeframe": "immediate|short|medium|long",
      "confidence": 85,
      "risks": ["风险1", "风险2"],
      "relatedNewsIndexes": [1, 3, 5],
      "actionItems": ["具体行动建议1", "具体行动建议2"]
    }
  ],
  "summary": "本次分析的总体洞察和趋势判断"
}

分析要求：
1. 专注于可执行的商业机会，避免过于宏观的趋势描述
2. 考虑技术可行性、市场时机、竞争环境
3. 优先识别科技创新、消费升级、政策红利相关的机会
4. 每个机会的confidence评分要基于新闻热度、市场验证程度、执行难度
5. 最多输出5个最有价值的商业机会
6. 风险评估要实际且具体
7. 行动建议要可操作，适合创业者或投资者

请只返回JSON格式的结果，不要包含其他文字说明。
`
}

/**
 * 调用AI API进行商业机会分析
 */
export async function analyzeBusinessOpportunities(
  input: AnalysisInput,
  aiApiKey: string,
  aiModel: string = 'gpt-4'
): Promise<BusinessOpportunity[]> {
  const prompt = createBusinessAnalysisPrompt(input)
  
  try {
    // 这里可以集成不同的AI服务，如OpenAI、Claude、或本地模型
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的商业分析师，擅长从热点新闻中识别商业机会。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI API调用失败: ${response.status}`)
    }

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    
    return result.opportunities.map((opp: any) => ({
      ...opp,
      relatedNews: input.newsItems.filter((_, index) => 
        opp.relatedNewsIndexes?.includes(index + 1)
      ),
      timestamp: Date.now(),
    }))
  } catch (error) {
    console.error('AI分析失败:', error)
    throw new Error('商业机会分析失败')
  }
}

/**
 * 过滤和排序商业机会
 */
export function filterOpportunities(
  opportunities: BusinessOpportunity[],
  minConfidence: number = 70,
  categories?: string[]
): BusinessOpportunity[] {
  return opportunities
    .filter(opp => opp.confidence >= minConfidence)
    .filter(opp => !categories || categories.includes(opp.category))
    .sort((a, b) => b.confidence - a.confidence)
}

/**
 * 生成商业机会报告摘要
 */
export function generateOpportunityReport(opportunities: BusinessOpportunity[]): string {
  if (opportunities.length === 0) {
    return '今日未发现明显的商业机会，建议继续关注市场动态。'
  }

  const highConfidenceCount = opportunities.filter(opp => opp.confidence >= 80).length
  const categories = [...new Set(opportunities.map(opp => opp.category))]
  
  let report = `## 今日商业机会分析\n\n`
  report += `发现 ${opportunities.length} 个潜在商业机会，其中 ${highConfidenceCount} 个高确信度机会。\n\n`
  report += `涉及领域：${categories.join('、')}\n\n`
  
  opportunities.slice(0, 3).forEach((opp, index) => {
    report += `### ${index + 1}. ${opp.title}\n`
    report += `**领域**：${opp.category} | **市场规模**：${opp.marketSize} | **确信度**：${opp.confidence}%\n\n`
    report += `${opp.description}\n\n`
    if (opp.actionItems.length > 0) {
      report += `**行动建议**：\n`
      opp.actionItems.forEach(item => report += `- ${item}\n`)
      report += `\n`
    }
  })

  return report
}