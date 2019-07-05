const server = require('../src/server');
const request = require('supertest')(server);
const { beforeEachLog, afterEachLog } = require('./logs');

let cookies = null;
let mail = 'noe@gmail.com';
let password = 'superpassword';
let newPwd = 'imthefreshnew';

let cookies2 = null;
let mail2 = 'everyone@gmail.com';
let password2 = 'superpassword';

describe('authentification tests', () => {

  beforeEach(function () {
    beforeEachLog();
  });

  afterEach(function () {
    afterEachLog(this.currentTest.state);
  });

  it('can register', done => {
    request
      .post('/register')
      .send({ mail, password })
      .expect(200)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
  it('can login', done => {
    request
      .post('/login')
      .send({ mail, password })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        cookies = res.header['set-cookie'];
        if (res.body.mail !== mail)
          return done('Wrong mail');
        if (!res.body._id)
          return done('No _id is present in body');
        if (!cookies)
          return done('Missing cookies');
        return done();
      });
  });
  it('can get profile', done => {
    request
      .get('/me')
      .set('Cookie', cookies)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        if (res.body.mail !== mail)
          return done('Wrong mail');
        if (!res.body._id)
          return done('No _id is present in body');
        return done();
      });
  });
  it('can register n°2', done => {
    request
      .post('/register')
      .send({ mail: mail2, password: password2 })
      .expect(200)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
  it('can login n°2', done => {
    request
      .post('/login')
      .send({ mail: mail2, password: password2 })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        cookies2 = res.header['set-cookie'];
        if (res.body.mail !== mail2)
          return done('Wrong mail');
        if (!res.body._id)
          return done('No _id is present in body');
        if (!cookies)
          return done('Missing cookies');
        return done();
      });
  });
  it('can get profile n°2', done => {
    request
      .get('/me')
      .set('Cookie', cookies2)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        if (res.body.mail !== mail2)
          return done('Wrong mail');
        if (!res.body._id)
          return done('No _id is present in body');
        return done();
      });
  });
  it('failed register (duplicate)', done => {
    request
      .post('/register')
      .send({ mail, password })
      .expect(409, done);
  });
  it('faild register (weak password)', done => {
    request
      .post('/register')
      .send({ mail: 'imweak@gmail.com', password: 'hi' })
      .expect(400, done);
  });
  it('faild login (wrong mail)', done => {
    request
      .post('/login')
      .send({ mail: 'test@gmail.com', password })
      .expect(401, done);
  });
  it('faild login (wrong password)', done => {
    request
      .post('/login')
      .send({ mail, password: 'passisuperlepassword' })
      .expect(401, done);
  });
  it('can\'t get profile', done => {
    request
      .get('/me')
      .expect(401, done);
  });
  it('can change password', done => {
    request
      .post('/changepassword')
      .send({ lastPassword: password, newPassword: newPwd })
      .set('Cookie', cookies)
      .expect(200, done);
  });
  it('can\'t login with old password', done => {
    request
      .post('/login')
      .send({ mail, password })
      .expect(401, done);
  });
  it('can login with new password', done => {
    request
      .post('/login')
      .send({ mail, password: newPwd })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        cookies = res.header['set-cookie'];
        done();
      });
  });
  it('can\'t change password (wrong password)', done => {
    request
      .post('/changepassword')
      .send({ lastPassword: 'randomfakepassword', newPassword: 'youwillnotbethepassword' })
      .set('Cookie', cookies2)
      .expect(401, done);
  });
  it('can logout', done => {
    request
      .post('/logout')
      .set('Cookie', cookies2)
      .expect(200, done);
  });
});