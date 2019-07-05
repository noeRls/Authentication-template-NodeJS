const papa = require('papaparse');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyparser = require('body-parser');

const app = express();
const helmet = require('helmet');
const passport = require('passport');
const cookies = require('cookie-session');

const logger = require('./tools/logger');

let allowedCORS;

if (process.env.CORS_WHITELIST) [allowedCORS] = papa.parse(process.env.CORS_WHITELIST).data;
else logger.warn('no allowed CORS found');

app.use((req, res, next) => {
  const { origin } = req.headers;

  if (allowedCORS && allowedCORS.indexOf(origin) > -1) res.setHeader('Access-Control-Allow-Origin', origin);

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, Content-Type, Authorization, '
    + 'x-id, Content-Length, X-Requested-With',
  );
  res.header('Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS');

  next();
});

app.use(helmet());
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use(cookies({
  domain: process.env.DOMAIN || '.',
  name: 'session',
  keys: ['keyy1', 'keyy2'],
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('dev', {
  skip: (req) => {
    if (req.url === '/health') return true;
    return false;
  },
  stream: logger.stream,
}));

app.use(require('./routes/user')(passport));
app.use(require('./routes/health')());

app.get('/helloworld', (req, res) => {
  res.status(200).send('Hello, world!');
});

app.listen(8081, () => logger.info('Listening on 8081'));

module.exports = app;
