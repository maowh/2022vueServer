const expressJwt = require('express-jwt')
const { PRIVATE_KEY } = require('../untils/constant')

const jwtAuth = expressJwt({
  // 解析jwt的秘钥（第3段）
  secret: PRIVATE_KEY,
  // jwt的算法
  algorithms: ['HS256'],
  // 如果设置为false不进行校验，游客也可以登录
  credentialsRequired: true,
}).unless({
  // 设置jwt认证白名单
  path: ['/', '/user/login'],
})

module.exports = jwtAuth
