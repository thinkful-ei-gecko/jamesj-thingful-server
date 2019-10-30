const knex = require('knex')
const testHelpers = require('./test-helpers')
const app = require('../src/app')

let db

describe.only('Users Endpoints', () => {
  db = knex({
    client: 'pg',
    connection: process.env.TEST_DB_URL,
  })

  app.set('db', db)

  before('truncate db', () => testHelpers.cleanTables(db))
  afterEach('truncate tables', () => testHelpers.cleanTables(db))
  after('kill db connection', () => db.destroy())

  it('POST / gives expected response and creates user', () => {
    const newUser = {
      user_name: 'testing',
      password: 'Password1!',
      full_name: 'Test User',
    }
    return supertest(app)
      .post('/api/users')
      .set('content-type', 'application/json')
      .send(newUser)
      .expect(201)
      .expect(res => {
        const { user_name } = res.body
        return db('thingful_users')
          .select('*')
          .where({ user_name })
          .first()
          .then(user => {
            delete newUser.password
            expect(user).to.include(newUser)
          })
      })
  })
})
