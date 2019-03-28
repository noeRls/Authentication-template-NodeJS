const routes = require('express').Router();
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const {validating, logged} = require('../middleware');
const Joi = require('joi');
const httpStatus = require('http-status-codes');
const db = require('../db/models');

function hashPassword(pwd) {
  return new Promise((res, rej) => bcrypt.hash(pwd, saltRounds, (err, hash) => {
    if (err)
      rej(err);
    else
      res(hash);
  }));
}

function isValidPassword(pwd, hash) {
  return new Promise((res, rej) => {
    bcrypt.compare(pwd, hash, (err, suc) => {
      if (err || !suc)
        rej(err);
      else
        res(suc);
    });
  });
}

const userschema = Joi.object().keys({
  mail: Joi.string().email().required(),
  password: Joi.string().min(3).required(),
});

module.exports = function (passport) {

  passport.use(new LocalStrategy({ usernameField: 'mail', passwordField: 'password' },
    async (mail, password, done) => {
      let user = null;
      try {
        user = await db.getUserFromField('mail', mail);
      }
      catch (e) {
        return done(null, false, { message: 'Incorrect mail.' });
      }
      isValidPassword(password, user.password)
        .then(() => {
          done(null, user);
        })
        .catch(e => {
          done(e, false, { message: 'Incorrect password.', error: e });
        });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    db.getUserFromField('_id', id)
      .then(u => done(null, u))
      .catch(() => done(null, null));
  });

  routes.post('/register', validating(userschema), async (req, res) => {
    const mail = req.value.mail;
    const password = req.value.password;
    try {
      let exist = await db.userExist('mail', mail);
      console.log(exist);
      if (exist)
        return res.status(409).send({ error: 'user already exist or an error occured' });
      await db.addUser(mail, await hashPassword(password));
    } catch (e) {
      console.error(e);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
    }
    return res.status(httpStatus.OK).end();
  });

  //Login using passport middleware
  routes.post('/login',
    passport.authenticate('local'),
    (req, res) => {
      res.status(httpStatus.OK).send(req.user);
    }
  );

  //Simply logs out using passport middleware
  routes.post('/logout', async (req, res) => {
    await req.logout();
    req.session.save();
    req.session.user = '';
    return res.status(httpStatus.OK).send('successfuly logout');
  });

  const changePasswordSchema = Joi.object().keys({
    lastPassword: Joi.string().min(1).required(),
    newPassword: Joi.string().min(1).required(),
  });

  routes.post('/changepassword', logged, validating(changePasswordSchema), async (req, res) => {
    const lastPassword = req.value.lastPassword;
    const newPassword = req.value.newPassword;

    try {
      let user = await db.getUserFromField('_id', req.user.id);
      await isValidPassword(lastPassword, user.password);
      let newhash = await hashPassword(newPassword);
      await db.modifyUserPassword(user.id, newhash);
      res.status(httpStatus.OK).end();
    } catch (e) {
      console.error(e);
      if (e.noResult) return res.status(httpStatus.BAD_REQUEST).end();
      res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
    }
  });

  routes.get('/me', logged, (req, res) => {
    return res.status(httpStatus.OK).send(req.user);
  });

  return routes;
};
