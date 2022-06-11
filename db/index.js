const mySQL = require('mysql')
const sqlConfig = require('./config')
const { debug } = require('../untils/constant')
const { isObject } = require('../untils/index')

function connect() {
  return mySQL.createConnection({
    host: sqlConfig.host,
    user: sqlConfig.user,
    password: sqlConfig.password,
    database: sqlConfig.database,
    // 允许每条sql语句有多条查询，容易引起SQL注入，可以设置也可以不用设置
    multipleStatements: true,
  })
}

function querySql(sql) {
  const conn = connect()
  debug && console.log(sql)
  return new Promise((resolve, reject) => {
    try {
      conn.query(sql, (err, results) => {
        if (err) {
          debug && console.log('查询失败，原因:' + JSON.stringify(err))
          reject(err)
        } else {
          debug && console.log('查询成功', JSON.stringify(results))
          resolve(results)
        }
      })
    } catch (e) {
      reject(e)
    } finally {
      conn.end()
    }
  })
  // conn.end()
}

function queryOne(sql) {
  return new Promise((resolve, reject) => {
    querySql(sql)
      .then((results) => {
        if (results && results.length > 0) {
          resolve(results[0])
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        reject(err)
      })
  })
}

function insert(model, tableName) {
  return new Promise((resolve, reject) => {
    if (!isObject(model)) {
      reject(new Error('插入数据库失败，插入数据非对象'))
    } else {
      const keys = []
      const values = []
      // 取出数值
      Object.keys(model).forEach((key) => {
        // 检查key是否model的key，如果model继承其他原型，有可能会把其它原型的key拿过来
        if (model.hasOwnProperty(key)) {
          // 考虑到sql语法，加入`
          keys.push(`\`${key}\``)
          values.push(`'${model[key]}'`)
        }
      })
      if (keys.length > 0 && values.length > 0) {
        let sql = `INSERT INTO \`${tableName}\` (`
        const keysString = keys.join(',')
        const valuesString = values.join(',')
        sql = `${sql}${keysString}) VALUES (${valuesString})`
        debug && console.log(sql)
        const conn = connect()
        try {
          conn.query(sql, (err, result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        } catch (e) {
          reject(e)
        } finally {
          conn.end()
        }
      } else {
        reject(new Error('插入数据库失败，对象中没有任何属性'))
      }
    }
  })
}

module.exports = {
  querySql,
  queryOne,
  insert,
}
