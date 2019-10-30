const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

const AuthService = {
  isValidUser(db, user_name) {
    return db('thingful_users')
      .select('*')
      .where({ user_name })
      .first()
  },

  comparePasswords(raw, hash) {
    return bcrypt.compare(raw, hash)
  },

  generateJWT(payload, subject) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      algorithm: 'HS256',
    })
  },

  compareJWT(token) {
    return jwt.verify(token, config.JWT_SECRET)
  },
}

module.exports = AuthService
