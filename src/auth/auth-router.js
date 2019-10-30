const express = require('express')
const AuthService = require('./auth-service')

const authRouter = express.Router()

authRouter.route('/login').post(express.json(), (req, res, next) => {
  const { user_name, password } = req.body
  const fields = { user_name, password }

  for (const [key, value] of Object.entries(fields)) {
    if (!value || value === null) {
      return res
        .status(400)
        .json({ error: `${key} is required in request body` })
    }
  }
  AuthService.isValidUser(req.app.get('db'), user_name)
    .then(user => {
      if (!user) {
        return res.status(400).json({ error: 'Invalid request' })
      }

      AuthService.comparePasswords(password, user.password).then(valid => {
        if (!valid) {
          return res.status(400).json({ error: 'Invalid request' })
        }
        const token = AuthService.generateJWT(
          { user_id: user.id },
          user.user_name
        )
        return res.status(200).json({ authToken: token })
      })
    })
    .catch(next)
})

module.exports = authRouter
