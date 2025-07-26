import { createEmailService } from './email-service'
import { mockAnalysisResult } from './simple-test'

/**
 * 重新发送商业机会分析报告
 */
async function resendBusinessReport() {
  console.log('📧 重新发送商业机会分析报告...\n')
  
  const gmailPassword = process.env.GMAIL_APP_PASSWORD
  if (!gmailPassword) {
    console.log('❌ 请设置 GMAIL_APP_PASSWORD 环境变量')
    return
  }

  try {
    // 创建邮件服务
    const emailService = createEmailService(gmailPassword)
    
    // 测试连接
    console.log('🔧 测试邮件服务连接...')
    const isConnected = await emailService.testConnection()
    if (!isConnected) {
      console.log('❌ 邮件服务连接失败')
      return
    }
    
    // 发送商业机会报告
    console.log('📊 发送商业机会分析报告...')
    await emailService.sendBusinessReport(
      mockAnalysisResult.opportunities,
      mockAnalysisResult.summary
    )
    
    console.log('✅ 商业机会分析报告发送成功！')
    console.log('📬 请检查 2624773733@qq.com 邮箱')
    console.log('\n💡 邮件主题：🚀 [今日日期] 商业机会分析报告 - 发现3个潜在机会')
    console.log('📋 邮件内容：包含3个详细的商业机会分析')
    
  } catch (error) {
    console.error('❌ 发送失败:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        console.log('\n💡 可能是Gmail密码问题，请检查应用专用密码是否正确')
      } else if (error.message.includes('timeout')) {
        console.log('\n💡 网络连接超时，请检查网络连接')
      }
    }
  }
}

// 运行重发
resendBusinessReport()