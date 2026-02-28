const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const TEMPLATE_ID = 'dbYqfPJBdtx2jeglq9-qPwDhnj2G5jfRizKpb5NP8RU'

function getMemberName(ev, memberProfilesMap) {
  const key = (ev.groupId || '') + ':' + (ev.memberId || '')
  if (memberProfilesMap[key]) return memberProfilesMap[key]
  if (ev.memberName && ev.memberName.trim() !== '' && ev.memberName !== '未知') {
    return ev.memberName.trim()
  }
  return '未知'
}

exports.main = async (event = {}) => {
  let { year, month, day, groupId, mode, userName, eventTitle } = event

  if (mode === 'delete' && groupId && userName !== undefined && eventTitle !== undefined) {
    const timeStr = (() => {
      const d = new Date();
      const t = new Date(d.getTime() + (8 - d.getTimezoneOffset() / 60) * 3600 * 1000);
      return t.getFullYear() + '年' + (t.getMonth() + 1) + '月' + t.getDate() + '日 ' + String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
    })();
    const content = (userName || '未知') + '-删除了行程' + (eventTitle || '');
    const thing9Val = content.length > 20 ? content.substring(0, 17) + '...' : content;
    const gmRes = await db.collection('group_members').where({ groupId }).get();
    const openids = (gmRes.data || []).map(m => m.openid).filter(Boolean);
    let totalSent = 0;
    for (const openid of openids) {
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: openid,
          page: 'pages/index/index',
          data: { time6: { value: timeStr }, thing9: { value: thing9Val }, thing15: { value: '删除提醒' } },
          templateId: TEMPLATE_ID
        });
        totalSent++;
      } catch (e) {}
    }
    return { success: true, sent: totalSent };
  }

  if (!year || !month || !day) {
    const now = new Date()
    const d = new Date(now.getTime() + (8 - now.getTimezoneOffset() / 60) * 3600 * 1000)
    year = d.getFullYear()
    month = d.getMonth() + 1
    day = d.getDate()
  }

  year = Number(year)
  month = Number(month)
  day = Number(day)

  const eventsWhere = { year, month, day }
  if (groupId) eventsWhere.groupId = groupId
  const eventsRes = await db.collection('events').where(eventsWhere).limit(200).get()
  const allEvents = eventsRes.data || []
  if (allEvents.length === 0) {
    return { success: true, message: '当天无行程', sent: 0 }
  }

  const memberProfilesMap = {}
  if (groupId) {
    const memberProfilesRes = await db.collection('member_profiles').where({ groupId }).limit(200).get()
    for (const p of (memberProfilesRes.data || [])) {
      const key = (p.groupId || '') + ':' + (p.memberId || '')
      if (p.name) memberProfilesMap[key] = p.name
    }
    const gmRes = await db.collection('group_members').where({ groupId }).get()
    for (const m of (gmRes.data || [])) {
      const key = (m.groupId || '') + ':' + (m.memberId || '')
      if (m.memberName) memberProfilesMap[key] = m.memberName
    }
  } else {
    const memberProfilesRes = await db.collection('member_profiles').limit(500).get()
    for (const p of (memberProfilesRes.data || [])) {
      const key = (p.groupId || '') + ':' + (p.memberId || '')
      if (p.name) memberProfilesMap[key] = p.name
    }
    const gmRes = await db.collection('group_members').limit(1000).get()
    for (const m of (gmRes.data || [])) {
      const key = (m.groupId || '') + ':' + (m.memberId || '')
      if (m.memberName) memberProfilesMap[key] = m.memberName
    }
  }

  const byGroup = {}
  for (const ev of allEvents) {
    const gid = ev.groupId || '_legacy'
    if (!byGroup[gid]) byGroup[gid] = []
    byGroup[gid].push(ev)
  }

  let totalSent = 0

  for (const gid of Object.keys(byGroup)) {
    const events = byGroup[gid]
    const parts = []
    const nameSet = []
    for (const ev of events) {
      const name = getMemberName(ev, memberProfilesMap)
      parts.push(name + '-' + ev.title)
      if (!nameSet.includes(name)) nameSet.push(name)
    }

    let content = parts.join('，')
    if (content.length > 20) content = content.substring(0, 17) + '...'
    let participants = nameSet.join('，')
    if (participants.length > 20) participants = participants.substring(0, 17) + '...'

    const timeStr = year + '年' + month + '月' + day + '日 09:00'

    let openids = []
    if (gid === '_legacy') {
      const usersRes = await db.collection('users').limit(1000).get()
      openids = (usersRes.data || []).map(u => u.openid).filter(Boolean)
    } else {
      const gmRes = await db.collection('group_members').where({ groupId: gid }).get()
      openids = (gmRes.data || []).map(m => m.openid).filter(Boolean)
    }

    for (const openid of openids) {
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: openid,
          page: 'pages/index/index',
          data: {
            time6: { value: timeStr },
            thing9: { value: content },
            thing15: { value: participants }
          },
          templateId: TEMPLATE_ID
        })
        totalSent++
      } catch (e) {}
    }
  }

  return { success: true, sent: totalSent }
}
