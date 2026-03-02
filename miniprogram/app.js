App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }

    wx.cloud.init({
      env: "cloud1-7gfhlpf84d456b88",
      traceUser: true
    });

    this.fetchOpenId();
  },

  fetchOpenId: function () {
    var that = this;
    wx.cloud.callFunction({
      name: 'getOpenId',
      success: function (res) {
        var openid = res.result && res.result.openid;
        if (openid) {
          that.globalData.openid = openid;
          wx.cloud.callFunction({
            name: 'eventService',
            data: { action: 'saveUser', data: { openid: openid } }
          });
          var cbs = that._openidCallbacks || [];
          that._openidCallbacks = [];
          for (var i = 0; i < cbs.length; i++) cbs[i](openid);
        }
      },
      fail: function (err) {
        console.error('[App] openid 获取失败:', err);
        that._notifyOpenidFail();
      }
    });
  },

  getOpenid: function (cb) {
    if (this.globalData.openid) {
      cb(this.globalData.openid);
    } else {
      if (!this._openidCallbacks) this._openidCallbacks = [];
      this._openidCallbacks.push(cb);
    }
  },

  _notifyOpenidFail: function () {
    var cbs = this._openidCallbacks || [];
    this._openidCallbacks = [];
    for (var i = 0; i < cbs.length; i++) cbs[i](null);
  },

  globalData: {
    openid: ''
  }
});
