const fs = require('fs')

class Book {
  //   reset() {
  //     if (Book.pathExists()) {
  //     }
  //   }
  static pathExists(path) {
    console.log('删除上传文件', path)
    console.log(fs.existsSync(path))
    return fs.existsSync(path)
  }
}
module.exports = Book
