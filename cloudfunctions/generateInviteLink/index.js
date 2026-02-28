const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { inviteCode } = event
  if (!inviteCode || !inviteCode.trim()) {
    return { success: false, message: '缺少邀请码' }
  }

  const gRes = await db.collection('groups').where({ inviteCode: inviteCode.toUpperCase().trim() }).limit(1).get()
  if (!gRes.data || gRes.data.length === 0) {
    return { success: false, message: '邀请码无效' }
  }

  try {
    const result = await cloud.openapi.urllink.generate({
      path: 'pages/index/index',
      query: 'inviteCode=' + encodeURIComponent(inviteCode.trim().toUpperCase()),
      expire_type: 1,
      expire_interval: 30
    })
    return {
      success: true,
      url: result.url_link || result.urlLink || ''
    }
  } catch (err) {
    return {
      success: false,
      message: err.errMsg || err.message || '生成失败',
      err: String(err)
    }
  }
}
