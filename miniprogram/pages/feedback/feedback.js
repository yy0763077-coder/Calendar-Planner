Page({
  data: {
    feedbackText: '',
    canSubmit: false
  },

  onFeedbackInput: function (e) {
    var val = (e.detail.value || '').trim();
    this.setData({
      feedbackText: e.detail.value,
      canSubmit: val.length > 0
    });
  },

  onSubmit: function () {
    var text = this.data.feedbackText.trim();
    if (!text) {
      wx.showToast({ title: '请填写反馈内容', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中...' });
    var that = this;
    wx.cloud.callFunction({
      name: 'sendFeedback',
      data: { content: text }
    }).then(function (res) {
      wx.hideLoading();
      if (res.result && res.result.success) {
        wx.showToast({ title: '提交成功', icon: 'success' });
        that.setData({ feedbackText: '', canSubmit: false });
        setTimeout(function () { wx.navigateBack(); }, 1500);
      } else {
        wx.showToast({
          title: res.result && res.result.message ? res.result.message : '提交失败，请稍后重试',
          icon: 'none',
          duration: 2500
        });
      }
    }).catch(function (err) {
      wx.hideLoading();
      wx.showToast({
        title: err.errMsg || '网络异常，请稍后重试',
        icon: 'none',
        duration: 2500
      });
    });
  }
});
