const mongoose = require('mongoose');
const logger = require('../../tools/logger');

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

module.exports = { mongoose };
