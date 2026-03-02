const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 临期物品提醒模板：物品名称 thing5, 剩余天数 number7, 备注 thing8
const TEMPLATE_ID = 'wv3okX-DxGe93KfFwDA5sX9qubR5nDkuvOxthVgS5JE'

function truncate(str, maxLen) {
  if (!str) return ''
  const s = String(str).trim()
  return s.length > 20 ? s.substring(0, 17) + '...' : s
}

exports.main = async (event = {}) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayMs = today.getTime()

  // 计算临期 1、2、3 天的日期
  const expiringDates = []
  for (let d = 1; d <= 3; d++) {
    const dObj = new Date(today)
    dObj.setDate(dObj.getDate() + d)
    expiringDates.push({
      year: dObj.getFullYear(),
      month: dObj.getMonth() + 1,
      day: dObj.getDate(),
      daysLeft: d
    })
  }

  const col = db.collection('events')
  const allExpiring = []

  for (const target of expiringDates) {
    const res = await col
      .where({
        year: target.year,
        month: target.month,
        day: target.day
      })
      .limit(500)
      .get()
    const items = (res.data || []).map(ev => ({
      ...ev,
      daysLeft: target.daysLeft
    }))
    allExpiring.push(...items)
  }

  if (allExpiring.length === 0) {
    return { success: true, message: '无临期物品', sent: 0 }
  }

  // 按 groupId 分组，给每组的所有成员发送每条临期物品的通知
  const byGroup = {}
  for (const item of allExpiring) {
    const gid = item.groupId || '_legacy'
    if (!byGroup[gid]) byGroup[gid] = []
    byGroup[gid].push(item)
  }

  let totalSent = 0

  for (const gid of Object.keys(byGroup)) {
    const items = byGroup[gid]
    let openids = []
    if (gid === '_legacy') {
      const usersRes = await db.collection('users').limit(1000).get()
      openids = (usersRes.data || []).map(u => u.openid).filter(Boolean)
    } else {
      const gmRes = await db.collection('group_members').where({ groupId: gid }).get()
      openids = (gmRes.data || []).map(m => m.openid).filter(Boolean)
    }

    for (const item of items) {
      const thing5 = truncate(item.title || '未命名', 20)
      const number7 = String(item.daysLeft)
      const thing8 = truncate(item.note || '无', 20)

      for (const openid of openids) {
        try {
          await cloud.openapi.subscribeMessage.send({
            touser: openid,
            page: 'pages/index/index',
            data: {
              thing5: { value: thing5 },
              number7: { value: number7 },
              thing8: { value: thing8 }
            },
            templateId: TEMPLATE_ID
          })
          totalSent++
        } catch (e) {
          // 用户未订阅或模板不可用等，忽略
        }
      }
    }
  }

  return { success: true, sent: totalSent, itemsCount: allExpiring.length }
}
