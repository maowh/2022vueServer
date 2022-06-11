const { querySql, queryOne } = require('../db')

function login(username, password) {
  return querySql(`select * from user where username='${username}' and password='${password}'`)
}
function findUser(username) {
  return queryOne(`select iduser,username,role,avatar from user where username='${username}'`)
}

module.exports = {
  login,
  findUser,
}
