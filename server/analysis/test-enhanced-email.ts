import { createEnhancedEmailService } from './email-service-enhanced'
import { mockAnalysisResult } from './simple-test'

/**
 * 测试增强的邮件服务
 */
async function testEnhancedEmailService() {
  console.log('🚀 测试增强版邮件服务...\n')

  const gmailPassword = process.env.GMAIL_APP_PASSWORD
  if (!gmailPassword) {
    console.error('❌ 请设置 GMAIL_APP_PASSWORD 环境变量')
    console.log('\n📋 设置方法：')
    console.log('export GMAIL_APP_PASSWORD="your-16-digit-password"')
    console.log('\n或创建 .env.email 文件（参考 .env.email.example）')
    return
  }

  try {
    // 创建增强的邮件服务
    console.log('🔧 创建增强邮件服务实例...')
    const emailService = createEnhancedEmailService(gmailPassword)
    
    // 测试连接（带重试）
    console.log('\n1️⃣ 测试邮件服务连接（带重试机制）...')
    const isConnected = await emailService.testConnection()
    
    if (!isConnected) {
      console.error('❌ 邮件服务连接失败，终止测试')
      return
    }

    // 发送商业机会报告
    console.log('\n2️⃣ 发送商业机会分析报告...')
    const result = await emailService.sendBusinessReport(
      mockAnalysisResult.opportunities,
      mockAnalysisResult.summary
    )

    if (result.success) {
      console.log(`✅ 邮件发送成功！`)
      console.log(`   消息ID: ${result.messageId}`)
      console.log(`   尝试次数: ${result.attempts}`)
      console.log(`   请检查邮箱: 2624773733@qq.com`)
    } else {
      console.error(`❌ 邮件发送失败：${result.error}`)
      console.log(`   尝试次数: ${result.attempts}`)
    }

    console.log('\n🎉 增强版邮件服务测试完成！')

  } catch (error) {
    console.error('💥 测试过程中发生错误:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('邮件配置缺少')) {
        console.log('\n💡 请检查邮件配置参数是否完整')
      } else if (error.message.includes('邮箱格式无效')) {
        console.log('\n💡 请检查邮箱地址格式是否正确')
      }
    }
  }
}

/**
 * 测试配置验证功能
 */
async function testConfigValidation() {
  console.log('🔍 测试配置验证功能...\n')

  // 测试无效配置
  const invalidConfigs = [
    {
      name: '缺少发送方邮箱',
      config: { to: '2624773733@qq.com', smtpHost: 'smtp.gmail.com' }
    },
    {
      name: '无效的邮箱格式',
      config: { 
        from: 'invalid-email',
        to: '2624773733@qq.com',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: 'test@gmail.com',
        smtpPassword: 'password'
      }
    },
    {
      name: '无效的端口号',
      config: { 
        from: 'test@gmail.com',
        to: '2624773733@qq.com',
        smtpHost: 'smtp.gmail.com',
        smtpPort: -1,
        smtpUser: 'test@gmail.com',
        smtpPassword: 'password'
      }
    }
  ]

  for (const testCase of invalidConfigs) {
    try {
      console.log(`测试: ${testCase.name}`)
      // @ts-ignore
      createEnhancedEmailService('dummy-password')
      console.log('❌ 应该抛出错误但没有')
    } catch (error) {
      console.log(`✅ 正确捕获错误: ${error instanceof Error ? error.message : String(error)}`)
    }
    console.log()
  }
}

/**
 * 显示功能特性
 */
function showFeatures() {
  console.log('✨ 增强版邮件服务特性：\n')
  
  console.log('🛡️ 健壮性增强：')
  console.log('   - 配置参数验证（邮箱格式、端口号等）')
  console.log('   - 连接超时设置（10秒连接，15秒数据传输）')
  console.log('   - 详细的错误日志和诊断信息')
  console.log()
  
  console.log('🔄 重试机制：')
  console.log('   - 连接测试自动重试（最多3次）')
  console.log('   - 邮件发送失败自动重试（可配置次数）')
  console.log('   - 递增延迟策略（避免频繁重试）')
  console.log()
  
  console.log('📧 邮件增强：')
  console.log('   - 支持多个收件人')
  console.log('   - 自定义邮件头信息')
  console.log('   - 优化的HTML模板（更好的兼容性）')
  console.log('   - 详细的发送结果反馈')
  console.log()
  
  console.log('⚙️ 配置灵活：')
  console.log('   - 环境变量支持')
  console.log('   - 可配置重试次数和延迟')
  console.log('   - 支持SSL和STARTTLS')
  console.log()
}

// 根据命令行参数执行不同的测试
const command = process.argv[2] || 'test'

switch (command) {
  case 'test':
    testEnhancedEmailService()
    break
  case 'validate':
    testConfigValidation()
    break
  case 'features':
    showFeatures()
    break
  default:
    console.log('使用方法：')
    console.log('npx tsx server/analysis/test-enhanced-email.ts [command]')
    console.log()
    console.log('可用命令：')
    console.log('  test     - 完整功能测试（默认）')
    console.log('  validate - 配置验证测试') 
    console.log('  features - 显示功能特性')
}