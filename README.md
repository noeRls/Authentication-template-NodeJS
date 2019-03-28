# Authentication-template (NodeJS - Mongodb)

Simple NodeJS server with express providing basic authentification with mongodb

# Installation

### With Docker (_recommanded way_)

run it:
`docker-compose up`

dev with hot reload on sources:
`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up` 
_alias on `yarn dev`_

### With NodeJS / Mongodb:

Start mongodb.
`node src/server.js`
*don't forget to setup the environment*

## Environment
Here is multiple environment variable that need to be setup (_default value in docker-compose.yml_):
- CORS_WHITELIST=https://google.com
- MONGODB_ENDPOINT=mongo:27017
- MONGODB_USERNAME=root
- MONGODB_PASSWORD=password
- WAIT_HOSTS=mongo:27017
- DOMAIN=.

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
