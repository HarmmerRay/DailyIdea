import { createDataAggregator, getBusinessAnalysisData, type DataAggregationConfig } from './data-aggregator'
import { analyzeBusinessOpportunities, createBusinessAnalysisPrompt, generateOpportunityReport } from './business-opportunity'

/**
 * 测试数据聚合功能
 */
export async function testDataAggregation() {
  console.log('🔧 测试数据聚合功能...\n')
  
  try {
    // 创建一个小规模的测试配置
    const testConfig: Partial<DataAggregationConfig> = {
      sources: ['weibo', 'baidu', 'zhihu', 'wallstreetcn-quick', 'cls-telegraph'],
      timeRangeHours: 1, // 最近1小时
      maxItems: 20,
      useCache: true,
      priorityColumns: ['finance', 'china']
    }
    
    const aggregator = createDataAggregator(testConfig)
    
    console.log('📊 开始聚合数据...')
    const result = await aggregator.aggregateData()
    
    console.log('\n✅ 聚合结果:')
    console.log(`- 总新闻数: ${result.totalItems}`)
    console.log(`- 数据源数: ${result.sources.length}`)
    console.log(`- 时间范围: ${new Date(result.timeRange.start).toLocaleString()} ~ ${new Date(result.timeRange.end).toLocaleString()}`)
    console.log(`- 错误数: ${result.errors.length}`)
    
    if (result.errors.length > 0) {
      console.log('\n⚠️ 错误详情:')
      result.errors.forEach(error => console.log(`  - ${error}`))
    }
    
    console.log('\n📰 样本新闻:')
    result.newsItems.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. [${item.platform}] ${item.title}`)
      console.log(`   URL: ${item.url}`)
      console.log(`   时间: ${new Date(item.timestamp).toLocaleString()}`)
      console.log()
    })
    
    // 获取数据源统计
    const stats = await aggregator.getSourceStats()
    console.log('📈 数据源统计:')
    Object.entries(stats).forEach(([sourceId, stat]) => {
      console.log(`  ${stat.platform} (${sourceId}): ${stat.count} 条, 最新: ${new Date(stat.latestUpdate).toLocaleString()}`)
    })
    
    return result
    
  } catch (error) {
    console.error('❌ 数据聚合测试失败:', error)
    throw error
  }
}

/**
 * 测试完整的商业分析流程
 */
export async function testFullBusinessAnalysis(apiKey?: string) {
  console.log('\n🚀 测试完整商业分析流程...\n')
  
  try {
    // 1. 获取实时数据
    console.log('1️⃣ 获取实时热点数据...')
    const aggregationResult = await getBusinessAnalysisData(2) // 最近2小时
    
    console.log(`✅ 获取到 ${aggregationResult.totalItems} 条热点新闻`)
    
    if (aggregationResult.totalItems === 0) {
      console.log('⚠️ 没有获取到数据，可能是缓存为空或数据源暂时不可用')
      return
    }
    
    // 2. 显示数据样本
    console.log('\n📊 数据样本预览:')
    aggregationResult.newsItems.slice(0, 8).forEach((item, index) => {
      console.log(`${index + 1}. [${item.platform}] ${item.title}`)
    })
    
    // 3. 生成AI分析提示词
    console.log('\n2️⃣ 生成AI分析提示词...')
    const analysisInput = {
      newsItems: aggregationResult.newsItems,
      timeRange: aggregationResult.timeRange,
      platforms: aggregationResult.sources
    }
    
    const prompt = createBusinessAnalysisPrompt(analysisInput)
    console.log(`✅ 生成了 ${prompt.length} 字符的分析提示词`)
    
    // 4. 执行AI分析（如果有API密钥）
    if (apiKey) {
      console.log('\n3️⃣ 执行AI商业机会分析...')
      try {
        const opportunities = await analyzeBusinessOpportunities(analysisInput, apiKey)
        
        console.log(`✅ 分析完成，发现 ${opportunities.length} 个商业机会\n`)
        
        opportunities.forEach((opp, index) => {
          console.log(`${index + 1}. ${opp.title}`)
          console.log(`   领域: ${opp.category} | 确信度: ${opp.confidence}% | 市场: ${opp.marketSize}`)
          console.log(`   描述: ${opp.description}`)
          console.log(`   风险: ${opp.risks.join(', ')}`)
          console.log(`   建议: ${opp.actionItems.slice(0, 2).join('; ')}`)
          console.log()
        })
        
        // 5. 生成报告
        console.log('4️⃣ 生成分析报告...')
        const report = generateOpportunityReport(opportunities)
        console.log('\n📋 完整报告:')
        console.log('=' .repeat(50))
        console.log(report)
        console.log('=' .repeat(50))
        
      } catch (error) {
        console.error('❌ AI分析失败:', error)
      }
    } else {
      console.log('\n⚠️ 未提供AI API密钥，跳过AI分析步骤')
      console.log('\n💡 如需测试完整流程，请设置环境变量:')
      console.log('   export OPENAI_API_KEY="your-api-key"')
      console.log('   然后重新运行测试')
    }
    
  } catch (error) {
    console.error('❌ 完整流程测试失败:', error)
    throw error
  }
}

/**
 * 快速数据获取测试（用于验证数据聚合器是否工作）
 */
export async function quickDataTest() {
  console.log('⚡ 快速数据获取测试...\n')
  
  try {
    const result = await getBusinessAnalysisData(0.5) // 最近30分钟
    
    console.log(`📊 结果: ${result.totalItems} 条新闻, ${result.sources.length} 个数据源`)
    console.log(`⏰ 时间: ${new Date(result.timeRange.start).toLocaleString()} ~ ${new Date(result.timeRange.end).toLocaleString()}`)
    
    if (result.newsItems.length > 0) {
      console.log('\n📰 最新3条:')
      result.newsItems.slice(0, 3).forEach((item, index) => {
        console.log(`${index + 1}. [${item.platform}] ${item.title}`)
      })
    } else {
      console.log('\n⚠️ 没有获取到数据')
    }
    
    return result.totalItems > 0
    
  } catch (error) {
    console.error('❌ 快速测试失败:', error)
    return false
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] || 'full'
  const apiKey = process.env.OPENAI_API_KEY
  
  switch (mode) {
    case 'quick':
      quickDataTest()
      break
    case 'aggregate':
      testDataAggregation()
      break
    case 'full':
    default:
      testFullBusinessAnalysis(apiKey)
      break
  }
}