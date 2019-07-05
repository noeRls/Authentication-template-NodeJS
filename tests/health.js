const server = require('../src/server');
const request = require('supertest')(server);
const { beforeEachLog, afterEachLog } = require('./logs');

describe('basic tests', () => {

  beforeEach(() => {
    beforeEachLog();
  });

  afterEach(function () {
    afterEachLog(this.currentTest.state);
  });

  it('is in healthy state', done => {
    request
      .get('/health')
      .expect(200, done);
  });
});