const express = require('express')
const multer = require('multer')
const boom = require('boom')

const roleService = require('../services/role')
const Result = require('../models/Result')
const Img = require('../models/Img')
const { UPLOAD_PATH_IMG } = require('../utils/constant')

const router = express.Router()

// 用户管理
// 获取用户列表
router.get('/userRoleList', function(req, res, next) {
  roleService
    .getUserRoleList(req.query)
    .then(result => {
      new Result(result, '查询用户数据信息成功').success(res)
    })
    .catch(err => {
      next(boom.badImplementation(err))
    })
})
// 删除用户
router.get('/deleteUser', function(req, res, next) {
  roleService
    .deleteUser(req.query)
    .then(result => {
      new Result('删除用户数据信息成功').success(res)
    })
    .catch(err => {
      next(boom.badImplementation(err))
    })
})

// 新增用户时上传的图像
router.post(
  '/addUserAvatar',
  multer({ dest: `${UPLOAD_PATH_IMG}` }).single('file'),
  function(req, res, next) {
      if (!req.file || req.file.length === 0) {
        new Result('上传头像失败').fail(res)
      } else {
        const img = new Img(req.file)
        if(img){
          new Result(img.url,'上传头像成功').success(res)
        }else{
          next(boom.badImplementation(err))
        }
      }
  }
)

// 获取角色表信息
router.get('/getRoleList',function(req,res,next){
  roleService.getRoleList(req.query).then((result) => {
    new Result(result, '查询角色表数据信息成功').success(res)
  }).catch((err) => {
    next(boom.badImplementation(err))
  })
})

// 新增用户
router.post('/addUserList',function(req,res,next){
  roleService.addUserList(req.query).then((result) => {
    new Result( '插入用户数据成功').success(res)
  }).catch((err) => {
    next(boom.badImplementation(err))
  })
})


// 编辑用户
router.post('/updateUser',function(req,res,next){
  roleService.updateUser(req.query).then((result) => {
    new Result( '更改用户数据成功').success(res)
  }).catch((err) => {
    next(boom.badImplementation(err))
  })
})

// 菜单管理

// 获取菜单列表
router.get('/getMenuList',function(req,res,next){
  roleService.getMenuList(req.query).then((result) => {
    new Result(result,'查询菜单列表成功').success(res)
  }).catch((err) => {
    next(boom.badImplementation(err))
  })
})

// 删除菜单
router.get('/deleteMenu',function(req,res,next){
  roleService.deleteMenu(req.query).then((result) => {
    new Result(result,'删除菜单项成功').success(res)
  }).catch((err) => {
    next(boom.badImplementation(err))
  })
})

// 添加菜单
router.get('/addMenu',function(req,res,next){
  roleService.addMenu(req.query).then((reslut) => {
    new Result('添加菜单项成功').success(res)
  }).catch((err) => {
    next(boom.badImplementation(err))
  })
})

// 更新菜单项
router.post('/updateMenu',function(req,res,next){
  roleService.updateMenu(req.query).then((result) => {
    new Result('更新菜单项成功').success(res)
  }).catch((err) => {
    next(boom.badImplementation(err))
  })
})

// 角色管理
// 删除角色
router.get('/deleteRole',function(req,res,next){
  roleService.deleteRole(req.query).then((results) => {
    new Result('删除角色成功').success(res)
  }).catch((err) => {
    next(boom.badImplementation(err))
  })
})

// 增加角色
router.post('/addRole',function(req,res,next){
  roleService.addRole(req.query).then((result) => {
    new Result('添加角色成功').success(res)
  }).catch((err) => {
    next(boom.badImplementation(err))
  })
})

// 获取角色绑定的菜单
router.get('/getMenuRole',function(req,res,next){
  roleService.getMenuRole(req.query).then((result) => {
    new Result(result,'查询角色绑定的菜单项成功').success(res)
  }).catch((err) => {
    next(boom.badImplementation(err))
  })
})

// 更新角色
router.post('/updataRole',function(req,res,next){
  roleService.updataRole(req.query).then((result) => {
    new Result('更新角色成功').success(res)
  }).catch((err) => {
    next(boom.badImplementation(err))
  })
})

// 获取角色对应的菜单
router.get('/menu',function(req,res,next){
  roleService.getUserMenu(req.query).then((result) => {
    new Result(result,'获取角色菜单成功').success(res)
  }).catch((err) => {
    next(boom.badImplementation(err))
  })
})






module.exports = router
