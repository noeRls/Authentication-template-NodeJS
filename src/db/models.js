const mongoose = require('mongoose');
const {DatabaseError} = require('../errors');

const dbName = 'simple_login';
if (!process.env.MONGODB_ENDPOINT || !process.env.MONGODB_USERNAME || !process.env.MONGODB_PASSWORD)
  console.error('invalid mongodb conf');
let endpoint = 'mongodb://' + process.env.MONGODB_ENDPOINT;
if (endpoint[endpoint.length - 1] != '/')
  endpoint += '/';
endpoint += dbName + '?authSource=admin';

mongoose.connect(endpoint, {
  useNewUrlParser: true,
  user: process.env.MONGODB_USERNAME,
  pass: process.env.MONGODB_PASSWORD,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to db');
});

const userSchema = new mongoose.Schema({
  mail: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

async function handleError(promise)
{
  try {
    return await promise;
  } catch (e) {
    throw new DatabaseError(DatabaseError.Types.internalError, e);
  }
}

function addUser(mail, password) {
  const u = new User({ mail, password });
  return handleError(u.save());
}

async function getUserFromField(field, value) {
  let u = await handleError(User.findOne({ [field]: value }));
  if (!u)
    throw new DatabaseError(DatabaseError.Types.noResult);
  return u;
}

async function userExist(field, value)
{
  let u = await handleError(User.findOne({ [field]: value }));
  if (u) return true;
  else return false;
}

function modifyUserPassword(id, pwd)
{
  return handleError(User.findOneAndUpdate({'_id': id}, {'password': pwd}));
}
module.exports = {
  addUser, getUserFromField, modifyUserPassword, userExist
};
