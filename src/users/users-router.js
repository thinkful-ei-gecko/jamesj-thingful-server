const express = require('express')
const path = require('path')
const bcrypt = require('bcryptjs')
const UsersService = require('./users-service')

const usersRouter = express.Router()

usersRouter.post('/', express.json(), (req, res, next) => {
  const db = req.app.get('db')
  const { user_name, nickname = '', full_name, password } = req.body
  const newUser = { user_name, nickname, full_name }
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");


  if (!user_name || !full_name || !password) {
    return res
      .status(400)
      .json({ error: 'user_name, full_name, and password are required' })
  }

  if (password.length < 8 || password.length > 72) {
    return res
      .status(400)
      .json({ error: 'password length must be greater than 8, less than 73' })
  }

  if (!strongRegex.test(password)) {
    return res
      .status(400)
      .json({ error: 'password must contain one uppercase, one lowercase, one number and one special character' })
  }

  newUser.password = bcrypt.hashSync(password, 6)

  UsersService.getUserByUserName(db, user_name)
    .then(user => {
      if(user) {
        return res.status(400).json({ error: 'user_name is already taken' })
      }
      UsersService.addUser(db, newUser)
        .then(user => {
          delete user.password
          return res.status(201).location(path.posix.join(req.originalUrl, `/${user.id}`)).json(user)
        })
    })
})

module.exports = usersRouter