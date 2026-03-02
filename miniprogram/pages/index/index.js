var calendar = require('../../utils/calendar');

var now = new Date();
// 临期物品提醒模板
var TEMPLATE_ID = 'wv3okX-DxGe93KfFwDA5sX9qubR5nDkuvOxthVgS5JE';

function getDaysLeft(year, month, day) {
  var today = new Date();
  var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  var expDate = new Date(year, month - 1, day);
  var expStart = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
  var diff = Math.floor((expStart - todayStart) / (24 * 60 * 60 * 1000));
  return diff;
}

function getUrgency(daysLeft) {
  if (daysLeft < 0) return 'expired';
  if (daysLeft === 0) return 'today';
  if (daysLeft === 1) return 'day1';
  if (daysLeft === 2) return 'day2';
  if (daysLeft === 3) return 'day3';
  return 'ok';
}

function formatExpiryDateStr(year, month, day) {
  return year + '.' + month + '.' + day;
}


Page({
  data: {
    statusBarHeight: 0,
    listHeight: 500,

    members: [],
    items: [],
    currentUserId: '',
    currentUser: null,
    currentGroupId: '',
    currentGroup: null,
    myGroups: [],

    groupGateVisible: false,
    createGroupVisible: false,
    joinGroupVisible: false,
    groupSwitcherVisible: false,
    newGroupName: '',
    joinInviteCode: '',

    modalVisible: false,
    modalAnimating: false,
    editingItem: null,
    itemName: '',
    itemNote: '',
    nameValid: false,

    countdownQuicks: [1, 2, 3, 4, 5],
    countdownDays: '3',

    memberVisible: false,
    memberAnimating: false,

    joinSuccessVisible: false,
    joinSuccessGroupName: '',
    joinSuccessViaLink: false,

    myRole: '',
    headerRightPadding: 96,
    hasExpired: false,
  },

  onLoad: function (options) {
    var statusBarHeight = 0;
    var windowHeight = 0;
    var menuRight = 0;
    try {
      var wi = wx.getWindowInfo();
      statusBarHeight = wi.statusBarHeight;
      windowHeight = wi.windowHeight;
    } catch (e) {
      var si = wx.getSystemInfoSync();
      statusBarHeight = si.statusBarHeight;
      windowHeight = si.windowHeight;
    }
    var windowWidth = 375;
    try {
      var si2 = wx.getSystemInfoSync();
      windowWidth = si2.windowWidth || 375;
      var menu = wx.getMenuButtonBoundingClientRect();
      menuRight = menu.left;
    } catch (e) {}
    this._windowHeight = windowHeight;
    this._menuRight = menuRight;
    var headerRightPadding = menuRight > 0 ? Math.ceil((windowWidth - menuRight + 16) * 2) : 96;
    this.setData({ statusBarHeight: statusBarHeight, headerRightPadding: headerRightPadding });

    if (options && options.inviteCode) {
      this._pendingInviteCode = options.inviteCode;
    }
    this.checkGroupAndLoad();
  },

  onShow: function () {
    if (this._backfillScheduled) return;
    this._backfillScheduled = true;
    var that = this;
    setTimeout(function () { that.runBackfill(); }, 800);
  },

  onReady: function () {
    this.computeListHeight();
  },

  runBackfill: function () {
    if (wx.getStorageSync('memberProfilesBackfillDone')) return;
    wx.cloud.callFunction({
      name: 'eventService',
      data: { action: 'backfillMemberProfiles' },
      success: function () {
        wx.setStorageSync('memberProfilesBackfillDone', true);
      }
    });
  },

  checkGroupAndLoad: function () {
    var that = this;
    getApp().getOpenid(function (openid) {
      that._doCheckGroupAndLoad(openid);
    });
  },

  _doCheckGroupAndLoad: function (openid) {
    var that = this;
    var savedGid = wx.getStorageSync('currentGroupId');
    wx.cloud.callFunction({
      name: 'eventService',
      data: { action: 'getInitialData', data: { openid: openid, preferredGroupId: savedGid } },
      success: function (res) {
        if (!res.result || !res.result.success) return;
        var groups = res.result.groups || [];
        var currentGroupId = res.result.currentGroupId || '';
        var currentGroup = res.result.currentGroup || null;
        var membersRaw = res.result.members || [];
        var myRole = res.result.myRole || '';
        var eventsRaw = res.result.events || [];

        if (currentGroupId) wx.setStorageSync('currentGroupId', currentGroupId);
        that.setData({ myGroups: groups, currentGroupId: currentGroupId, currentGroup: currentGroup, groupGateVisible: groups.length === 0 });

        if (that._pendingInviteCode) {
          that.tryAutoJoin(that._pendingInviteCode);
          that._pendingInviteCode = null;
          return;
        }

        var members = [];
        for (var i = 0; i < membersRaw.length; i++) {
          var m = membersRaw[i];
          members.push({
            id: m.id,
            name: m.name,
            color: m.color || calendar.EVENT_COLORS[i % calendar.EVENT_COLORS.length],
            initial: (m.name || '?').charAt(0),
            isMe: m.openid === openid,
            openid: m.openid,
            role: m.role
          });
        }
        if (members.length === 0 && currentGroup && currentGroup.myMemberId) {
          members = [{
            id: currentGroup.myMemberId,
            name: currentGroup.myMemberName || '我',
            color: currentGroup.myColor || calendar.EVENT_COLORS[0],
            initial: (currentGroup.myMemberName || '我').charAt(0),
            isMe: true
          }];
        }
        if (members.length === 0) {
          members = calendar.processMembers(calendar.DEFAULT_MEMBERS);
        }

        var savedId = wx.getStorageSync('selectedMemberId_' + currentGroupId) || wx.getStorageSync('selectedMemberId');
        if (!savedId && currentGroup && currentGroup.myMemberId) savedId = currentGroup.myMemberId;
        var currentUser = null;
        for (var j = 0; j < members.length; j++) {
          if (members[j].id === savedId || members[j].isMe) {
            currentUser = members[j];
            savedId = members[j].id;
            break;
          }
        }
        if (!currentUser && members.length > 0) {
          currentUser = members[0];
          savedId = members[0].id;
        }
        if (currentUser) {
          wx.setStorageSync('selectedMemberId_' + currentGroupId, savedId);
          wx.setStorageSync('selectedMemberId', savedId);
        }

        var items = [];
        for (var k = 0; k < eventsRaw.length; k++) {
          var r = eventsRaw[k];
          var daysLeft = getDaysLeft(r.year, r.month, r.day);
            items.push({
              _id: r._id,
              id: r._id,
              title: r.title,
              note: r.note || '',
              memberId: r.memberId,
              memberName: r.memberName || '',
              year: r.year,
              month: r.month,
              day: r.day,
              groupId: r.groupId,
              daysLeft: daysLeft,
              urgency: getUrgency(daysLeft),
              expiryDateStr: formatExpiryDateStr(r.year, r.month, r.day)
            });
          }
          items.sort(function (a, b) { return a.daysLeft - b.daysLeft; });
          var hasExpired = items.some(function (x) { return x.daysLeft < 0; });

        that.setData({
          members: members,
          items: items,
          hasExpired: hasExpired,
          currentUserId: savedId || '',
          currentUser: currentUser,
          myRole: myRole
        });
      }
    });
  },

  tryAutoJoin: function (code) {
    var that = this;
    getApp().getOpenid(function (openid) {
      wx.cloud.callFunction({
        name: 'eventService',
        data: { action: 'joinGroup', data: { openid: openid, inviteCode: code } },
        success: function (res) {
          if (res.result && res.result.groupId) {
            wx.setStorageSync('currentGroupId', res.result.groupId);
            that.checkGroupAndLoad();
            if (res.result.message === '已在组内') {
              wx.showToast({ title: '你已在此家庭内', icon: 'none' });
            } else {
              that.setData({
                joinSuccessVisible: true,
                joinSuccessGroupName: res.result.groupName || '该家庭',
                joinSuccessViaLink: true
              });
            }
          } else {
            wx.showToast({ title: res.result && res.result.message || '加入失败', icon: 'none' });
          }
        },
        fail: function () { wx.showToast({ title: '加入失败', icon: 'none' }); }
      });
    });
  },

  loadGroupMembersAndRole: function (groupId, groupInfo, onDone) {
    var that = this;
    var app = getApp();
    var openid = app.globalData.openid;
    wx.cloud.callFunction({
      name: 'eventService',
      data: { action: 'getGroupMembers', data: { groupId: groupId, openid: openid } },
      success: function (res) {
        var list = (res.result && res.result.members) || [];
        var myRole = (res.result && res.result.myRole) || '';
        var members = [];
        for (var i = 0; i < list.length; i++) {
          members.push({
            id: list[i].id,
            name: list[i].name,
            color: list[i].color || calendar.EVENT_COLORS[i % calendar.EVENT_COLORS.length],
            initial: (list[i].name || '?').charAt(0),
            isMe: list[i].openid === openid,
            openid: list[i].openid,
            role: list[i].role
          });
        }
        if (members.length === 0 && groupInfo && groupInfo.myMemberId) {
          members = [{
            id: groupInfo.myMemberId,
            name: groupInfo.myMemberName || '我',
            color: groupInfo.myColor || calendar.EVENT_COLORS[0],
            initial: (groupInfo.myMemberName || '我').charAt(0),
            isMe: true
          }];
        }
        if (members.length === 0) {
          members = calendar.processMembers(calendar.DEFAULT_MEMBERS);
        }

        var savedId = wx.getStorageSync('selectedMemberId_' + groupId) || wx.getStorageSync('selectedMemberId');
        if (!savedId && groupInfo && groupInfo.myMemberId) savedId = groupInfo.myMemberId;
        var currentUser = null;
        for (var j = 0; j < members.length; j++) {
          if (members[j].id === savedId || members[j].isMe) {
            currentUser = members[j];
            savedId = members[j].id;
            break;
          }
        }
        if (!currentUser && members.length > 0) {
          currentUser = members[0];
          savedId = members[0].id;
        }
        if (currentUser) {
          wx.setStorageSync('selectedMemberId_' + groupId, savedId);
          wx.setStorageSync('selectedMemberId', savedId);
        }

        that.setData({ members: members, currentUserId: savedId || '', currentUser: currentUser, myRole: myRole });
        if (onDone) onDone(); else that.loadItems();
      }
    });
  },

  loadItems: function (onDone) {
    var that = this;
    var groupId = this.data.currentGroupId;
    wx.cloud.callFunction({
      name: 'eventService',
      data: { action: 'list', data: { groupId: groupId || '' } },
      success: function (res) {
        if (res.result && res.result.success) {
          var records = res.result.data || [];
          var items = [];
          for (var i = 0; i < records.length; i++) {
            var r = records[i];
            var daysLeft = getDaysLeft(r.year, r.month, r.day);
            items.push({
              _id: r._id,
              id: r._id,
              title: r.title,
              note: r.note || '',
              memberId: r.memberId,
              memberName: r.memberName || '',
              year: r.year,
              month: r.month,
              day: r.day,
              groupId: r.groupId,
              daysLeft: daysLeft,
              urgency: getUrgency(daysLeft),
              expiryDateStr: formatExpiryDateStr(r.year, r.month, r.day)
            });
          }
          items.sort(function (a, b) { return a.daysLeft - b.daysLeft; });
          var hasExpired = items.some(function (x) { return x.daysLeft < 0; });
          that.setData({ items: items, hasExpired: hasExpired });
        }
        if (onDone) onDone();
      },
      fail: function () { if (onDone) onDone(); }
    });
  },

  computeListHeight: function () {
    var that = this;
    var wh = this._windowHeight || 0;
    if (!wh) try { wh = wx.getWindowInfo().windowHeight; } catch (e) { wh = wx.getSystemInfoSync().windowHeight; }
    var query = wx.createSelectorQuery();
    query.select('.top-section').boundingClientRect();
    query.exec(function (res) {
      if (res[0]) that.setData({ listHeight: wh - res[0].bottom });
    });
  },

  onShowCreateGroup: function () {
    this.setData({ createGroupVisible: true, newGroupName: '', groupGateVisible: false, groupSwitcherVisible: false });
  },

  onShowJoinGroup: function () {
    this.setData({ joinGroupVisible: true, joinInviteCode: '', groupGateVisible: false, groupSwitcherVisible: false });
  },

  closeJoinSuccess: function () {
    this.setData({ joinSuccessVisible: false, joinSuccessGroupName: '', joinSuccessViaLink: false });
  },

  closeCreateGroup: function () {
    this.setData({ createGroupVisible: false, groupGateVisible: this.data.myGroups.length === 0 });
  },

  closeJoinGroup: function () {
    this.setData({ joinGroupVisible: false, groupGateVisible: this.data.myGroups.length === 0 });
  },

  onNewGroupNameInput: function (e) {
    this.setData({ newGroupName: e.detail.value });
  },

  onJoinCodeInput: function (e) {
    this.setData({ joinInviteCode: e.detail.value.toUpperCase().replace(/[^A-Z0-9]/g, '') });
  },

  onCreateGroup: function () {
    var name = this.data.newGroupName.trim();
    if (!name) { wx.showToast({ title: '请输入家庭名称', icon: 'none' }); return; }
    var app = getApp();
    var openid = app.globalData.openid;
    if (!openid) { wx.showToast({ title: '请稍候', icon: 'none' }); return; }

    var that = this;
    wx.cloud.callFunction({
      name: 'eventService',
      data: { action: 'createGroup', data: { openid: openid, name: name } },
      success: function (res) {
        if (res.result && res.result.groupId) {
          wx.setStorageSync('currentGroupId', res.result.groupId);
          that.setData({
            createGroupVisible: false,
            currentGroupId: res.result.groupId,
            currentGroup: { _id: res.result.groupId, name: name, inviteCode: res.result.inviteCode },
            groupGateVisible: false,
            myGroups: that.data.myGroups.concat([{ _id: res.result.groupId, name: name, inviteCode: res.result.inviteCode }])
          });
          that.loadGroupMembersAndRole(res.result.groupId, { myMemberId: 'm1', myMemberName: '' });
          that.loadItems();
          wx.showToast({ title: '家庭已创建', icon: 'success' });
        } else {
          wx.showToast({ title: res.result && res.result.message || '失败', icon: 'none' });
        }
      },
      fail: function () { wx.showToast({ title: '创建失败', icon: 'none' }); }
    });
  },

  onJoinGroup: function () {
    var code = this.data.joinInviteCode.trim();
    if (!code || code.length < 4) { wx.showToast({ title: '请输入邀请码', icon: 'none' }); return; }
    var app = getApp();
    var openid = app.globalData.openid;
    if (!openid) { wx.showToast({ title: '请稍候', icon: 'none' }); return; }

    var that = this;
    wx.cloud.callFunction({
      name: 'eventService',
      data: { action: 'joinGroup', data: { openid: openid, inviteCode: code } },
      success: function (res) {
        if (res.result && res.result.groupId) {
          wx.setStorageSync('currentGroupId', res.result.groupId);
          that.checkGroupAndLoad();
          that.setData({
            joinGroupVisible: false,
            joinSuccessVisible: true,
            joinSuccessGroupName: res.result.groupName || '该家庭',
            joinSuccessViaLink: false
          });
        } else {
          wx.showToast({ title: res.result && res.result.message || '加入失败', icon: 'none' });
        }
      },
      fail: function () { wx.showToast({ title: '加入失败', icon: 'none' }); }
    });
  },

  onDeleteGroup: function () {
    var groupId = this.data.currentGroupId;
    var groupName = this.data.currentGroup && this.data.currentGroup.name || '该家庭';
    if (!groupId) return;
    var that = this;
    wx.showModal({
      title: '删除该家庭',
      content: '删除「' + groupName + '」后，家庭内所有物品将一并清除且不可恢复。确定要删除吗？',
      confirmText: '删除',
      confirmColor: '#F87171',
      success: function (res) {
        if (res.confirm) {
          var openid = getApp().globalData.openid;
          wx.cloud.callFunction({
            name: 'eventService',
            data: { action: 'deleteGroup', data: { openid: openid, groupId: groupId } },
            success: function (ret) {
              if (ret.result && ret.result.success) {
                wx.removeStorageSync('currentGroupId');
                that.setData({ memberVisible: false, memberAnimating: false });
                that.checkGroupAndLoad();
                wx.showToast({ title: '家庭已删除', icon: 'success' });
              } else {
                wx.showToast({ title: ret.result && ret.result.message || '删除失败', icon: 'none' });
              }
            },
            fail: function () { wx.showToast({ title: '删除失败', icon: 'none' }); }
          });
        }
      }
    });
  },

  onLeaveGroup: function () {
    var groupId = this.data.currentGroupId;
    if (!groupId) return;
    var that = this;
    wx.showModal({
      title: '确认退出',
      content: '退出后你将无法查看该家庭的物品，需重新通过邀请码或链接加入。确定要退出吗？',
      confirmText: '退出',
      confirmColor: '#F87171',
      success: function (res) {
        if (res.confirm) {
          var openid = getApp().globalData.openid;
          wx.cloud.callFunction({
            name: 'eventService',
            data: { action: 'leaveGroup', data: { openid: openid, groupId: groupId } },
            success: function (ret) {
              if (ret.result && ret.result.success) {
                wx.removeStorageSync('currentGroupId');
                that.setData({ memberVisible: false, memberAnimating: false });
                that.checkGroupAndLoad();
                wx.showToast({ title: '已退出', icon: 'success' });
              } else {
                wx.showToast({ title: ret.result && ret.result.message || '退出失败', icon: 'none' });
              }
            },
            fail: function () { wx.showToast({ title: '退出失败', icon: 'none' }); }
          });
        }
      }
    });
  },

  onRemoveMember: function (e) {
    var targetOpenid = e.currentTarget.dataset.openid;
    var targetName = e.currentTarget.dataset.name;
    if (!targetOpenid) return;
    var that = this;
    wx.showModal({
      title: '移出家人',
      content: '确定要将「' + (targetName || '该成员') + '」移出该家庭吗？移出后对方需重新通过邀请码或链接加入。',
      confirmText: '移出',
      confirmColor: '#F87171',
      success: function (res) {
        if (res.confirm) {
          var openid = getApp().globalData.openid;
          var groupId = that.data.currentGroupId;
          wx.cloud.callFunction({
            name: 'eventService',
            data: { action: 'removeMember', data: { openid: openid, groupId: groupId, targetOpenid: targetOpenid } },
            success: function (ret) {
              if (ret.result && ret.result.success) {
                that.loadGroupMembersAndRole(groupId, that.data.currentGroup);
                wx.showToast({ title: '已移出', icon: 'success' });
              } else {
                wx.showToast({ title: ret.result && ret.result.message || '移出失败', icon: 'none' });
              }
            },
            fail: function () { wx.showToast({ title: '移出失败', icon: 'none' }); }
          });
        }
      }
    });
  },

  onSwitchGroup: function () {
    this.setData({ groupSwitcherVisible: true });
  },

  closeGroupSwitcher: function () {
    this.setData({ groupSwitcherVisible: false });
  },

  onSelectGroup: function (e) {
    var gid = e.currentTarget.dataset.id;
    var groups = this.data.myGroups;
    for (var i = 0; i < groups.length; i++) {
      if (groups[i]._id === gid) {
        wx.setStorageSync('currentGroupId', gid);
        this.setData({ currentGroupId: gid, currentGroup: groups[i], groupSwitcherVisible: false });
        this.loadGroupMembersAndRole(gid, groups[i]);
        this.loadItems();
        break;
      }
    }
  },

  onCopyInviteCode: function () {
    var code = this.data.currentGroup && this.data.currentGroup.inviteCode;
    if (code) {
      wx.setClipboardData({ data: code });
      wx.showToast({ title: '邀请码已复制', icon: 'success' });
    }
  },

  onGenerateInviteLink: function () {
    var code = this.data.currentGroup && this.data.currentGroup.inviteCode;
    if (!code) return;
    var that = this;
    wx.cloud.callFunction({
      name: 'generateInviteLink',
      data: { inviteCode: code },
      success: function (res) {
        if (res.result && res.result.success && res.result.url) {
          wx.setClipboardData({ data: res.result.url });
          wx.showToast({ title: '链接已复制', icon: 'success' });
        } else {
          wx.showShareMenu({ withShareTicket: true });
          wx.showModal({
            title: '分享邀请',
            content: '请点击右上角「...」选择「转发」将邀请链接发给好友，或复制邀请码 ' + code + ' 让对方加入',
            showCancel: false
          });
        }
      },
      fail: function () {
        wx.showModal({
          title: '分享邀请',
          content: '可复制邀请码 ' + code + ' 发给好友，对方在「加入家庭」中输入即可加入',
          showCancel: false
        });
      }
    });
  },

  onShareAppMessage: function () {
    var code = this.data.currentGroup && this.data.currentGroup.inviteCode;
    return {
      title: '邀请你加入「' + (this.data.currentGroup && this.data.currentGroup.name || '') + '」- 冰箱物品记录',
      path: '/pages/index/index?inviteCode=' + (code || '')
    };
  },

  onAddItem: function () {
    this.setData({
      editingItem: null,
      itemName: '',
      itemNote: '',
      nameValid: false,
      countdownDays: '3'
    });
    this.showItemModal();
  },

  onItemClick: function (e) {
    var id = e.currentTarget.dataset.id;
    var items = this.data.items;
    var item = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) { item = items[i]; break; }
    }
    if (!item) return;
    var daysStr = item.daysLeft >= 0 ? String(item.daysLeft) : '3';
    this.setData({
      editingItem: item,
      itemName: item.title,
      itemNote: item.note || '',
      nameValid: !!(item.title && item.title.trim()),
      countdownDays: daysStr
    });
    this.showItemModal();
  },

  showItemModal: function () {
    this.setData({ modalVisible: true });
    var that = this;
    setTimeout(function () { that.setData({ modalAnimating: true }); }, 50);
  },

  closeItemModal: function () {
    this.setData({ modalAnimating: false });
    var that = this;
    setTimeout(function () {
      that.setData({ modalVisible: false, editingItem: null, itemName: '', itemNote: '', nameValid: false });
    }, 300);
  },

  onItemNameInput: function (e) {
    this.setData({ itemName: e.detail.value, nameValid: !!e.detail.value.trim() });
  },

  onCountdownInput: function (e) {
    var val = e.detail.value.replace(/\D/g, '');
    this.setData({ countdownDays: val });
  },

  onCountdownQuick: function (e) {
    var days = e.currentTarget.dataset.days;
    this.setData({ countdownDays: String(days) });
  },

  onItemNoteInput: function (e) {
    this.setData({ itemNote: e.detail.value });
  },

  onSaveItem: function () {
    var data = this.data;
    var trimmed = data.itemName.trim();
    if (!trimmed) return;

    var daysToAdd = parseInt(data.countdownDays, 10);
    if (isNaN(daysToAdd) || daysToAdd < 1 || daysToAdd > 999) {
      wx.showToast({ title: '请输入有效天数（1-999）', icon: 'none' });
      return;
    }
    var today = new Date();
    var expDate = new Date(today);
    expDate.setDate(expDate.getDate() + daysToAdd);
    var parsed = {
      year: expDate.getFullYear(),
      month: expDate.getMonth() + 1,
      day: expDate.getDate()
    };

    var that = this;
    var groupId = data.currentGroupId;
    var memberName = data.currentUser ? data.currentUser.name : '未知';
    var note = (data.itemNote || '').trim();

    var daysLeft = getDaysLeft(parsed.year, parsed.month, parsed.day);
    var needSubscribe = daysLeft >= 1 && daysLeft <= 3;

    var doSave = function (subscribeAccepted) {
      if (data.editingItem) {
        wx.cloud.callFunction({
          name: 'eventService',
          data: {
            action: 'update',
            data: {
              _id: data.editingItem._id,
              title: trimmed,
              note: note,
              year: parsed.year,
              month: parsed.month,
              day: parsed.day
            }
          },
          success: function () {
            that.loadItems();
          }
        });
        that.closeItemModal();
        return;
      }

      wx.cloud.callFunction({
        name: 'eventService',
        data: {
          action: 'add',
          data: {
            groupId: groupId || '',
            title: trimmed,
            note: note,
            memberId: data.currentUserId,
            memberName: memberName,
            year: parsed.year,
            month: parsed.month,
            day: parsed.day
          }
        },
        success: function () {
          that.loadItems();
          if (needSubscribe && subscribeAccepted) {
            wx.showToast({ title: '已添加，临期将收到提醒', icon: 'success' });
          }
        }
      });
      that.closeItemModal();
    };

    if (needSubscribe && !data.editingItem) {
      wx.requestSubscribeMessage({
        tmplIds: [TEMPLATE_ID],
        success: function (res) {
          var accepted = res[TEMPLATE_ID] === 'accept';
          doSave(accepted);
        },
        fail: function () { doSave(false); }
      });
    } else {
      doSave(false);
    }
  },

  onQuickDelete: function (e) {
    var id = e.currentTarget.dataset.id;
    var items = this.data.items;
    var item = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) { item = items[i]; break; }
    }
    if (!item) return;
    var that = this;
    wx.showModal({
      title: '删除物品',
      content: '确定要删除「' + (item.title || '') + '」吗？',
      confirmText: '删除',
      confirmColor: '#F87171',
      success: function (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'eventService',
            data: { action: 'delete', data: { _id: item._id } },
            success: function () {
              that.loadItems();
              wx.showToast({ title: '已删除', icon: 'success' });
            },
            fail: function () { wx.showToast({ title: '删除失败', icon: 'none' }); }
          });
        }
      }
    });
  },

  onClearExpired: function () {
    var items = this.data.items;
    var expired = items.filter(function (x) { return x.daysLeft < 0; });
    if (expired.length === 0) {
      wx.showToast({ title: '暂无过期物品', icon: 'none' });
      return;
    }
    var that = this;
    wx.showModal({
      title: '清除过期物品',
      content: '确定要删除 ' + expired.length + ' 件过期物品吗？',
      confirmText: '清除',
      confirmColor: '#F87171',
      success: function (res) {
        if (res.confirm) {
          var ids = expired.map(function (x) { return x._id; });
          wx.cloud.callFunction({
            name: 'eventService',
            data: { action: 'deleteMany', data: { ids: ids } },
            success: function (ret) {
              if (ret.result && ret.result.success) {
                that.loadItems();
                wx.showToast({ title: '已清除 ' + ret.result.deleted + ' 件', icon: 'success' });
              } else {
                wx.showToast({ title: '清除失败', icon: 'none' });
              }
            },
            fail: function () { wx.showToast({ title: '清除失败', icon: 'none' }); }
          });
        }
      }
    });
  },

  onDeleteItem: function () {
    var item = this.data.editingItem;
    if (!item) return;
    var that = this;
    wx.showModal({
      title: '删除物品',
      content: '确定要删除「' + (item.title || '') + '」吗？',
      confirmText: '删除',
      confirmColor: '#F87171',
      success: function (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'eventService',
            data: { action: 'delete', data: { _id: item._id } },
            success: function () {
              that.loadItems();
              that.closeItemModal();
              wx.showToast({ title: '已删除', icon: 'success' });
            },
            fail: function () { wx.showToast({ title: '删除失败', icon: 'none' }); }
          });
        }
      }
    });
  },

  onBellTap: function () {
    wx.requestSubscribeMessage({
      tmplIds: [TEMPLATE_ID],
      success: function (res) {
        if (res[TEMPLATE_ID] === 'accept') {
          wx.showToast({ title: '通知已授权', icon: 'success' });
        } else {
          wx.showToast({ title: '未开启通知', icon: 'none' });
        }
      },
      fail: function (err) {
        var msg = '授权失败';
        if (err && err.errMsg) {
          if (err.errMsg.indexOf('user refuse') >= 0 || (err.errCode === 43101)) {
            msg = '您已拒绝或关闭了通知';
          } else if (err.errMsg.indexOf('cancel') >= 0 || (err.errCode === 43102)) {
            msg = '已取消授权';
          } else if (err.errMsg.indexOf('fail') >= 0) {
            msg = '请检查：1.模板是否已添加到小程序 2.在真机测试';
          }
        }
        wx.showToast({ title: msg, icon: 'none', duration: 2500 });
      }
    });
  },

  onMenuClick: function () {
    this.setData({ memberVisible: true });
    var that = this;
    setTimeout(function () { that.setData({ memberAnimating: true }); }, 50);
  },

  closeMemberModal: function () {
    this.setData({ memberAnimating: false });
    var that = this;
    setTimeout(function () { that.setData({ memberVisible: false }); }, 300);
  },

  noop: function () {},
});
