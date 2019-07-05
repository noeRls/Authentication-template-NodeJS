# Authentication-template (NodeJS - Mongodb)

Simple NodeJS server with express providing basic authentification with mongodb

# Installation

### With Docker (_recommanded way_)

run it:
`docker-compose up` or `yarn start-docker`

dev with hot reload on sources:
`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`
_alias on `yarn dev`_

### With NodeJS / Mongodb:

Start mongodb.
`node src/server.js`
*don't forget to setup the environment*

## Environment
Here is multiple environment variable that need to be setup (_default value in docker-compose.yml_):
- CORS_WHITELIST
- MONGODB_ENDPOINT
- MONGODB_USERNAME
- MONGODB_PASSWORD
- DOMAIN

# Routes

### Login
Route: `/login`
Method: `POST`

body:
```js
{
	mail: "noe@gmail.com"
	password: "licorne"
}
```

returns:
```js
{
	error: "",
	mail: "noe@gmail.com",
	_id: "38984a3"
}
```

### Register
Route: `/register`
Method: `POST`

body:
```js
{
	mail: "noe@gmail.com"
	password: "licorne"
}
```

returns:
```js
{
	error: “”
}
```

### Logout

Route: `/logout`
Method: `POST`

### Change password
Route: `/changepassword`
Method: `POST`

body:
```js
{
	lastPassword: "licorne"
	newPassword: "fromage"
}
```

returns:
```js
{
	error: "",
}
```

### Health

Route: `/health`
Method `GET`

Return `200` if the server is in an healthy state. Basicly if the server is connected to the database.

# Infos

### Logged Middelware

You can easily check if the user is logged using the simple logged middelware.

```js
const { logged } = require('./middleware');

routes.get('/me', logged, (req, res) => {
  return res.status(200).send(req.user);
});
```

User profile is autaumatically injected (even without the middleware). You can access it using `req.user`.

# Tests

Tests are in `tests` dir
You can easly setup you own tests to call your logged routes

__Template is in `tests/template.js`__.

## Write tests

### Authentificate user

Authentification is done through cookies.

getCookies function generate cookies automatically
```js
before(async () => {
  cookies = await getCookies(request);
});
```

>You can give mail and password as 2nd and 3rd parameter

To be logged you just need to set the cookies like this
```js
request
  .set('Cookie', cookies)
```

### Server logs

Server logs are hide if test succeed. It allow you to debug easly and faster your project.

Include:
```js
const { beforeEachLog, afterEachLog } = require('./logs');
```

Add in your test battery:
```js
  beforeEach(function() {
    beforeEachLog();
  });

  afterEach(function() {
    afterEachLog(this.currentTest.state);
  });
```

## Run tests

Run `yarn test` to run all tests. It will automatically reset the database.

>Docker is required.

_You can use your own script to reset the database and run mocha without docker !_

# Eslint

ESLint is an open source project, its goal is to provide a pluggable linting utility for JavaScript.

> On this project airbnb's eslint configuration is used

### Run linting

Run `yarn lint` to have a linting report.

# Logger

A winston logger is present. It provide easly log manipulation / filtering and more flexibility like hiding logs during test.

- Error log are present in `error.log`
- Console like log are present in `console.log`
- Debug log are present in `debug.log`

# Contriute !

This template is far of perfect.
If you have any idea or enchancment, don't hesitate to contribute.
