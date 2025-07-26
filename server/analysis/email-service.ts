import nodemailer from 'nodemailer'
import type { BusinessOpportunity } from './business-opportunity'

export interface EmailConfig {
  from: string
  to: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
}

export interface EmailContent {
  subject: string
  htmlContent: string
  textContent: string
}

/**
 * 默认邮件配置
 */
export const DEFAULT_EMAIL_CONFIG: Partial<EmailConfig> = {
  from: 'zhao131804@gmail.com',
  to: '2624773733@qq.com',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: 'zhao131804@gmail.com'
  // smtpPassword 需要从环境变量获取
}

/**
 * 邮件服务类
 */
export class EmailService {
  private transporter: nodemailer.Transporter
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
    
    // 创建邮件传输器
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false, // 使用 STARTTLS
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    })
  }

  /**
   * 生成商业机会报告的HTML邮件模板
   */
  generateBusinessReportEmail(opportunities: BusinessOpportunity[], summary: string): EmailContent {
    const now = new Date()
    const dateStr = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    })
    
    const timeStr = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })

    // HTML模板
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>每日商业机会分析报告</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header .subtitle {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .meta-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
        }
        .meta-info h3 {
            margin: 0 0 10px 0;
            color: #495057;
            font-size: 16px;
        }
        .meta-info p {
            margin: 5px 0;
            color: #6c757d;
        }
        .opportunity {
            border: 1px solid #e9ecef;
            border-radius: 12px;
            margin-bottom: 30px;
            overflow: hidden;
            transition: transform 0.2s ease;
        }
        .opportunity:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .opp-header {
            background: #f8f9fa;
            padding: 20px 25px;
            border-bottom: 1px solid #e9ecef;
        }
        .opp-title {
            font-size: 20px;
            font-weight: 600;
            color: #212529;
            margin: 0 0 10px 0;
        }
        .opp-meta {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        .meta-tag {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }
        .category-tech { background: #e3f2fd; color: #1976d2; }
        .category-finance { background: #f3e5f5; color: #7b1fa2; }
        .category-consumer { background: #e8f5e8; color: #388e3c; }
        .category-policy { background: #fff3e0; color: #f57c00; }
        .category-social { background: #fce4ec; color: #c2185b; }
        .market-small { background: #fff8e1; color: #f9a825; }
        .market-medium { background: #e8f5e8; color: #43a047; }
        .market-large { background: #e3f2fd; color: #1e88e5; }
        .market-massive { background: #f3e5f5; color: #8e24aa; }
        .confidence {
            background: #e8f5e8;
            color: #2e7d32;
            font-weight: 600;
        }
        .opp-content {
            padding: 25px;
        }
        .description {
            font-size: 16px;
            color: #495057;
            margin-bottom: 20px;
            line-height: 1.7;
        }
        .section {
            margin-bottom: 20px;
        }
        .section h4 {
            font-size: 14px;
            font-weight: 600;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 8px 0;
        }
        .risk-item, .action-item {
            background: #f8f9fa;
            padding: 8px 12px;
            margin: 5px 0;
            border-radius: 6px;
            border-left: 3px solid #dee2e6;
        }
        .risk-item {
            border-left-color: #dc3545;
        }
        .action-item {
            border-left-color: #28a745;
        }
        .summary {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            padding: 25px;
            margin-top: 30px;
            border-left: 4px solid #667eea;
        }
        .summary h3 {
            color: #495057;
            margin: 0 0 15px 0;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 40px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            body { padding: 10px; }
            .content, .header { padding: 20px; }
            .opp-meta { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 每日商业机会分析</h1>
            <div class="subtitle">AI驱动的热点商业洞察 · 助您把握市场先机</div>
        </div>
        
        <div class="content">
            <div class="meta-info">
                <h3>📊 报告信息</h3>
                <p><strong>生成时间：</strong>${dateStr} ${timeStr}</p>
                <p><strong>数据来源：</strong>微博热搜、百度热榜、知乎热榜、财联社、华尔街见闻等30+权威平台</p>
                <p><strong>分析周期：</strong>过去24小时热点数据</p>
                <p><strong>发现机会：</strong>${opportunities.length} 个潜在商业机会</p>
            </div>

            ${opportunities.map((opp, index) => `
            <div class="opportunity">
                <div class="opp-header">
                    <div class="opp-title">${index + 1}. ${opp.title}</div>
                    <div class="opp-meta">
                        <span class="meta-tag category-${opp.category}">${getCategoryName(opp.category)}</span>
                        <span class="meta-tag market-${opp.marketSize}">${getMarketSizeName(opp.marketSize)}</span>
                        <span class="meta-tag confidence">${opp.confidence}% 确信度</span>
                        <span class="meta-tag">${getTimeframeName(opp.timeframe)}</span>
                    </div>
                </div>
                <div class="opp-content">
                    <div class="description">${opp.description}</div>
                    
                    ${opp.risks.length > 0 ? `
                    <div class="section">
                        <h4>⚠️ 主要风险</h4>
                        ${opp.risks.map(risk => `<div class="risk-item">${risk}</div>`).join('')}
                    </div>
                    ` : ''}
                    
                    ${opp.actionItems.length > 0 ? `
                    <div class="section">
                        <h4>💡 行动建议</h4>
                        ${opp.actionItems.map(item => `<div class="action-item">${item}</div>`).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>
            `).join('')}

            <div class="summary">
                <h3>📈 今日洞察总结</h3>
                <p>${summary}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>本报告由 AI 智能分析生成，基于多平台热点数据深度挖掘商业机会</p>
            <p>如有疑问或建议，请联系：<a href="mailto:zhao131804@gmail.com">zhao131804@gmail.com</a></p>
            <p><em>⚡ 抢占先机，把握未来 ⚡</em></p>
        </div>
    </div>
</body>
</html>`

    // 纯文本版本
    const textContent = `
📊 每日商业机会分析报告

生成时间：${dateStr} ${timeStr}
数据来源：微博、百度、知乎、财联社等30+平台
发现机会：${opportunities.length} 个

${opportunities.map((opp, index) => `
${index + 1}. ${opp.title}
领域：${getCategoryName(opp.category)} | 市场：${getMarketSizeName(opp.marketSize)} | 确信度：${opp.confidence}%
时间窗口：${getTimeframeName(opp.timeframe)}

${opp.description}

主要风险：${opp.risks.join('、')}
行动建议：${opp.actionItems.join('、')}
`).join('\n---\n')}

总结：${summary}

---
本报告由AI自动生成 | 联系：zhao131804@gmail.com
`

    return {
      subject: `🚀 ${dateStr} 商业机会分析报告 - 发现${opportunities.length}个潜在机会`,
      htmlContent,
      textContent
    }
  }

  /**
   * 发送邮件
   */
  async sendEmail(content: EmailContent): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: `"AI商业洞察" <${this.config.from}>`,
        to: this.config.to,
        subject: content.subject,
        text: content.textContent,
        html: content.htmlContent
      })

      console.log('✅ 邮件发送成功:', info.messageId)
      return info
    } catch (error) {
      console.error('❌ 邮件发送失败:', error)
      throw new Error(`邮件发送失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 测试邮件连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log('✅ 邮件服务连接测试成功')
      return true
    } catch (error) {
      console.error('❌ 邮件服务连接测试失败:', error)
      return false
    }
  }

  /**
   * 发送商业机会报告邮件
   */
  async sendBusinessReport(opportunities: BusinessOpportunity[], summary: string = ''): Promise<void> {
    if (opportunities.length === 0) {
      console.log('⚠️ 没有商业机会数据，跳过邮件发送')
      return
    }

    // 如果没有提供summary，生成一个默认的
    if (!summary) {
      const categories = [...new Set(opportunities.map(opp => opp.category))]
      const highConfidenceCount = opportunities.filter(opp => opp.confidence >= 80).length
      summary = `今日发现${opportunities.length}个商业机会，其中${highConfidenceCount}个高确信度机会。主要集中在${categories.map(c => getCategoryName(c)).join('、')}等领域，建议重点关注短期可执行的机会。`
    }

    const emailContent = this.generateBusinessReportEmail(opportunities, summary)
    await this.sendEmail(emailContent)
  }
}

/**
 * 辅助函数：获取分类中文名称
 */
function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    'tech': '科技创新',
    'finance': '金融投资', 
    'consumer': '消费升级',
    'policy': '政策红利',
    'social': '社会民生'
  }
  return names[category] || category
}

/**
 * 辅助函数：获取市场规模中文名称
 */
function getMarketSizeName(size: string): string {
  const names: Record<string, string> = {
    'small': '小众市场',
    'medium': '中等市场',
    'large': '大型市场', 
    'massive': '超大市场'
  }
  return names[size] || size
}

/**
 * 辅助函数：获取时间窗口中文名称
 */
function getTimeframeName(timeframe: string): string {
  const names: Record<string, string> = {
    'immediate': '立即行动',
    'short': '短期机会',
    'medium': '中期布局',
    'long': '长期投资'
  }
  return names[timeframe] || timeframe
}

/**
 * 创建邮件服务实例的便捷函数
 */
export function createEmailService(password: string): EmailService {
  const config: EmailConfig = {
    ...DEFAULT_EMAIL_CONFIG,
    smtpPassword: password
  } as EmailConfig

  return new EmailService(config)
}

/**
 * 发送测试邮件
 */
export async function sendTestEmail(password: string): Promise<void> {
  const emailService = createEmailService(password)
  
  // 测试连接
  const isConnected = await emailService.testConnection()
  if (!isConnected) {
    throw new Error('邮件服务连接失败')
  }

  // 发送测试邮件
  const testContent: EmailContent = {
    subject: '🧪 商业机会分析系统测试邮件',
    htmlContent: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">📧 邮件服务测试成功！</h2>
      <p>您好！这是一封来自商业机会分析系统的测试邮件。</p>
      <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>系统信息：</h3>
        <ul>
          <li>发送时间：${new Date().toLocaleString()}</li>
          <li>发送邮箱：zhao131804@gmail.com</li>
          <li>接收邮箱：2624773733@qq.com</li>
          <li>状态：✅ 正常运行</li>
        </ul>
      </div>
      <p>如果您收到这封邮件，说明邮件推送功能已经配置成功！</p>
      <p><small>本邮件由AI商业洞察系统自动发送</small></p>
    </div>`,
    textContent: `
邮件服务测试成功！

这是一封来自商业机会分析系统的测试邮件。

系统信息：
- 发送时间：${new Date().toLocaleString()}
- 发送邮箱：zhao131804@gmail.com
- 接收邮箱：2624773733@qq.com
- 状态：✅ 正常运行

如果您收到这封邮件，说明邮件推送功能已经配置成功！

本邮件由AI商业洞察系统自动发送
`
  }

  await emailService.sendEmail(testContent)
}