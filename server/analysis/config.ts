/**
 * 商业机会分析系统配置管理
 */

export interface BusinessAnalysisConfig {
  // 邮件配置
  email: {
    from: string
    to: string | string[]
    smtpHost: string
    smtpPort: number
    smtpUser: string
    smtpPassword: string
    maxRetries: number
    retryDelay: number
  }
  
  // AI分析配置
  ai: {
    apiKey?: string
    model: string
    maxTokens: number
    temperature: number
  }
  
  // 数据采集配置
  dataCollection: {
    timeRangeHours: number
    maxItems: number
    priorityColumns: string[]
    sources: string[]
  }
  
  // 定时任务配置
  scheduler: {
    enabled: boolean
    cronTime: string // 每日上午10点: '0 10 * * *'
    timezone: string
  }
}

/**
 * 从环境变量加载配置
 */
export function loadConfigFromEnv(): BusinessAnalysisConfig {
  return {
    email: {
      from: process.env.EMAIL_FROM || 'zhao131804@gmail.com',
      to: process.env.EMAIL_TO || '2624773733@qq.com',
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      smtpUser: process.env.EMAIL_FROM || 'zhao131804@gmail.com',
      smtpPassword: process.env.GMAIL_APP_PASSWORD || '',
      maxRetries: parseInt(process.env.EMAIL_MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.EMAIL_RETRY_DELAY || '5000')
    },
    
    ai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.AI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '3000'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
    },
    
    dataCollection: {
      timeRangeHours: parseInt(process.env.DATA_TIME_RANGE_HOURS || '24'),
      maxItems: parseInt(process.env.DATA_MAX_ITEMS || '100'),
      priorityColumns: (process.env.DATA_PRIORITY_COLUMNS || 'finance,tech,china').split(','),
      sources: (process.env.DATA_SOURCES || 'weibo,baidu,zhihu,wallstreetcn-quick,cls-telegraph').split(',')
    },
    
    scheduler: {
      enabled: process.env.SCHEDULER_ENABLED?.toLowerCase() === 'true',
      cronTime: process.env.SCHEDULER_CRON_TIME || '0 10 * * *', // 每日上午10点
      timezone: process.env.SCHEDULER_TIMEZONE || 'Asia/Shanghai'
    }
  }
}

/**
 * 验证配置完整性
 */
export function validateConfig(config: BusinessAnalysisConfig): string[] {
  const errors: string[] = []
  
  // 验证邮件配置
  if (!config.email.smtpPassword) {
    errors.push('缺少Gmail应用专用密码 (GMAIL_APP_PASSWORD)')
  }
  
  if (!config.email.from || !config.email.to) {
    errors.push('缺少邮件发送方或接收方地址')
  }
  
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(config.email.from)) {
    errors.push(`发送方邮箱格式无效: ${config.email.from}`)
  }
  
  const recipients = Array.isArray(config.email.to) ? config.email.to : [config.email.to]
  for (const email of recipients) {
    if (!emailRegex.test(email)) {
      errors.push(`接收方邮箱格式无效: ${email}`)
    }
  }
  
  // 验证端口号
  if (config.email.smtpPort <= 0 || config.email.smtpPort > 65535) {
    errors.push(`SMTP端口号无效: ${config.email.smtpPort}`)
  }
  
  // 验证数据采集配置
  if (config.dataCollection.timeRangeHours <= 0) {
    errors.push('数据采集时间范围必须大于0')
  }
  
  if (config.dataCollection.maxItems <= 0) {
    errors.push('数据采集最大条数必须大于0')
  }
  
  return errors
}

/**
 * 显示当前配置
 */
export function displayConfig(config: BusinessAnalysisConfig): void {
  console.log('📋 当前配置：\n')
  
  console.log('📧 邮件配置：')
  console.log(`   发送方: ${config.email.from}`)
  console.log(`   接收方: ${Array.isArray(config.email.to) ? config.email.to.join(', ') : config.email.to}`)
  console.log(`   SMTP服务器: ${config.email.smtpHost}:${config.email.smtpPort}`)
  console.log(`   重试次数: ${config.email.maxRetries}`)
  console.log(`   重试延迟: ${config.email.retryDelay}ms`)
  console.log(`   密码状态: ${config.email.smtpPassword ? '✅ 已设置' : '❌ 未设置'}`)
  console.log()
  
  console.log('🤖 AI配置：')
  console.log(`   API密钥: ${config.ai.apiKey ? '✅ 已设置' : '⚠️ 未设置（将使用模拟数据）'}`)
  console.log(`   模型: ${config.ai.model}`)
  console.log(`   最大tokens: ${config.ai.maxTokens}`)
  console.log(`   温度参数: ${config.ai.temperature}`)
  console.log()
  
  console.log('📊 数据采集：')
  console.log(`   时间范围: ${config.dataCollection.timeRangeHours} 小时`)
  console.log(`   最大条数: ${config.dataCollection.maxItems}`)
  console.log(`   优先分类: ${config.dataCollection.priorityColumns.join(', ')}`)
  console.log(`   数据源: ${config.dataCollection.sources.slice(0, 3).join(', ')}${config.dataCollection.sources.length > 3 ? ` 等${config.dataCollection.sources.length}个` : ''}`)
  console.log()
  
  console.log('⏰ 定时任务：')
  console.log(`   状态: ${config.scheduler.enabled ? '✅ 启用' : '❌ 禁用'}`)
  console.log(`   执行时间: ${config.scheduler.cronTime}`)
  console.log(`   时区: ${config.scheduler.timezone}`)
}

/**
 * 创建默认配置
 */
export function createDefaultConfig(): BusinessAnalysisConfig {
  return {
    email: {
      from: 'zhao131804@gmail.com',
      to: '2624773733@qq.com',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'zhao131804@gmail.com',
      smtpPassword: '',
      maxRetries: 3,
      retryDelay: 5000
    },
    
    ai: {
      model: 'gpt-4',
      maxTokens: 3000,
      temperature: 0.7
    },
    
    dataCollection: {
      timeRangeHours: 24,
      maxItems: 100,
      priorityColumns: ['finance', 'tech', 'china'],
      sources: ['weibo', 'baidu', 'zhihu', 'wallstreetcn-quick', 'cls-telegraph', 'xueqiu-hotstock']
    },
    
    scheduler: {
      enabled: false,
      cronTime: '0 10 * * *', // 每日上午10点
      timezone: 'Asia/Shanghai'
    }
  }
}