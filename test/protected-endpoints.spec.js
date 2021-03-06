const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

let db;

const {
  testUsers,
  testReviews,
  testThings
} = helpers.makeThingsFixtures();

describe('Protected endpoints', () => {
  before('make db instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    
    app.set('db', db);
  });

  before('clean up db', () => helpers.cleanTables(db));
  after('destroy db connection', () => db.destroy());
  beforeEach('seed db with data', () => helpers.seedThingsTables(db, testUsers, testThings,testReviews));
  afterEach('clean up db', () => helpers.cleanTables(db));
  context('user is authenticated', () => {
    it('GET /api/things/:thing_id returns 200 and expected response', () => {
      const thingId = 1;
      const expectedThing = helpers.makeExpectedThing(testUsers, testThings[thingId - 1], testReviews);
      return supertest(app)
        .get('/api/things/1')
        .set('Authorization', `Bearer ${helpers.makeAuthHeader(testUsers[0])}`)
        .expect(200, expectedThing);
    });
    it('GET /api/things/:thing_id/reviews returns 200 and expected response', () => {
      const thingId = 1;
      const expectedThingReviews = helpers.makeExpectedThingReviews(testUsers, thingId, testReviews);
      
      return supertest(app)
        .get('/api/things/1/reviews')
        .set('Authorization', `Bearer ${helpers.makeAuthHeader(testUsers[0])}`)
        .expect(200, expectedThingReviews);
    });
    it('POST /api/reviews returns 201', () => {
      const newReview = { thing_id: 1, rating: 4, text: 'new and exciting review' };
      return db.raw(`SELECT setval('thingful_reviews_id_seq', ${testReviews[testReviews.length - 1].id})`)
        .then(() => {
          return supertest(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${helpers.makeAuthHeader(testUsers[0])}`)
            .send(newReview)
            .expect(201);
        });
    });
  });
  context('user is not authenticated', () => {
    it('GET /api/things/:thing_id returns 401 and expected response with bad jwt secret', () => {
      
      return supertest(app)
        .get('/api/things/1')
        .set('Authorization', `Bearer ${helpers.makeAuthHeader(testUsers[0], 'bad-token')}`)
        .expect(401, {error: {message: 'Unauthorized request'}});
    });
    it('GET /api/things/:thing_id/reviews returns 401 and expected response with invalid sub', () => {
      const invalidUser = {user_name: 'bad user', id: 1};
      return supertest(app)
        .get('/api/things/1/reviews')
        .set('Authorization', `Bearer ${helpers.makeAuthHeader(invalidUser)}`)
        .expect(401, {error: {message: 'Unauthorized request'}});
    });
    it('POST /api/reviews returns 401 and expected reponse without valid jwt', () => {
      const newReview = { thing_id: 1, rating: 4, text: 'new and exciting review' };
      const badUser = {user_name: 'bad user', id: 1};
      return db.raw(`SELECT setval('thingful_reviews_id_seq', ${testReviews[testReviews.length - 1].id})`)
        .then(() => {
          return supertest(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${helpers.makeAuthHeader(badUser)}`)
            .send(newReview)
            .expect(401);
        });
    });
  });
});