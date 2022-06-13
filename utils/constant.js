const { env } = require('./env')
const UPLOAD_PATH = env === 'dev' ?
  '/Users/liumeng/Desktop/fubaoyouyou/upload/admin-upload-ebook' :
  '/root/upload/admin-upload/ebook'
  const UPLOAD_PATH_IMG = env === 'dev' ?
  '/Users/liumeng/Desktop/fubaoyouyou/Adduser' :
  '/root/upload/admin-upload/ebook';
  
  const UPLOAD_PATH_OLD = env ==='dev' ?  'https://localhost/Adduser' : 'https://www.youbaobao.xyz/book/upload/img';
const OLD_UPLOAD_URL = env === 'dev' ? 'https://book.youbaobao.xyz/book/res/img' : 'https://www.youbaobao.xyz/book/res/img'
const UPLOAD_URL = env === 'dev' ? 'https://localhost/upload/admin-upload-ebook' : 'https://www.youbaobao.xyz/admin-upload-ebook'
module.exports = {
  CODE_ERROR: -1,
  CODE_SUCCESS: 0,
  CODE_TOKEN_EXPIRED: -2,
  debug: true,
  PWD_SALT: 'admin_imooc_node',
  PRIVATE_KEY: 'admin_imooc_node_test_youbaobao_xyz',
  JWT_EXPIRED: 60 * 60,
  UPLOAD_PATH,
  UPLOAD_PATH_IMG,
  OLD_UPLOAD_URL,
  UPLOAD_URL,
  MIME_TYPE_EPUB: 'application/epub+zip',
  MIME_TYPE_JPEG: 'image/jpeg',
  MIME_TYPE_PNG: 'image/png',
  MIME_TYPE_GIF: 'image/gif',
  UPLOAD_PATH_OLD,
  UPDATE_TYPE_FROM_WEB: 1
}
