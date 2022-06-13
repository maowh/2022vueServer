const db = require('../db')
const { md5 } = require('../utils')
const { PWD_SALT } = require('../utils/constant')
async function newInfo({ username }, next) {
  // 获取用户信息
  const userData = await getUser(username)
  // 获取角色ID
  const roleId = await getUserRole(userData.id)
  // 获取角色名称
  const roleName = await getRoleName(roleId)
  return {
    userData,roleName
  }
}

// 获取用户信息
function getUser(username) {
  return new Promise((resolve, reject) => {
    const sql = `select id,avatar,nickname from admin_user where username='${username}'`
    db.querySql(sql)
      .then(result => {
        resolve(queryResultConversion(result))
      })
      .catch(() => {
        reject(new Error('获取用户信息失败'))
      })
  })
}

// 获取用户角色Id
function getUserRole(userId) {
  return new Promise((resolve, reject) => {
    const getUserRoleSql = `select role_id from user_role where user_id='${userId}'`
    db.querySql(getUserRoleSql)
      .then(result => {
        resolve(result)
      })
      .catch(() => {
        reject(new Error('获取用户角色ID失败'))
      })
  })
}

// 获取角色名
async function getRoleName(roleIdList) {
  const roleNameList = []
  for (let i = 0; i < roleIdList.length; i++) {
    const getRoleNameSql = `select name as roleName from role where id='${roleIdList[i].role_id}'`
    const roleName = await db.querySql(getRoleNameSql)
    roleNameList.push(roleName[0].roleName)
  }
  return roleNameList
}

// 获取菜单ID
async function getMenuId(roleIdList) {
  const menuIDList = []
  for (let i = 0; i < roleIdList.length; i++) {
    const getMenuIdSql = `select menu_id from role_menu where role_id='${roleIdList[i]}'`
    const menuID = await db.querySql(getMenuIdSql)
    const dataString = JSON.stringify(menuID)
    const newData = JSON.parse(dataString)
    for (let j = 0; j < newData.length; j++) {
      menuIDList.push(newData[j])
    }
  }
  return unique(menuIDList)
}

// 获取菜单
async function getMenuLists(menuList) {
  const newMenuData = []
  for (let i = 0; i < menuList.length; i++) {
    const getMenuListSql = `select * from menu where id='${menuList[i].menu_id}'`
    const menuMsg = await db.querySql(getMenuListSql)
    newMenuData.push(menuMsg[0])
  }
  return newMenuData
}

// 查询结果转换
function queryResultConversion(data) {
  const dataString = JSON.stringify(data)
  const newData = JSON.parse(dataString)
  return newData[0]
}
// 数组去重
function unique(arr) {
  for (var i = 0; i < arr.length; i++) {
    for (var j = i + 1; j < arr.length; j++) {
      if (arr[i].menu_id == arr[j].menu_id) {
        arr.splice(j, 1)
        j--
      }
    }
  }
  return arr
}

// 用户管理
// 获取用户列表
async function getUserRoleList(query) {
  let userSql = `select * from admin_user `
  const { username, nickname, email, sort, page = 1, pageSize = 20 } = query
  let sortSql
  const offset = ((page - 1) * pageSize > 0 ? (page - 1) * pageSize : 0)
  let where = 'where'
  username && (where = db.andLike(where, 'username', username))
  nickname && (where = db.andLike(where, 'nickname', nickname))
  email && (where = db.andLike(where, 'email', email))
  if (sort) {
    const symbol = sort[0]
    const column = sort.slice(1, sort.length)
    const order = symbol === '+' ? 'asc' : 'desc'
    sortSql = ` order by \`${column}\` ${order}`
  }
  const pageSql = ` limit ${pageSize} offset ${offset}`
  let newCountSql = 'select count(*) as count from admin_user  ' + sortSql
  if (where !== 'where') {
    userSql = `${userSql} ${where}`
    newCountSql = 'select count(*) as count from admin_user  ' + where + sortSql
  }
  const newUserSql = userSql + sortSql + pageSql
  const count = await db.querySql(newCountSql)
  const list = await db.querySql(newUserSql)
  return { list, count: count[0].count, page, pageSize }
}

