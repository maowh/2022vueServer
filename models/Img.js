const {
  MIME_TYPE_JPEG,
  MIME_TYPE_PNG,
  MIME_TYPE_GIF,
  UPLOAD_PATH_OLD
} = require('../utils/constant')
const fs = require('fs')

class Img {
  constructor(file) {
    if (file) {
      this.createUploadImgFile(file)
    }
  }

  createUploadImgFile(file) {
    const {
      destination,
      filename,
      mimetype,
      path,
    } = file;
    // 图片的文件后缀名
    let suffix;
    if(mimetype ===MIME_TYPE_JPEG ){
      suffix = '.jpg'
    }else if(mimetype ===MIME_TYPE_PNG){
      suffix = '.png'
    }else if(mimetype === MIME_TYPE_GIF){
      suffix = '.gif'
    }
    // 图片的原有路径
    const oldImgPath = path
    // 图片的新路径
    const imgPath = `${destination}/${filename}${suffix}`
    // 图片的下载URL
    const url = `${UPLOAD_PATH_OLD}/${filename}${suffix}`
    if (fs.existsSync(oldImgPath) && !fs.existsSync(imgPath)) {
      fs.renameSync(oldImgPath, imgPath)
    }
    this.fileName = filename // 图片名
    this.path = `/${filename}${suffix}` // 图片相对路径
    this.filePath = this.path
    this.url = url // 图片地址
  }

}

module.exports = Img
