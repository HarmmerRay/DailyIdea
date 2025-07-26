import { createEmailService, sendTestEmail } from './email-service'
import { mockAnalysisResult } from './simple-test'

/**
 * 测试邮件发送功能
 */
async function testEmailSending() {
  console.log('📧 开始测试邮件发送功能...\n')

  // 从环境变量获取Gmail应用密码
  const gmailPassword = process.env.GMAIL_APP_PASSWORD
  
  if (!gmailPassword) {
    console.log('❌ 缺少Gmail应用密码')
    console.log('\n📋 配置步骤：')
    console.log('1. 访问 https://myaccount.google.com/security')
    console.log('2. 开启两步验证')
    console.log('3. 生成应用专用密码')
    console.log('4. 设置环境变量：export GMAIL_APP_PASSWORD="your-app-password"')
    console.log('5. 重新运行测试')
    return
  }

  try {
    // 1. 发送简单测试邮件
    console.log('1️⃣ 发送测试邮件...')
    await sendTestEmail(gmailPassword)
    console.log('✅ 测试邮件发送成功！')

    // 2. 发送商业机会报告邮件
    console.log('\n2️⃣ 发送商业机会报告邮件...')
    const emailService = createEmailService(gmailPassword)
    
    await emailService.sendBusinessReport(
      mockAnalysisResult.opportunities,
      mockAnalysisResult.summary
    )
    console.log('✅ 商业机会报告邮件发送成功！')

    console.log('\n🎉 邮件发送测试完成！')
    console.log('请检查 2624773733@qq.com 邮箱是否收到邮件')

  } catch (error) {
    console.error('❌ 邮件发送测试失败:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        console.log('\n💡 可能的解决方案：')
        console.log('1. 确认Gmail账号已开启两步验证')
        console.log('2. 使用应用专用密码，不是普通密码')
        console.log('3. 检查Gmail账号是否被锁定')
      } else if (error.message.includes('Connection timeout')) {
        console.log('\n💡 网络连接问题，请检查：')
        console.log('1. 网络连接是否正常')
        console.log('2. 是否被防火墙阻止')
        console.log('3. 尝试使用VPN')
      }
    }
  }
}

/**
 * 快速连接测试
 */
async function quickConnectionTest() {
  console.log('⚡ 快速连接测试...\n')
  
  const gmailPassword = process.env.GMAIL_APP_PASSWORD
  if (!gmailPassword) {
    console.log('❌ 请设置 GMAIL_APP_PASSWORD 环境变量')
    return false
  }

  try {
    const emailService = createEmailService(gmailPassword)
    const isConnected = await emailService.testConnection()
    
    if (isConnected) {
      console.log('✅ Gmail SMTP 连接成功')
      return true
    } else {
      console.log('❌ Gmail SMTP 连接失败')
      return false
    }
  } catch (error) {
    console.error('❌ 连接测试失败:', error)
    return false
  }
}

/**
 * 显示配置指南
 */
function showConfigGuide() {
  console.log('📖 Gmail 邮件服务配置指南\n')
  
  console.log('🔐 获取Gmail应用密码的步骤：')
  console.log('1. 访问：https://myaccount.google.com/security')
  console.log('2. 在"登录Google"部分，开启"两步验证"')
  console.log('3. 开启两步验证后，点击"应用专用密码"')
  console.log('4. 选择"邮件"应用和设备类型')
  console.log('5. 生成16位应用专用密码')
  console.log()
  
  console.log('💻 设置环境变量：')
  console.log('export GMAIL_APP_PASSWORD="your-16-digit-password"')
  console.log()
  
  console.log('🔧 当前配置：')
  console.log('- 发送邮箱：zhao131804@gmail.com')
  console.log('- 接收邮箱：2624773733@qq.com')
  console.log('- SMTP服务器：smtp.gmail.com:587')
  console.log()
  
  console.log('⚠️ 注意事项：')
  console.log('- 使用应用专用密码，不是Gmail登录密码')
  console.log('- 确保Gmail账号未被锁定')
  console.log('- 某些地区可能需要VPN')
}

// 根据命令行参数执行不同的测试
const command = process.argv[2] || 'test'

switch (command) {
  case 'test':
    testEmailSending()
    break
  case 'connect':
    quickConnectionTest()
    break
  case 'guide':
    showConfigGuide()
    break
  default:
    console.log('使用方法：')
    console.log('npx tsx server/analysis/test-email.ts [command]')
    console.log()
    console.log('可用命令：')
    console.log('  test    - 完整邮件发送测试（默认）')
    console.log('  connect - 快速连接测试')
    console.log('  guide   - 显示配置指南')
}