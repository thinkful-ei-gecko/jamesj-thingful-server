const AuthService = require('../auth/auth-service')

function jwtAuthMiddleware(req, res, next) {
  const authToken = req.get('Authorization') || ''
  let bearerToken
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: { message: 'Missing bearer token' } })
  } else {
    bearerToken = authToken.slice(7, authToken.length)
  }

  try {
    const payload = AuthService.compareJWT(bearerToken)
    AuthService.isValidUser(req.app.get('db'), payload.sub)
      .then(user => {
        if (!user) {
          return res
            .status(401)
            .json({ error: { message: 'Unauthorized request' } })
        }
        req.user = user
        next()
      })
      .catch(next)
  } catch (error) {
    return res.status(401).json({ error: { message: 'Unauthorized request' } })
  }
}

module.exports = jwtAuthMiddleware
