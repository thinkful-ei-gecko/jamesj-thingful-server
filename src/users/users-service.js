const UsersService = {
  getUserByUserName: (db, user_name) => {
    return db('thingful_users')
      .select('*')
      .where({ user_name })
      .first()
  },
  addUser: (db, user) => {
    return db('thingful_users')
      .insert(user)
      .returning('*')
      .then(user => user[0])
  },
}

module.exports = UsersService
