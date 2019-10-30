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
  },
}

module.exports = UsersService