// 删除用户
function deleteUser(query) {
  const { username, id } = query
  return new Promise((resolve, reject) => {
    const deleteUserSql = `delete  from admin_user where username='${username}'`
    const selectRoleSql = `select * from user_role where user_id='${id}'`
    if (username === 'admin') {
      reject(new Error('该用户为超级管理员，无法删除'))
    } else {
      db.querySql(selectRoleSql).then(res => {
        if (res.length > 0) {
          reject(new Error('该用户已关联角色，无法删除！'))
        } else {
          db.querySql(deleteUserSql)
            .then(() => {
              resolve()
            })
            .catch(err => {
              reject(new Error('删除失败'))
            })
        }
      })
    }
  })
}


// 获取角色表信息
function getRoleList(query) {
  let sortSql
  let getRoleSql
  if (query && query.sort) {
    const { sort } = query
    if (sort) {
      const symbol = sort[0]
      const order = symbol === '+' ? 'asc' : 'desc'
      sortSql = ` order by id ${order}`
    }
    getRoleSql = 'select * from role ' + sortSql
  } else {
    getRoleSql = 'select * from role '
  }
  return new Promise((resolve, reject) => {
    db.querySql(getRoleSql)
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        reject(new Error('获取角色失败'))
      })
  })
}

// 新增用户信息
function addUserList(query) {
  return new Promise(async (resolve, reject) => {
    const keys = []
    const values = []
    const tableName = 'admin_user'
    query.password = md5(`${query.password}${PWD_SALT}`)
    Object.keys(query).forEach(key => {
      if (query.hasOwnProperty(key)) {
        keys.push(`\`${key}\``)
        values.push(`'${query[key]}'`)
      }
    })
    if (keys.length > 0 && values.length > 0) {
      let sql = `INSERT INTO \`${tableName}\` (`
      const keysString = keys.join(',')
      const valuesString = values.join(',')
      sql = `${sql}${keysString}) VALUES (${valuesString})`
      const getOneMsg = `select * from admin_user where username='${query.username}'`
      const userTrue = await db.queryOne(getOneMsg)
      if (userTrue) {
        reject(new Error('用户名已存在，无法添加'))
      } else {
        db.querySql(sql)
          .then(result => {
            const getUserOne = `select id,role from admin_user where username='${query.username}'`
            db.querySql(getUserOne)
              .then(async res => {
                const dataString = JSON.stringify(res)
                const newRes = JSON.parse(dataString)
                const newRoleId = await replaceNumber(newRes[0].role)
                newRoleId.map(item => {
                  const insertUserRoleSql = `INSERT INTO user_role (user_id,role_id) values ('${newRes[0].id}','${item}')`
                  db.querySql(insertUserRoleSql).then(result => {
                    resolve(result)
                  })
                })
              })
              .catch(err => {
                reject(new Error('添加用户失败'))
              })
          })
          .catch(err => {
            reject(new Error('添加用户失败'))
          })
      }
    }
  })
}

// 更新用户信息
function updateUser(query) {
  return new Promise(async (resolve, reject) => {
    const entry = []
    const tableName = 'admin_user'
    const id = query.id
    const connectSql = `where id='${id}'`
    delete query.id
    query.password = md5(`${query.password}${PWD_SALT}`)
    Object.keys(query).forEach(key => {
      if (query.hasOwnProperty(key)) {
        entry.push(`\`${key}\`='${query[key]}'`)
      }
    })
    if (entry.length > 0) {
      let sql = `UPDATE \`${tableName}\` SET`
      sql = `${sql} ${entry.join(',')} ${connectSql}`
      const getOneMsg = `select id from admin_user where username='${query.username}'`
      const userTrue = await db.queryOne(getOneMsg)
      if (query.username === 'admin' || id * 1 === 1) {
        reject(new Error('该用户为超级管理员，无法修改'))
      } else {
        if (userTrue && userTrue.id !== id * 1) {
          // 数据库查询的id类型为number，传递的id类型为string
          reject(new Error('用户名已存在，无法添加'))
        } else {
          await db
            .querySql(sql)
            .then(async res => {
              const newRoleId = await replaceNumber(query.role)
              console.log(newRoleId,111)
              const deleteUserSql = `delete  from user_role where  user_id='${id}'`
              db.querySql(deleteUserSql).then(res => {
                newRoleId.map(item => {
                  const insertUserRoleSql = `INSERT INTO user_role (user_id,role_id) values ('${id}','${item}')`
                  db.querySql(insertUserRoleSql).then(result => {
                    resolve(res)
                  })
                })
              })
            })
            .catch(err => {
              reject(new Error('更新用户失败'))
            })
        }
      }
    }
  })
}

