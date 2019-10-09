const basicAuth = (req, res, next) => {
  const authToken = req.get('Authorization') || '';
  let basicToken;

  if(!authToken.toLowerCase().startsWith('basic ')) {
    return res.status(401).json({error: {message: 'Unauthorized request'}});
  } 
  next();
};

module.exports = basicAuth;