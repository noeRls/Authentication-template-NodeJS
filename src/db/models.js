const mongoose = require('mongoose');
const { DbNoResult } = require('../errors');
const logger = require('../tools/logger');

const dbName = 'simple_login';
if (!process.env.MONGODB_ENDPOINT || !process.env.MONGODB_USERNAME || !process.env.MONGODB_PASSWORD) logger.error('invalid mongodb conf');
let endpoint = `mongodb://${process.env.MONGODB_ENDPOINT}`;
if (endpoint[endpoint.length - 1] !== '/') endpoint += '/';
endpoint += `${dbName}?authSource=admin`;

mongoose.connect(endpoint, {
  useNewUrlParser: true,
  user: process.env.MONGODB_USERNAME,
  pass: process.env.MONGODB_PASSWORD,
});

mongoose.set('useFindAndModify', false);

const db = mongoose.connection;

db.on('error', e => logger.error(e));
db.once('open', () => {
  logger.info('Connected to db');
});

const userSchema = new mongoose.Schema({
  mail: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

function addUser(mail, password) {
  const u = new User({ mail, password });
  return u.save();
}

async function getUserFromField(field, value) {
  const u = await User.findOne({ [field]: value });
  if (!u) throw new DbNoResult();
  return u;
}

async function userExist(field, value) {
  const u = await User.findOne({ [field]: value });
  if (u) return true;
  return false;
}

function modifyUserPassword(id, pwd) {
  return User.findOneAndUpdate({ _id: id }, { password: pwd });
}
module.exports = {
  addUser, getUserFromField, modifyUserPassword, userExist,
};
