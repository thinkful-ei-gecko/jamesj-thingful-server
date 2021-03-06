const AuthService = require('../auth/auth-service');

const basicAuth = (req, res, next) => {
  const authToken = req.get('Authorization') || '';

  if(!authToken.toLowerCase().startsWith('basic ') || authToken.substring(6) === '') {
    return res.status(401).json({error: {message: 'Unauthorized request'}});
  }

  const [user_name, password] = Buffer.from(authToken.substring(6), 'base64').toString().split(':');
  
  req.app.get('db')
    .select('*')
    .from('thingful_users')
    .where({user_name})
    .first()
    .then(user => {
      if(!user) {
        return res.status(401).json({error: {message: 'Unauthorized request'}});
      }
      AuthService.comparePasswords(password, user.password)
        .then(valid => {
          if(!valid) {
            return res.status(401).json({error: {message: 'Unauthorized request'}});
          }
          req.user = user
          next()
        })
    })

};

module.exports = basicAuth;