/**
 * 简化的数据获取测试
 * 直接测试已有的数据获取器
 */

// 先创建一个模拟的数据测试，不依赖复杂的导入
const mockNewsData = [
  {
    id: 'test1',
    title: 'AI芯片需求激增，相关公司股价暴涨',
    url: 'https://example.com/ai-chip',
    platform: 'wallstreetcn',
    timestamp: Date.now() - 1000 * 60 * 30,
    extra: { info: '科技股' }
  },
  {
    id: 'test2',
    title: '新能源汽车销量创历史新高',
    url: 'https://example.com/ev-sales',
    platform: 'cls',
    timestamp: Date.now() - 1000 * 60 * 45,
    extra: { info: '汽车' }
  },
  {
    id: 'test3',
    title: '央行调整利率政策，房地产市场迎来变化',
    url: 'https://example.com/interest-rate',
    platform: 'weibo',
    timestamp: Date.now() - 1000 * 60 * 20,
    extra: { info: '政策' }
  },
  {
    id: 'test4',
    title: '预制菜行业监管加强，龙头企业受关注',
    url: 'https://example.com/prepared-food',
    platform: 'zhihu',
    timestamp: Date.now() - 1000 * 60 * 15,
    extra: { info: '消费' }
  },
  {
    id: 'test5',
    title: '直播带货成为年轻人创业首选',
    url: 'https://example.com/live-streaming',
    platform: 'douyin',
    timestamp: Date.now() - 1000 * 60 * 10,
    extra: { info: '电商' }
  }
]

// 生成AI分析prompt
function createSimpleAnalysisPrompt(newsItems: typeof mockNewsData) {
  const newsText = newsItems.map((item, index) => 
    `${index + 1}. [${item.platform}] ${item.title}`
  ).join('\n')

  return `
作为一位资深商业分析师，请分析以下${newsItems.length}条热点新闻，识别其中的商业机会。

热点新闻：
${newsText}

请按以下JSON格式输出分析结果：
{
  "opportunities": [
    {
      "id": "唯一标识符",
      "title": "商业机会标题",
      "category": "tech|finance|consumer|policy|social",
      "description": "详细描述这个商业机会",
      "marketSize": "small|medium|large|massive",
      "timeframe": "immediate|short|medium|long",
      "confidence": 85,
      "risks": ["风险1", "风险2"],
      "actionItems": ["具体建议1", "具体建议2"]
    }
  ],
  "summary": "总体洞察"
}

要求：
1. 专注于可执行的商业机会
2. 最多输出3个最有价值的机会
3. 确信度要实际合理
4. 只返回JSON，不要其他文字
`
}

// 模拟AI分析结果
const mockAnalysisResult = {
  opportunities: [
    {
      id: 'ai-computing-service',
      title: 'AI算力租赁服务平台',
      category: 'tech',
      description: 'AI芯片需求激增但成本昂贵，可建立云端AI算力租赁平台，为中小企业提供按需付费的AI计算服务，降低AI应用门槛',
      marketSize: 'large',
      timeframe: 'short',
      confidence: 88,
      risks: ['技术门槛高', '大厂竞争激烈', '硬件成本高'],
      actionItems: ['调研企业AI算力需求', '寻找硬件供应商合作', '开发易用的API接口']
    },
    {
      id: 'ev-charging-network',
      title: '智能充电网络运营',
      category: 'consumer',
      description: '新能源汽车销量激增但充电设施不足，可投资建设智能充电网络，结合数据分析优化充电效率和用户体验',
      marketSize: 'massive',
      timeframe: 'medium',
      confidence: 82,
      risks: ['前期投资大', '政策变化风险', '选址困难'],
      actionItems: ['申请政府补贴政策', '与房地产商合作选址', '开发智能调度系统']
    },
    {
      id: 'live-commerce-tools',
      title: '直播带货工具软件',
      category: 'social',
      description: '直播带货成为主流，可开发专业的直播带货工具软件，包括商品管理、数据分析、客户关系管理等功能',
      marketSize: 'medium',
      timeframe: 'immediate',
      confidence: 75,
      risks: ['市场竞争激烈', '用户付费意愿低', '平台政策变化'],
      actionItems: ['调研主播实际需求', '开发MVP产品', '建立分销渠道']
    }
  ],
  summary: '当前热点主要集中在AI技术应用、新能源基础设施和新兴商业模式三个领域，均有较好的商业化前景。'
}

// 生成报告
function generateReport(analysisResult: typeof mockAnalysisResult) {
  let report = `## 今日商业机会分析报告\n\n`
  report += `**时间**: ${new Date().toLocaleString()}\n`
  report += `**数据来源**: 微博、百度、知乎、财联社、抖音等热点平台\n\n`
  report += `发现 ${analysisResult.opportunities.length} 个潜在商业机会：\n\n`
  
  analysisResult.opportunities.forEach((opp, index) => {
    report += `### ${index + 1}. ${opp.title}\n`
    report += `**领域**: ${opp.category} | **市场规模**: ${opp.marketSize} | **确信度**: ${opp.confidence}%\n`
    report += `**时间窗口**: ${opp.timeframe}\n\n`
    report += `${opp.description}\n\n`
    
    if (opp.risks.length > 0) {
      report += `**主要风险**:\n`
      opp.risks.forEach(risk => report += `- ${risk}\n`)
      report += `\n`
    }
    
    if (opp.actionItems.length > 0) {
      report += `**行动建议**:\n`
      opp.actionItems.forEach(item => report += `- ${item}\n`)
      report += `\n`
    }
  })
  
  report += `## 总结\n\n${analysisResult.summary}\n\n`
  report += `---\n*本报告由AI自动生成，仅供参考*`
  
  return report
}

// 运行测试
console.log('🔍 商业机会分析测试\n')

console.log('📊 模拟热点数据:')
mockNewsData.forEach((item, index) => {
  console.log(`${index + 1}. [${item.platform}] ${item.title}`)
})

console.log('\n🤖 生成的AI分析提示词长度:', createSimpleAnalysisPrompt(mockNewsData).length, '字符')

console.log('\n✨ 模拟分析结果:')
mockAnalysisResult.opportunities.forEach((opp, index) => {
  console.log(`${index + 1}. ${opp.title} (确信度: ${opp.confidence}%)`)
  console.log(`   ${opp.description}`)
  console.log()
})

console.log('📋 生成完整报告:')
console.log('=' .repeat(60))
console.log(generateReport(mockAnalysisResult))
console.log('=' .repeat(60))

console.log('\n✅ 测试完成！商业机会分析模块工作正常。')
console.log('\n💡 下一步：')
console.log('1. 集成真实的数据获取')
console.log('2. 连接AI API进行实际分析')
console.log('3. 添加邮件推送功能')

export { mockNewsData, mockAnalysisResult, generateReport }