const server = require('../src/server');
const request = require('supertest')(server);
const getCookies = require('./getCookies');

let cookies = null;

describe('test template', () => {

  before(async () => {
    cookies = await getCookies(request);
  });

  it('can do logged request', done => {
    request
      .get('/me')
      .set('Cookie', cookies)
      .expect(200, done);
  });
});