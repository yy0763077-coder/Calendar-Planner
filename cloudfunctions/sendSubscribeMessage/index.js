const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const { touser, time6, thing9, thing15 } = event

  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: touser,
      page: 'pages/index/index',
      data: {
        time6: { value: time6 },
        thing9: { value: thing9 },
        thing15: { value: thing15 }
      },
      templateId: 'dbYqfPJBdtx2jeglq9-qPwDhnj2G5jfRizKpb5NP8RU'
    })
    return {
      success: true,
      message: '推送成功',
      errCode: 0
    }
  } catch (err) {
    return {
      success: false,
      message: '推送失败',
      errCode: err.errCode ? Number(err.errCode) : 0,
      errMsg: String(err.errMsg || '')
    }
  }
}
