const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken')

describe('Auth endpoints', () => {
  let db
  const { testUsers } = helpers.makeThingsFixtures()
  const testUser = testUsers[0]
  before('create db', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })
  after('destroy db connection', () => db.destroy())
  before('clean db', () => helpers.cleanTables(db))
  afterEach('clean db', () => helpers.cleanTables(db))

  describe('POST /api/auth/login', () => {
    beforeEach('seed db', () => helpers.seedUsers(db, testUsers))
    const requiredFields = ['user_name', 'password']
    requiredFields.forEach(field => {
      const loginAttempt = {
        user_name: testUser.user_name,
        password: testUser.password,
      }

      it(`responds with 400 required when ${field} is missing`, () => {
        delete loginAttempt[field]

        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttempt)
          .expect(400, { error: `${field} is required in request body` })
      })
      it('responds with 400 invalid request when user provided does not exist', () => {
        const badUser = { user_name: 'foo', password: 'bar' }

        return supertest(app)
          .post('/api/auth/login')
          .send(badUser)
          .expect(400, { error: 'Invalid request' })
      })
      it('responds with 400 invalid request when user valid, password wrong', () => {
        const brokenUser = { ...testUser, password: 'bar' }

        return supertest(app)
          .post('/api/auth/login')
          .send(brokenUser)
          .expect(400, { error: 'Invalid request' })
      })
      it('responds 200 and provides a jwt token when valid user sent', () => {
        const expectedToken = jwt.sign(
          { user_id: testUser.id },
          process.env.JWT_SECRET,
          {
            subject: testUser.user_name,
            algorithm: 'HS256',
          }
        )
        return supertest(app)
          .post('/api/auth/login')
          .send(testUser)
          .expect(200, { authToken: expectedToken })
      })
    })
  })
})
