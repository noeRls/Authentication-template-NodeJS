const routes = require('express').Router();
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const {validating, logged} = require('../middleware');
const Joi = require('joi');
const httpStatus = require('http-status-codes');
const db = require('../db/models');
const {DatabaseError, PasswordError} = require('../errors');

function hashPassword(pwd) {
  return new Promise((res, rej) => bcrypt.hash(pwd, saltRounds, (err, hash) => {
    if (err)
      rej(new PasswordError(PasswordError.Types.hashFailed, err));
    else
      res(hash);
  }));
}

function isValidPassword(pwd, hash) {
  return new Promise((res, rej) => {
    bcrypt.compare(pwd, hash, (err, suc) => {
      if (err || !suc)
        rej(new PasswordError(PasswordError.Types.noMatch, err));
      else
        res(suc);
    });
  });
}

const userschema = Joi.object().keys({
  mail: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports = function (passport) {

  passport.use(new LocalStrategy({ usernameField: 'mail', passwordField: 'password' },
    async (mail, password, done) => {
      let user = null;
      try {
        user = await db.getUserFromField('mail', mail);
      }
      catch (e) {
        if (e.name === 'DatabaseError' && e.type === DatabaseError.Types.noResult)
          return done(null, false, { error: 'Incorrect mail.' });
        else
          return done(e, false, {error: 'Internal server error'});
      }
      isValidPassword(password, user.password)
        .then(() => {
          done(null, user);
        })
        .catch(() => {
          done(null, false, { error: 'Incorrect password.' });
        });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    db.getUserFromField('_id', id)
      .then(u => done(null, u))
      .catch((e) => {
        if (e.name === 'DatabaseError' && e.type === DatabaseError.Types.noResult)
          done(null, null);
        else
          done(e, null);
      });
  });

  routes.post('/register', validating(userschema), async (req, res) => {
    const mail = req.value.mail;
    const password = req.value.password;
    try {
      let exist = await db.userExist('mail', mail);
      if (exist)
        return res.status(409).send({ error: 'user already exist or an error occured' });
      await db.addUser(mail, await hashPassword(password));
    } catch (e) {
      console.error(e);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error: 'Internal server error'});
    }
    return res.status(httpStatus.OK).end();
  });

  //Login using passport middleware
  routes.post('/login', validating(userschema),
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
    lastPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required(),
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
      if (e.name === 'DatabaseError' && e.type === DatabaseError.Types.noResult)
        return res.status(httpStatus.BAD_REQUEST).send({error: 'User not found'});
      if (e.name === 'PasswordError' && e.type === PasswordError.Types.noMatch)
        return res.status(httpStatus.UNAUTHORIZED).send({error: 'password doesn\'t match'});
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error: 'Internal server error'});
    }
  });

  routes.get('/me', logged, (req, res) => {
    return res.status(httpStatus.OK).send(req.user);
  });

  return routes;
};
