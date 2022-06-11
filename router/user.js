const express = require('express')
const Result = require('../models/Result')
const { login, findUser } = require('../services/user')
const { md5, decoded } = require('../untils')
const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require('../untils/constant')
const { body, validationResult } = require('express-validator')
const boom = require('boom')
const jwt = require('jsonwebtoken')

const router = express.Router()

router.post(
  '/login',
  [
    body('username').isString().withMessage('用户名必须是字符'),
    body('password').isString().withMessage('密码必须是字符'),
  ],
  function (req, res, next) {
    const err = validationResult(req)
    console.log(err)
    // 如果validationResult校验不为空，则取得校验报错信息
    if (!err.isEmpty()) {
      const msg = err.errors[0].msg
      // 将报错信息返回给前端
      next(boom.badRequest(msg))
    } else {
      let { username, password } = req.body
      // 将密码进行加密，password和PWD_SALT合并后加密
      // password = md5(`${password}${PWD_SALT}`)
      login(username, password).then((user) => {
        if (!user || user.length === 0) {
          new Result('登录失败').fail(res)
        } else {
          // 登录后设置jwt的token信息
          const token = jwt.sign({ username }, PRIVATE_KEY, { expiresIn: JWT_EXPIRED })
          new Result({ token }, '登录成功').success(res)
        }
      })
    }
  }
)

router.get('/info', function (req, res, next) {
  const decode = decoded(req)
  console.log(decode)
  if (decode && decode.username) {
    findUser(decode.username).then((user) => {
      console.log(user)
      if (user) {
        // 获取role值
        user.roles = [user.role]
        new Result(user, '用户信息查询成功').success(res)
      } else {
        new Result('用户信息查询失败').fail(res)
      }
    })
  } else {
    new Result('用户信息查询失败').fail(res)
  }
})

module.exports = router
