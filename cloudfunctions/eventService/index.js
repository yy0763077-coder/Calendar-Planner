const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function randomSmallName() {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  return '小' + letter
}

exports.main = async (event) => {
  const { action, data } = event
  const col = db.collection('events')

  try {
    switch (action) {
      case 'list': {
        const groupId = data.groupId || ''
        const raw = await col.where({ groupId }).limit(1000).get()
        const list = raw.data || []
        return { success: true, data: list }
      }
      case 'add': {
        const groupId = data.groupId || ''
        const memberName = (data.memberName || '').trim() || '未知'
        const addRes = await col.add({
          data: {
            groupId,
            title: data.title,
            memberId: data.memberId,
            memberName,
            year: Number(data.year),
            month: Number(data.month),
            day: Number(data.day),
            createdAt: db.serverDate()
          }
        })
        if (memberName !== '未知') {
          try {
            const mpCol = db.collection('member_profiles')
            const existing = await mpCol.where({ groupId: groupId || '', memberId: data.memberId }).limit(1).get()
            if (existing.data && existing.data.length > 0) {
              await mpCol.doc(existing.data[0]._id).update({ data: { name: memberName } })
            } else {
              await mpCol.add({ data: { groupId: groupId || '', memberId: data.memberId, name: memberName, updatedAt: db.serverDate() } })
            }
          } catch (_) {}
        }
        return { success: true, _id: addRes._id }
      }
      case 'update': {
        await col.doc(data._id).update({ data: { title: data.title } })
        return { success: true }
      }
      case 'delete': {
        await col.doc(data._id).remove()
        return { success: true }
      }
      case 'saveUser': {
        const openid = data.openid
        if (!openid) return { success: false, message: 'missing openid' }
        const existing = await db.collection('users').where({ openid }).limit(1).get()
        if (existing.data && existing.data.length > 0) {
          return { success: true, message: 'exists' }
        }
        await db.collection('users').add({ data: { openid, createdAt: db.serverDate() } })
        return { success: true, message: 'created' }
      }
      case 'createGroup': {
        const { openid, name } = data
        if (!openid || !name) return { success: false, message: 'missing openid or name' }
        let code = generateInviteCode()
        let exists = await db.collection('groups').where({ inviteCode: code }).limit(1).get()
        while (exists.data && exists.data.length > 0) {
          code = generateInviteCode()
          exists = await db.collection('groups').where({ inviteCode: code }).limit(1).get()
        }
        const gRes = await db.collection('groups').add({
          data: { name: name.trim(), creatorOpenid: openid, inviteCode: code, createdAt: db.serverDate() }
        })
        const gId = gRes._id
        const defColor = { bg: 'rgba(181,232,224,0.4)', text: '#115E59' }
        const creatorColor = (data.color && data.color.bg && data.color.text) ? data.color : defColor
        const creatorName = (data.memberName || '').trim() || randomSmallName()
        await db.collection('group_members').add({
          data: { groupId: gId, openid, memberId: data.memberId || 'm1', memberName: creatorName, color: creatorColor, role: 'creator', joinedAt: db.serverDate() }
        })
        return { success: true, groupId: gId, inviteCode: code }
      }
      case 'joinGroup': {
        const { openid, inviteCode, memberId, memberName } = data
        if (!openid || !inviteCode) return { success: false, message: 'missing openid or inviteCode' }
        const gRes = await db.collection('groups').where({ inviteCode: inviteCode.toUpperCase().trim() }).limit(1).get()
        if (!gRes.data || gRes.data.length === 0) return { success: false, message: '邀请码无效' }
        const g = gRes.data[0]
        const existing = await db.collection('group_members').where({ groupId: g._id, openid }).limit(1).get()
        if (existing.data && existing.data.length > 0) return { success: true, groupId: g._id, groupName: g.name, message: '已在组内' }
        const colors = [
          { bg: 'rgba(181,232,224,0.4)', text: '#115E59' },
          { bg: 'rgba(208,225,249,0.4)', text: '#1E40AF' },
          { bg: 'rgba(246,198,234,0.3)', text: '#9D174D' }
        ]
        const gmCount = (await db.collection('group_members').where({ groupId: g._id }).count()).total || 0
        const color = colors[gmCount % colors.length]
        const joinName = (memberName || '').trim() || randomSmallName()
        await db.collection('group_members').add({
          data: { groupId: g._id, openid, memberId: memberId || 'm' + Date.now(), memberName: joinName, color, role: 'member', joinedAt: db.serverDate() }
        })
        return { success: true, groupId: g._id, groupName: g.name }
      }
      case 'getMyGroups': {
        const openid = data.openid
        if (!openid) return { success: false, message: 'missing openid' }
        const gmRes = await db.collection('group_members').where({ openid }).get()
        const gIds = (gmRes.data || []).map(m => m.groupId)
        if (gIds.length === 0) return { success: true, groups: [] }
        const groups = []
        for (const gid of gIds) {
          const gRes = await db.collection('groups').doc(gid).get()
          if (gRes.data) {
            const gm = (gmRes.data || []).find(m => m.groupId === gid)
            const defColor = { bg: 'rgba(181,232,224,0.4)', text: '#115E59' }
            groups.push({ _id: gRes.data._id, name: gRes.data.name, inviteCode: gRes.data.inviteCode, myMemberId: gm ? gm.memberId : '', myMemberName: gm ? gm.memberName : '', myColor: gm && gm.color ? gm.color : defColor })
          }
        }
        return { success: true, groups }
      }
      case 'getGroupMembers': {
        const groupId = data.groupId
        const openid = data.openid
        if (!groupId) return { success: false }
        const gmRes = await db.collection('group_members').where({ groupId }).get()
        const colors = [
          { bg: 'rgba(181,232,224,0.4)', text: '#115E59' },
          { bg: 'rgba(208,225,249,0.4)', text: '#1E40AF' },
          { bg: 'rgba(246,198,234,0.3)', text: '#9D174D' },
          { bg: 'rgba(255,214,165,0.4)', text: '#9A3412' },
          { bg: 'rgba(226,209,249,0.4)', text: '#6B21A8' }
        ]
        const list = (gmRes.data || []).map((m, i) => ({
          id: m.memberId,
          name: m.memberName || '成员',
          color: m.color || colors[i % colors.length],
          openid: m.openid,
          role: m.role,
          _gmId: m._id
        }))
        const myGm = openid ? (gmRes.data || []).find(m => m.openid === openid) : null
        const myRole = myGm ? myGm.role : ''
        return { success: true, members: list, myRole }
      }
      case 'updateMemberProfile': {
        const { groupId, openid, memberName, color } = data
        if (!groupId || !openid) return { success: false, message: 'missing params' }
        const gmRes = await db.collection('group_members').where({ groupId, openid }).limit(1).get()
        if (!gmRes.data || gmRes.data.length === 0) return { success: false, message: '非组成员' }
        const gm = gmRes.data[0]
        const updateData = {}
        if (memberName !== undefined && String(memberName).trim()) updateData.memberName = String(memberName).trim()
        if (color && color.bg && color.text) updateData.color = color
        if (Object.keys(updateData).length === 0) return { success: true }
        await db.collection('group_members').doc(gm._id).update({ data: { ...updateData, updatedAt: db.serverDate() } })
        if (updateData.memberName) {
          const mpCol = db.collection('member_profiles')
          const ex = await mpCol.where({ groupId, memberId: gm.memberId }).limit(1).get()
          if (ex.data && ex.data.length > 0) {
            await mpCol.doc(ex.data[0]._id).update({ data: { name: updateData.memberName, updatedAt: db.serverDate() } })
          } else {
            await mpCol.add({ data: { groupId, memberId: gm.memberId, name: updateData.memberName, updatedAt: db.serverDate() } })
          }
        }
        return { success: true }
      }
      case 'backfillMemberProfiles': {
        const evRes = await col.limit(500).get()
        for (const ev of (evRes.data || [])) {
          if (ev.memberName && ev.memberName.trim() && ev.memberName !== '未知') {
            try {
              const mpCol = db.collection('member_profiles')
              const gid = ev.groupId || ''
              const existing = await mpCol.where({ groupId: gid, memberId: ev.memberId }).limit(1).get()
              if (!existing.data || existing.data.length === 0) {
                await mpCol.add({ data: { groupId: gid, memberId: ev.memberId, name: ev.memberName.trim(), updatedAt: db.serverDate() } })
              }
            } catch (_) {}
          }
        }
        return { success: true }
      }
      case 'leaveGroup': {
        const { openid, groupId } = data
        if (!openid || !groupId) return { success: false, message: 'missing params' }
        const gmRes = await db.collection('group_members').where({ groupId, openid }).limit(1).get()
        if (!gmRes.data || gmRes.data.length === 0) return { success: false, message: '非组成员' }
        const gm = gmRes.data[0]
        const gDoc = await db.collection('groups').doc(groupId).get()
        if (!gDoc.data) return { success: false, message: '组不存在' }
        if (gDoc.data.creatorOpenid === openid) return { success: false, message: '创建者不能退出，可删除组内所有成员后另行处理' }
        await db.collection('group_members').doc(gm._id).remove()
        return { success: true }
      }
      case 'removeMember': {
        const { openid, groupId, targetOpenid } = data
        if (!openid || !groupId || !targetOpenid) return { success: false, message: 'missing params' }
        const gDoc = await db.collection('groups').doc(groupId).get()
        if (!gDoc.data) return { success: false, message: '组不存在' }
        if (gDoc.data.creatorOpenid !== openid) return { success: false, message: '仅创建者可移出成员' }
        const targetGm = await db.collection('group_members').where({ groupId, openid: targetOpenid }).limit(1).get()
        if (!targetGm.data || targetGm.data.length === 0) return { success: false, message: '该成员不在组内' }
        if (targetGm.data[0].role === 'creator') return { success: false, message: '不能移出创建者' }
        await db.collection('group_members').doc(targetGm.data[0]._id).remove()
        return { success: true }
      }
      case 'deleteGroup': {
        const { openid, groupId } = data
        if (!openid || !groupId) return { success: false, message: 'missing params' }
        const gDoc = await db.collection('groups').doc(groupId).get()
        if (!gDoc.data) return { success: false, message: '组不存在' }
        if (gDoc.data.creatorOpenid !== openid) return { success: false, message: '仅创建者可删除组' }
        await col.where({ groupId }).remove()
        const gmList = await db.collection('group_members').where({ groupId }).get()
        for (const gm of (gmList.data || [])) {
          await db.collection('group_members').doc(gm._id).remove()
        }
        const mpList = await db.collection('member_profiles').where({ groupId }).get()
        for (const mp of (mpList.data || [])) {
          await db.collection('member_profiles').doc(mp._id).remove()
        }
        await db.collection('groups').doc(groupId).remove()
        return { success: true }
      }
      case 'syncGroupPersonas': {
        const { groupId, personas } = data
        if (!groupId || !personas) return { success: false }
        for (const p of personas) {
          if (!p.id || !p.name) continue
          try {
            const ex = await db.collection('member_profiles').where({ groupId, memberId: p.id }).limit(1).get()
            if (ex.data && ex.data.length > 0) {
              await db.collection('member_profiles').doc(ex.data[0]._id).update({ data: { name: p.name, updatedAt: db.serverDate() } })
            } else {
              await db.collection('member_profiles').add({ data: { groupId, memberId: p.id, name: p.name, updatedAt: db.serverDate() } })
            }
          } catch (_) {}
        }
        return { success: true }
      }
      case 'getInitialData': {
        const openid = data.openid
        const preferredGroupId = data.preferredGroupId || ''
        if (!openid) return { success: false, message: 'missing openid' }
        const gmRes = await db.collection('group_members').where({ openid }).get()
        const gIds = (gmRes.data || []).map(m => m.groupId)
        const groups = []
        let currentGroupId = ''
        let currentGroup = null
        if (gIds.length > 0) {
          for (const gid of gIds) {
            const gRes = await db.collection('groups').doc(gid).get()
            if (gRes.data) {
              const gm = (gmRes.data || []).find(m => m.groupId === gid)
              const defColor = { bg: 'rgba(181,232,224,0.4)', text: '#115E59' }
              groups.push({
                _id: gRes.data._id,
                name: gRes.data.name,
                inviteCode: gRes.data.inviteCode,
                myMemberId: gm ? gm.memberId : '',
                myMemberName: gm ? gm.memberName : '',
                myColor: gm && gm.color ? gm.color : defColor
              })
            }
          }
          if (preferredGroupId && groups.some(g => g._id === preferredGroupId)) {
            currentGroupId = preferredGroupId
          } else {
            currentGroupId = groups[0]._id
          }
          currentGroup = groups.find(g => g._id === currentGroupId) || groups[0]
        }
        let members = []
        let myRole = ''
        let eventsList = []
        if (currentGroupId) {
          const gmListRes = await db.collection('group_members').where({ groupId: currentGroupId }).get()
          const colors = [
            { bg: 'rgba(181,232,224,0.4)', text: '#115E59' },
            { bg: 'rgba(208,225,249,0.4)', text: '#1E40AF' },
            { bg: 'rgba(246,198,234,0.3)', text: '#9D174D' },
            { bg: 'rgba(255,214,165,0.4)', text: '#9A3412' },
            { bg: 'rgba(226,209,249,0.4)', text: '#6B21A8' }
          ]
          members = (gmListRes.data || []).map((m, i) => ({
            id: m.memberId,
            name: m.memberName || '成员',
            color: m.color || colors[i % colors.length],
            openid: m.openid,
            role: m.role,
            _gmId: m._id
          }))
          const myGm = (gmListRes.data || []).find(m => m.openid === openid)
          myRole = myGm ? myGm.role : ''
          const evRaw = await col.where({ groupId: currentGroupId }).limit(1000).get()
          eventsList = evRaw.data || []
        }
        return {
          success: true,
          groups,
          currentGroupId,
          currentGroup,
          members,
          myRole,
          events: eventsList
        }
      }
      default:
        return { success: false, message: 'unknown action' }
    }
  } catch (err) {
    return {
      success: false,
      errCode: err.errCode ? Number(err.errCode) : 0,
      message: String(err.errMsg || err.message || '')
    }
  }
}
