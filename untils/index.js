const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('./constant')

// 判断数据类型是否为对象
function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function md5(s) {
  // 注意参数需要为String类型，否则会出错
  return crypto.createHash('md5').update(String(s)).digest('hex')
}

function decoded(req) {
  // 获取Authorization里面的信息
  let token = req.get('Authorization')
  console.log(token)
  if (token.indexOf('Bearer') === 0) {
    // 将前面的Bearer和一个空格替换为空
    token = token.replace('Bearer ', '')
  }
  // 解析token数据
  return jwt.verify(token, PRIVATE_KEY)
}

module.exports = { md5, decoded, isObject }
