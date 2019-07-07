const routes = require('express').Router();
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const httpStatus = require('http-status-codes');

const { validating, logged } = require('../tools/middleware');
const db = require('../db');
const logger = require('../tools/logger');
const { PasswordNoMatch, PasswordHashFailed, DbNoResult } = require('../errors');

function hashPassword(pwd) {
  return new Promise((res, rej) => bcrypt.hash(pwd, bcrypt.genSaltSync(), (err, hash) => {
    if (err) rej(new PasswordHashFailed());
    else res(hash);
  }));
}

function isValidPassword(pwd, hash) {
  return new Promise((res, rej) => {
    bcrypt.compare(pwd, hash, (err, suc) => {
      if (err || !suc) rej(new PasswordNoMatch());
      else res(suc);
    });
  });
}

const userschema = Joi.object().keys({
  mail: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports = (passport) => {
  passport.use(new LocalStrategy({ usernameField: 'mail', passwordField: 'password' },
    async (mail, password, done) => {
      let user = null;
      try {
        user = await db.getUserFromField('mail', mail);
      } catch (e) {
        if (e instanceof DbNoResult) {
          done(null, false, { error: 'Incorrect mail.' });
          return;
        }
        done(e, false, { error: 'Internal server error' });
        return;
      }
      isValidPassword(password, user.password)
        .then(() => {
          done(null, user);
        })
        .catch(() => {
          done(null, false, { error: 'Incorrect password.' });
        });
    }));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    db.getUserFromField('_id', id)
      .then(u => done(null, u))
      .catch((e) => {
        if (e instanceof DbNoResult) done(null, null);
        else done(e, null);
      });
  });

  routes.post('/register', validating(userschema), async (req, res) => {
    const { mail } = req.value;
    const { password } = req.value;
    try {
      const exist = await db.userExist('mail', mail);
      if (exist) return res.status(409).send({ error: 'user already exist or an error occured' });
      await db.addUser(mail, await hashPassword(password));
    } catch (e) {
      logger.error(e);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Internal server error' });
    }
    return res.status(httpStatus.OK).end();
  });

  // Login using passport middleware
  routes.post('/login', validating(userschema),
    passport.authenticate('local'),
    (req, res) => {
      res.status(httpStatus.OK).send(req.user);
    });

  // Simply logs out using passport middleware
  routes.post('/logout', async (req, res) => {
    await req.logout();
    req.session.save();
    req.session.user = '';
    return res.status(httpStatus.OK).send('successfuly logout');
  });

  const changePasswordSchema = Joi.object().keys({
    lastPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required(),
  });

  routes.post('/changepassword', logged, validating(changePasswordSchema), async (req, res) => {
    const { lastPassword } = req.value;
    const { newPassword } = req.value;

    try {
      const user = await db.getUserFromField('_id', req.user.id);
      await isValidPassword(lastPassword, user.password);
      const newhash = await hashPassword(newPassword);
      await db.modifyUserPassword(user.id, newhash);
      return res.status(httpStatus.OK).end();
    } catch (e) {
      if (e instanceof DbNoResult) return res.status(httpStatus.BAD_REQUEST).send({ error: 'User not found' });
      if (e instanceof PasswordNoMatch) return res.status(httpStatus.UNAUTHORIZED).send({ error: 'password doesn\'t match' });
      logger.error(e);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Internal server error' });
    }
  });

  routes.get('/me', logged, (req, res) => res.status(httpStatus.OK).send(req.user));

  return routes;
};
