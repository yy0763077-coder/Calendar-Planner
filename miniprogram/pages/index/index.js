var calendar = require('../../utils/calendar');

var now = new Date();
var TEMPLATE_ID = 'dbYqfPJBdtx2jeglq9-qPwDhnj2G5jfRizKpb5NP8RU';

Page({
  data: {
    statusBarHeight: 0,
    calendarHeight: 500,
    dropdownTop: 100,

    year: now.getFullYear(),
    month: now.getMonth() + 1,
    monthName: calendar.MONTH_NAMES[now.getMonth()],
    members: [],
    events: [],
    currentUserId: '',
    currentUser: null,
    currentGroupId: '',
    currentGroup: null,
    myGroups: [],

    weekdays: calendar.WEEKDAYS,
    weeks: [],
    monthNames: calendar.MONTH_NAMES,

    rolePickerVisible: false,
    groupGateVisible: false,
    createGroupVisible: false,
    joinGroupVisible: false,
    groupSwitcherVisible: false,
    newGroupName: '',
    joinInviteCode: '',

    modalVisible: false,
    modalAnimating: false,
    editingEvent: null,
    targetDay: null,
    displayDay: null,
    eventTitle: '',
    titleValid: false,

    pickerVisible: false,
    pickerAnimating: false,
    pickerYear: now.getFullYear(),

    memberVisible: false,
    memberAnimating: false,
    addingMember: false,
    newMemberName: '',

    editProfileVisible: false,
    editProfileName: '',
    editProfileColorIdx: 0,

    joinSuccessVisible: false,
    joinSuccessGroupName: '',
    joinSuccessViaLink: false,

    myRole: '',
    dropdownOpen: false,

    headerRightPadding: 96,

    colorOptions: [
      { bg: 'rgba(181,232,224,0.4)', text: '#115E59' },
      { bg: 'rgba(208,225,249,0.4)', text: '#1E40AF' },
      { bg: 'rgba(246,198,234,0.3)', text: '#9D174D' },
      { bg: 'rgba(255,214,165,0.4)', text: '#9A3412' },
      { bg: 'rgba(226,209,249,0.4)', text: '#6B21A8' }
    ],
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
    this.setData({ statusBarHeight: statusBarHeight, dropdownTop: statusBarHeight + 60, headerRightPadding: headerRightPadding });

    if (options && options.inviteCode) {
      this._pendingInviteCode = options.inviteCode;
    }
    var d = this.data;
    var days = calendar.generateCalendarDays(d.year, d.month, [], []);
    var weeks = calendar.buildWeeks(d.year, d.month, days);
    this.setData({ weeks: weeks });
    this.checkGroupAndLoad();
  },

  onShow: function () {
    if (this._backfillScheduled) return;
    this._backfillScheduled = true;
    var that = this;
    setTimeout(function () { that.runBackfill(); }, 800);
  },

  onReady: function () {
    this.computeCalendarHeight();
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

        var events = [];
        for (var k = 0; k < eventsRaw.length; k++) {
          var r = eventsRaw[k];
          events.push({
            _id: r._id,
            id: r._id,
            title: r.title,
            memberId: r.memberId,
            memberName: r.memberName || '',
            year: r.year,
            month: r.month,
            day: r.day,
            groupId: r.groupId
          });
        }

        that.setData({
          members: members,
          currentUserId: savedId || '',
          currentUser: currentUser,
          myRole: myRole,
          events: events,
          rolePickerVisible: !currentUser
        });
        that.refreshCalendar();
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
              wx.showToast({ title: '你已在组内', icon: 'none' });
            } else {
              that.setData({
                joinSuccessVisible: true,
                joinSuccessGroupName: res.result.groupName || '该组',
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

        that.setData({ members: members, currentUserId: savedId || '', currentUser: currentUser, myRole: myRole, rolePickerVisible: !currentUser });
        if (onDone) onDone(); else that.refreshCalendar();
      }
    });
  },

  onSelectRole: function (e) {
    var id = e.currentTarget.dataset.id;
    var groupId = this.data.currentGroupId;
    wx.setStorageSync('selectedMemberId_' + (groupId || ''), id);
    wx.setStorageSync('selectedMemberId', id);
    var members = this.data.members;
    for (var i = 0; i < members.length; i++) {
      if (members[i].id === id) {
        this.setData({ currentUserId: id, currentUser: members[i], rolePickerVisible: false });
        break;
      }
    }
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
    if (!name) { wx.showToast({ title: '请输入组名', icon: 'none' }); return; }
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
          that.loadEvents();
          wx.showToast({ title: '组已创建', icon: 'success' });
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
            joinSuccessGroupName: res.result.groupName || '该组',
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
    var groupName = this.data.currentGroup && this.data.currentGroup.name || '该组';
    if (!groupId) return;
    var that = this;
    wx.showModal({
      title: '删除该组',
      content: '删除「' + groupName + '」后，组内所有行程将一并清除且不可恢复。确定要删除吗？',
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
                wx.showToast({ title: '组已删除', icon: 'success' });
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
      content: '退出后你将无法查看该组的行程，需重新通过邀请码或链接加入。确定要退出吗？',
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
      title: '移出成员',
      content: '确定要将「' + (targetName || '该成员') + '」移出该组吗？移出后对方需重新通过邀请码或链接加入。',
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
        this.loadEvents();
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
          content: '可复制邀请码 ' + code + ' 发给好友，对方在「加入组」中输入即可加入',
          showCancel: false
        });
      }
    });
  },

  onShareAppMessage: function () {
    var code = this.data.currentGroup && this.data.currentGroup.inviteCode;
    return {
      title: '邀请你加入「' + (this.data.currentGroup && this.data.currentGroup.name || '') + '」',
      path: '/pages/index/index?inviteCode=' + (code || '')
    };
  },

  onShowEditProfile: function () {
    var u = this.data.currentUser;
    if (!u) return;
    var idx = 0;
    for (var i = 0; i < calendar.EVENT_COLORS.length; i++) {
      if (calendar.EVENT_COLORS[i].bg === u.color.bg) { idx = i; break; }
    }
    this.setData({ editProfileVisible: true, editProfileName: u.name, editProfileColorIdx: idx });
  },

  closeEditProfile: function () {
    this.setData({ editProfileVisible: false });
  },

  onEditProfileNameInput: function (e) {
    this.setData({ editProfileName: e.detail.value });
  },

  onEditProfileColorSelect: function (e) {
    this.setData({ editProfileColorIdx: parseInt(e.currentTarget.dataset.idx, 10) });
  },

  onSaveEditProfile: function () {
    var name = this.data.editProfileName.trim();
    if (!name) { wx.showToast({ title: '请输入名字', icon: 'none' }); return; }
    var idx = this.data.editProfileColorIdx;
    var color = calendar.EVENT_COLORS[idx % calendar.EVENT_COLORS.length];
    var app = getApp();
    var openid = app.globalData.openid;
    if (!openid) return;

    var that = this;
    wx.cloud.callFunction({
      name: 'eventService',
      data: { action: 'updateMemberProfile', data: { groupId: that.data.currentGroupId, openid: openid, memberName: name, color: color } },
      success: function () {
        that.setData({ editProfileVisible: false });
        that.loadGroupMembersAndRole(that.data.currentGroupId, that.data.currentGroup);
        that.loadEvents();
        wx.showToast({ title: '已保存', icon: 'success' });
      },
      fail: function () { wx.showToast({ title: '保存失败', icon: 'none' }); }
    });
  },

  loadEvents: function (onDone) {
    var that = this;
    var groupId = this.data.currentGroupId;
    wx.cloud.callFunction({
      name: 'eventService',
      data: { action: 'list', data: { groupId: groupId || '' } },
      success: function (res) {
        if (res.result && res.result.success) {
          var records = res.result.data || [];
          var events = [];
          for (var i = 0; i < records.length; i++) {
            var r = records[i];
            events.push({
              _id: r._id,
              id: r._id,
              title: r.title,
              memberId: r.memberId,
              memberName: r.memberName || '',
              year: r.year,
              month: r.month,
              day: r.day,
              groupId: r.groupId
            });
          }
          that.setData({ events: events });
          if (onDone) onDone(); else that.refreshCalendar();
        }
      },
      fail: function () { if (onDone) onDone(); else console.error('[DB] 加载日程失败'); }
    });
  },

  computeCalendarHeight: function () {
    var that = this;
    var wh = this._windowHeight || 0;
    if (!wh) try { wh = wx.getWindowInfo().windowHeight; } catch (e) { wh = wx.getSystemInfoSync().windowHeight; }
    var query = wx.createSelectorQuery();
    query.select('.top-section').boundingClientRect();
    query.exec(function (res) {
      if (res[0]) that.setData({ calendarHeight: wh - res[0].bottom });
    });
  },

  refreshCalendar: function () {
    var d = this.data;
    var days = calendar.generateCalendarDays(d.year, d.month, d.events, d.members);
    var weeks = calendar.buildWeeks(d.year, d.month, days);
    this.setData({ weeks: weeks, monthName: calendar.MONTH_NAMES[d.month - 1] });
  },

  onCalendarTouchStart: function (e) {
    this._touchStartX = e.touches && e.touches[0] ? e.touches[0].clientX : 0;
    this._touchStartY = e.touches && e.touches[0] ? e.touches[0].clientY : 0;
  },

  onCalendarTouchEnd: function (e) {
    var startX = this._touchStartX;
    var startY = this._touchStartY;
    if (startX == null) return;
    var endX = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : startX;
    var endY = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : startY;
    var deltaX = endX - startX;
    var deltaY = endY - startY;
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        this.onPrevMonth();
      } else {
        this.onNextMonth();
      }
    }
  },

  onPrevMonth: function () {
    var year = this.data.year, month = this.data.month;
    if (month === 1) { year--; month = 12; } else { month--; }
    this.setData({ year: year, month: month });
    this.refreshCalendar();
    var that = this;
    setTimeout(function () { that.computeCalendarHeight(); }, 100);
  },

  onNextMonth: function () {
    var year = this.data.year, month = this.data.month;
    if (month === 12) { year++; month = 1; } else { month++; }
    this.setData({ year: year, month: month });
    this.refreshCalendar();
    var that = this;
    setTimeout(function () { that.computeCalendarHeight(); }, 100);
  },

  onMonthClick: function () {
    this.setData({ pickerYear: this.data.year, pickerVisible: true });
    var that = this;
    setTimeout(function () { that.setData({ pickerAnimating: true }); }, 50);
  },

  closeMonthPicker: function () {
    this.setData({ pickerAnimating: false });
    var that = this;
    setTimeout(function () { that.setData({ pickerVisible: false }); }, 300);
  },

  onPickerPrevYear: function () { this.setData({ pickerYear: this.data.pickerYear - 1 }); },
  onPickerNextYear: function () { this.setData({ pickerYear: this.data.pickerYear + 1 }); },

  onSelectMonth: function (e) {
    var month = e.currentTarget.dataset.month;
    this.setData({ year: this.data.pickerYear, month: month });
    this.refreshCalendar();
    this.closeMonthPicker();
    var that = this;
    setTimeout(function () { that.computeCalendarHeight(); }, 400);
  },

  onDayClick: function (e) {
    var day = e.currentTarget.dataset.day;
    if (!day) return;
    this.setData({ editingEvent: null, targetDay: day, displayDay: day, eventTitle: '', titleValid: false });
    this.showEventModal();
  },

  onEventClick: function (e) {
    var eventId = e.currentTarget.dataset.eventId;
    var day = parseInt(e.currentTarget.dataset.day);
    var events = this.data.events;
    var ev = null;
    for (var i = 0; i < events.length; i++) {
      if (events[i].id === eventId) { ev = events[i]; break; }
    }
    if (ev) {
      this.setData({ editingEvent: ev, targetDay: null, displayDay: day, eventTitle: ev.title, titleValid: !!ev.title.trim() });
      this.showEventModal();
    }
  },

  showEventModal: function () {
    this.setData({ modalVisible: true });
    var that = this;
    setTimeout(function () { that.setData({ modalAnimating: true }); }, 50);
  },

  closeEventModal: function () {
    this.setData({ modalAnimating: false });
    var that = this;
    setTimeout(function () {
      that.setData({ modalVisible: false, editingEvent: null, targetDay: null, displayDay: null, eventTitle: '', titleValid: false });
    }, 300);
  },

  onTitleInput: function (e) {
    this.setData({ eventTitle: e.detail.value, titleValid: !!e.detail.value.trim() });
  },

  onSaveEvent: function () {
    var data = this.data;
    var trimmed = data.eventTitle.trim();
    if (!trimmed) return;

    var that = this;
    var groupId = data.currentGroupId;
    var memberName = data.currentUser ? data.currentUser.name : '未知';

    var today = new Date();
    var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var eventYear, eventMonth, eventDay;
    if (data.editingEvent) {
      eventYear = data.editingEvent.year;
      eventMonth = data.editingEvent.month;
      eventDay = data.editingEvent.day;
    } else if (data.targetDay) {
      eventYear = data.year;
      eventMonth = data.month;
      eventDay = data.targetDay;
    } else {
      this.closeEventModal();
      return;
    }
    var eventDate = new Date(eventYear, eventMonth - 1, eventDay);
    var isToday = eventDate.getTime() === todayStart.getTime();
    var isFuture = eventDate >= todayStart;

    var doSave = function (subscribeAccepted) {
      if (data.editingEvent) {
        wx.cloud.callFunction({
          name: 'eventService',
          data: { action: 'update', data: { _id: data.editingEvent._id, title: trimmed } },
          success: function () {
            that.loadEvents();
            if (isToday && subscribeAccepted) that.sendNotifyForDate(eventYear, eventMonth, eventDay);
          }
        });
      } else if (data.targetDay) {
        wx.cloud.callFunction({
          name: 'eventService',
          data: {
            action: 'add',
            data: {
              groupId: groupId || '',
              title: trimmed,
              memberId: data.currentUserId,
              memberName: memberName,
              year: data.year,
              month: data.month,
              day: data.targetDay
            }
          },
          success: function () {
            that.loadEvents();
            if (isToday && subscribeAccepted) that.sendNotifyForDate(eventYear, eventMonth, eventDay);
          }
        });
      }
      that.closeEventModal();
    };

    if (eventDate < todayStart) {
      doSave(false);
      return;
    }

    if (isToday || isFuture) {
      var tryRequest = function () {
        wx.requestSubscribeMessage({
          tmplIds: [TEMPLATE_ID],
          success: function (res) {
            var accepted = res[TEMPLATE_ID] === 'accept';
            doSave(accepted);
            if (isFuture && !isToday && accepted) wx.showToast({ title: '届时将发送通知', icon: 'success' });
          },
          fail: function () { doSave(false); }
        });
      };
      that.checkSubscribeAccepted(function (accepted) {
        if (accepted) {
          doSave(true);
          if (isFuture && !isToday) wx.showToast({ title: '届时将发送通知', icon: 'success' });
        } else {
          tryRequest();
        }
      });
    } else {
      doSave(false);
    }
  },

  syncGroupPersonas: function () {
    var members = this.data.members;
    var groupId = this.data.currentGroupId;
    if (!groupId || !members.length) return;
    var personas = members.map(function (m) { return { id: m.id, name: m.name }; });
    wx.cloud.callFunction({
      name: 'eventService',
      data: { action: 'syncGroupPersonas', data: { groupId: groupId, personas: personas } }
    });
  },

  onDeleteEvent: function () {
    var ev = this.data.editingEvent;
    if (!ev) return;
    var evYear = ev.year, evMonth = ev.month, evDay = ev.day;
    var that = this;

    var today = new Date();
    var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var eventDate = new Date(evYear, evMonth - 1, evDay);
    var isToday = eventDate.getTime() === todayStart.getTime();
    var isFuture = eventDate >= todayStart;

    var doDelete = function (subscribeAccepted) {
      var delTitle = ev.title || '';
      var delUserName = (that.data.currentUser && that.data.currentUser.name) || '未知';
      wx.cloud.callFunction({
        name: 'eventService',
        data: { action: 'delete', data: { _id: ev._id } },
        success: function () {
          that.loadEvents();
          if (isToday && subscribeAccepted) {
            that.sendDeleteNotify(delUserName, delTitle);
          }
        }
      });
      that.closeEventModal();
    };

    if (eventDate < todayStart) {
      doDelete(false);
      return;
    }

    if (isToday || isFuture) {
      var tryRequest = function () {
        wx.requestSubscribeMessage({
          tmplIds: [TEMPLATE_ID],
          success: function (res) {
            var accepted = res[TEMPLATE_ID] === 'accept';
            doDelete(accepted);
            if (isFuture && !isToday && accepted) wx.showToast({ title: '届时将发送通知', icon: 'success' });
          },
          fail: function () { doDelete(false); }
        });
      };
      that.checkSubscribeAccepted(function (accepted) {
        if (accepted) {
          doDelete(true);
          if (isFuture && !isToday) wx.showToast({ title: '届时将发送通知', icon: 'success' });
        } else {
          tryRequest();
        }
      });
    } else {
      doDelete(false);
    }
  },

  sendNotifyForDate: function (year, month, day) {
    var groupId = this.data.currentGroupId || '';
    wx.cloud.callFunction({
      name: 'notifyUsers',
      data: { year: year, month: month, day: day, groupId: groupId },
      success: function (res) {
        if (res.result && res.result.success) {
          wx.showToast({ title: '已通知 ' + (res.result.sent || 0) + ' 位成员', icon: 'success' });
        }
      }
    });
  },

  sendDeleteNotify: function (userName, eventTitle) {
    var groupId = this.data.currentGroupId || '';
    if (!groupId) return;
    wx.cloud.callFunction({
      name: 'notifyUsers',
      data: { mode: 'delete', groupId: groupId, userName: userName, eventTitle: eventTitle },
      success: function (res) {
        if (res.result && res.result.success && (res.result.sent || 0) > 0) {
          wx.showToast({ title: '已通知 ' + res.result.sent + ' 位成员', icon: 'success' });
        }
      }
    });
  },

  checkSubscribeAccepted: function (cb) {
    wx.getSetting({
      withSubscriptions: true,
      success: function (res) {
        var settings = res.subscriptionsSetting && res.subscriptionsSetting.itemSettings;
        var accepted = settings && settings[TEMPLATE_ID] === 'accept';
        cb(!!accepted);
      },
      fail: function () { cb(false); }
    });
  },

  onBellTap: function () {
    wx.requestSubscribeMessage({
      tmplIds: [TEMPLATE_ID],
      success: function (res) {
        wx.showToast({ title: res[TEMPLATE_ID] === 'accept' ? '通知已授权' : '未开启通知', icon: res[TEMPLATE_ID] === 'accept' ? 'success' : 'none' });
      },
      fail: function () { wx.showToast({ title: '授权失败', icon: 'none' }); }
    });
  },

  onMenuClick: function () {
    this.setData({ memberVisible: true, addingMember: false, newMemberName: '' });
    var that = this;
    setTimeout(function () { that.setData({ memberAnimating: true }); }, 50);
  },

  closeMemberModal: function () {
    this.setData({ memberAnimating: false });
    var that = this;
    setTimeout(function () { that.setData({ memberVisible: false }); }, 300);
  },

  onMemberRowTap: function (e) {
    this.switchUser(e.currentTarget.dataset.id);
  },

  onMemberClick: function (e) {
    this.switchUser(e.currentTarget.dataset.id);
  },

  switchUser: function (id) {
    var members = this.data.members;
    for (var i = 0; i < members.length; i++) {
      if (members[i].id === id) {
        this.setData({ currentUserId: id, currentUser: members[i] });
        return;
      }
    }
  },



  toggleDropdown: function () { this.setData({ dropdownOpen: !this.data.dropdownOpen }); },
  closeDropdown: function () { this.setData({ dropdownOpen: false }); },

  onSwitchUser: function (e) {
    this.switchUser(e.currentTarget.dataset.id);
    this.setData({ dropdownOpen: false });
  },

  noop: function () {},
});
