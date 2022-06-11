const Book = require('../models/Book')
const db = require('../db/index')

function exists(book) {
  const { title, author, publisher } = book
  const sql = `select * from book where title='${title}' and author='${author}' and publisher='${publisher}'`
  return db.queryOne(sql)
}
function removeBook(book) {
  if (book) {
    // 将已上传服务器的图片文件移除
    // if (book.rootFile) {
    //   console.log('删除上传文件')
    // }
    Book.pathExists(book.rootFile)
  }
}

function insertBook(book) {
  // 使用async和await将异步方法变为同步方法，否则会存在大量的异步嵌套
  return new Promise(async (resolve, reject) => {
    try {
      // 判断图书是否Book格式
      //   if (book instanceof Book) {
      // 判断电子书是否已经存在，如果存在就移除记录
      const result = await exists(book)
      if (result) {
        // 如果电子书存在，需要将当前已上传的电子书（图片已经放到服务器upload文件夹）移除
        await removeBook(book)
        reject(new Error('电子书已存在'))
      } else {
        await db.insert(book, 'book')
        resolve()
      }
      //   } else {
      //     reject(new Error('添加的图书对象不合法'))
      //   }
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  insertBook,
}