// 菜单管理
// 菜单列表
async function getMenuList(query) {
  let sortSql
  let MenuListSql
  if (query && query.sort) {
    const { sort } = query
    if (sort) {
      const symbol = sort[0]
      const order = symbol === '+' ? 'asc' : 'desc'
      sortSql = ` order by sort ${order}`
    }
    MenuListSql = `select * from menu ` + sortSql
  } else {
    MenuListSql = `select * from menu `
  }
  const menuList = await db.querySql(MenuListSql)
  return menuList
}

// 删除菜单
function deleteMenu(query) {
  return new Promise((reslove, reject) => {
    const { children } = query
    const menuId =  children.split(',')
    const menuRoleSql = `select menu_id from role_menu `
    db.querySql(menuRoleSql).then(res => {
      const dataString = JSON.stringify(res)
      const menuRoleId = JSON.parse(dataString)
      const arr = []
      menuRoleId.map((item) => {
        arr.push(item.menu_id)
      })
      newArr = menuId.filter(a=>{return !arr.some(c=>(c==a))})
      if(newArr.length !== menuId.length){
        reject(new Error('该菜单已关联角色，不允许删除！'))
      }else{
        newArr.map(item => {
          const deleteMenuSql = `delete from menu where id='${item}'`
          db.querySql(deleteMenuSql)
            .then(res => {
              reslove(res)
            })
            .catch(err => {
              reject(new Error('删除失败'))
            })
        })
      }
    })
  })
}

// 添加菜单
function addMenu(query) {
  return new Promise(async (reslove, reject) => {
    const keys = []
    const values = []
    const tableName = 'menu'
    Object.keys(query).forEach(key => {
      if (query.hasOwnProperty(key)) {
        keys.push(`\`${key}\``)
        values.push(`'${query[key]}'`)
      }
    })
    if (keys.length > 0 && values.length > 0) {
      let addMenuSql = `INSERT INTO \`${tableName}\` (`
      const keysString = keys.join(',')
      const valuesString = values.join(',')
      addMenuSql = `${addMenuSql}${keysString}) VALUES (${valuesString})`
      const selectSql = `select url from menu where url='${query.url}'`
      const addMenuFlag = await db.querySql(selectSql)
      if (addMenuFlag && addMenuFlag.length > 0) {
        reject(new Error('URL已存在，无法添加'))
      } else {
        db.querySql(addMenuSql)
          .then(results => {
            reslove(results)
          })
          .catch(err => {
            reject(new Error('添加菜单项失败'))
          })
      }
    }
  })
}

// 编辑菜单
function updateMenu(query) {
  return new Promise(async (reslove, reject) => {
    const entry = []
    const id = query.id
    const tableName = 'menu'
    const connectSql = `where id='${id}'`
    delete query.id
    Object.keys(query).forEach(key => {
      if (query.hasOwnProperty(key)) {
        entry.push(`\`${key}\`='${query[key]}'`)
      }
    })
    if (entry.length > 0) {
      const selectUrl = `select id from menu where url='${query.url}'`
      const addMenuFlag = await db.querySql(selectUrl)
      if (addMenuFlag.length > 0 && addMenuFlag[0].id !== id * 1) {
        reject(new Error('URL已存在，无法添加'))
      } else {
        if (isNaN(query.sort)) {
          reject(new Error('sort字段只能为数字'))
        }
        let addMenuSql = `UPDATE \`${tableName}\` SET`
        addMenuSql = `${addMenuSql} ${entry.join(',')} ${connectSql}`
        db.querySql(addMenuSql)
          .then(res => {
            reslove(res)
          })
          .catch(err => {
            reject(new Error('更新菜单失败'))
          })
      }
    }
  })
}


