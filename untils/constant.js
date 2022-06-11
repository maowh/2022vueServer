const { env } = require('./env')

// 定义上传文件保存的目录
const UPLOAD_PATH =
  env === 'dev' ? 'E:/project/vue/nginx/upload/admin-upload-file' : '/root/upload/admin-upload/file'

module.exports = {
  CODE_ERROR: -1,
  CODE_SUCCESS: 0,
  // token错误返回-2
  CODE_TOKEN_EXPIRED: -2,
  debug: true,
  // 设置密码加密的增加字符串部分内容
  PWD_SALT: 'admin_maomao_node',
  // 设置token里面的私钥信息
  PRIVATE_KEY: 'admin_maomao_node',
  // 设置jwt过期时间，秒为单位
  JWT_EXPIRED: 60 * 60,
  UPLOAD_PATH,
}
