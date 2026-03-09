const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 使用 nodemailer 发送邮件
const nodemailer = require('nodemailer')

const TO_EMAIL = '18815958187@139.com'

exports.main = async (event, context) => {
  const { content } = event || {}
  if (!content || typeof content !== 'string') {
    return { success: false, message: '反馈内容不能为空' }
  }

  const safeContent = content.slice(0, 2000).replace(/</g, '&lt;').replace(/>/g, '&gt;')
  let openid = 'unknown'
  try {
    openid = cloud.getWXContext().OPENID || openid
  } catch (e) {}

  const mailPass = process.env.MAIL_PASS
  if (!mailPass) {
    console.error('未配置 MAIL_PASS 环境变量')
    return { success: false, message: '邮件服务未配置，请联系开发者' }
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.139.com',
    port: 465,
    secure: true,
    auth: {
      user: TO_EMAIL,
      pass: mailPass
    }
  })

  const mailOptions = {
    from: TO_EMAIL,
    to: TO_EMAIL,
    subject: `[冰小记] 用户反馈 - ${new Date().toLocaleString('zh-CN')}`,
    html: `
      <p><strong>反馈内容：</strong></p>
      <p>${safeContent.replace(/\n/g, '<br>')}</p>
      <hr>
      <p style="color:#888;font-size:12px;">OpenID: ${openid} | 时间: ${new Date().toISOString()}</p>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true, message: '提交成功' }
  } catch (err) {
    console.error('发送邮件失败:', err)
    return { success: false, message: err.message || '发送失败，请稍后重试' }
  }
}