// 将角色名转换为角色ID
async function replaceNumber(data) {
  const getRoleSql = 'select * from role'
  const roleList = await db.querySql(getRoleSql)
  const dataString = JSON.stringify(roleList)
  const newRoleList = JSON.parse(dataString)
  const newData = data.split(',')
  let newRoleId = []
  newRoleList.map(item => {
    newData.map(item2 => {
      if (item.name === item2) {
        newRoleId.push(item.id)
      }
    })
  })
  return newRoleId
}

// 角色管理
// 删除角色
function deleteRole(query) {
  return new Promise((reslove, reject) => {
    const { id } = query
    const selectMenuSql = `select * from role_menu where role_id='${id}'`
    const selectuserSql = `select * from user_role where role_id='${id}'`
    const deleteRoleSql = `delete from role where id='${id}'`
    db.querySql(selectMenuSql).then(res => {
      if (res.length > 0) {
        reject(new Error('该角色已关联菜单，不允许删除！'))
      } else {
        db.querySql(selectuserSql).then(results => {
          if (results.length > 0) {
            reject(new Error('该角色已关联用户，不允许删除！'))
          } else {
            db.querySql(deleteRoleSql)
              .then(res => {
                reslove(res)
              })
              .catch(err => {
                reject(new Error('删除角色失败'))
              })
          }
        })
      }
    })
  })
}

// 增加角色
function addRole(query) {
  return new Promise(async (reslove, reject) => {
    const { name, menu } = query
    const RoleSql = `INSERT INTO role (name) VALUES ('${name}')`
    await db.querySql(RoleSql)
    const newMenu = JSON.parse(JSON.stringify(menu))
    const selectRole = `select id from role where name='${name}'`
    const roleId = await db.querySql(selectRole)
    newMenu.split(',').map(item => {
      const menuSql = `INSERT INTO role_menu (menu_id,role_id) values ('${item}','${roleId[0].id}')`
      db.querySql(menuSql)
        .then(res => {
          reslove(res)
        })
        .catch(err => {
          reject(new Error('添加角色失败'))
        })
    })
  })
}

// 获取角色绑定的菜单
function getMenuRole(query) {
  return new Promise((reslove, reject) => {
    const { id } = query
    const menuSql = `select menu_id from role_menu where role_id='${id}'`
    db.querySql(menuSql)
      .then(res => {
        reslove(res)
      })
      .catch(err => {
        reject(new Error('查询角色绑定的菜单项失败'))
      })
  })
}

// 更新角色
function updataRole(query) {
  return new Promise((reslove, reject) => {
    const { name, id, menu } = query
    const updateRoleSql = `update role set name='${name}' where id='${id}'`
    const deleteMenuSql = `delete from role_menu where role_id='${id}'`
    db.querySql(updateRoleSql)
      .then(res => {
        db.querySql(deleteMenuSql)
          .then(res => {
            menu.split(',').map(item => {
              const insertMenuSql = `insert into role_menu (role_id,menu_id) values ('${id}', '${item}')`
              db.querySql(insertMenuSql)
                .then(res => {
                  reslove(res)
                })
                .catch(err => {
                  reject(new Error('插入菜单权限表失败'))
                })
            })
          })
          .catch(err => {
            reject(new Error('删除关联菜单表失败'))
          })
      })
      .catch(err => {
        reject(new Error('更新角色失败'))
      })
  })
}

// 获取角色对应的菜单
async function getUserMenu(query) {
  const { roles } = query
  const roleIdList = await rolenameChangeRoleId(roles)
  const meneIDList = await getMenuId(roleIdList)
  const menuList = await getMenuLists(meneIDList)
  return {menu:menuList}

}

// 根据角色名获取角色ID
async function rolenameChangeRoleId(data){
  const roleIdList = []
  for(let i =0; i< data.length; i++){
    await db.querySql(`select id from role where name='${data[i]}'`)
    .then((res) => {
      const dataString = JSON.stringify(res)
      const roleId= JSON.parse(dataString)
      roleIdList.push(roleId[0].id)
    })
  }
  return roleIdList
}


module.exports = {
  newInfo,
  getUserRoleList,
  deleteUser,
  getRoleList,
  addUserList,
  updateUser,
  getMenuList,
  deleteMenu,
  addMenu,
  updateMenu,
  addRole,
  deleteRole,
  updataRole,
  getUserMenu,
  getMenuRole
}
