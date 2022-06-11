const express = require('express')
const multer = require('multer')
const Result = require('../models/Result')
const { UPLOAD_PATH } = require('../untils/constant')
const boom = require('boom')
// const Book = require('../models/Book')
const bookService = require('../services/book')
const { decoded } = require('../untils')

const router = express.Router()

router.post(
  '/upload',
  multer({ dest: `${UPLOAD_PATH}` }).single('file'),
  function (req, res, next) {
    if (!req.file || req.file.length === 0) {
      new Result('上传电子书失败').fail(res)
    } else {
      let book = req.file
      // const book = new Book(req.file)
      // book
      //   .parse()
      //   .then((book) => {
      new Result(book, '上传电子书成功').success(res)
      // })
      // .catch((err) => {
      //   next(boom.badImplementation(err))
      // })
    }
  }
)

router.post('/create', function (req, res, next) {
  const decode = decoded(req)
  console.log(req.body)
  // const book = {}
  if (decode && decode.username) {
    req.body.username = decode.username
    req.body.createDt = new Date().getTime()
    req.body.editDt = new Date().getTime()
    // book.username = decode.username
  }
  const book = req.body
  // const book = new Book(null, req.body)
  bookService
    .insertBook(book)
    .then(() => {
      new Result('添加电子书成功').success(res)
    })
    .catch((err) => {
      next(boom.badImplementation(err))
    })
  console.log(book)
})

module.exports = router
