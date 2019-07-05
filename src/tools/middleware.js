const Joi = require('joi');
const httpStatus = require('http-status-codes');

const validating = schema => (req, res, next) => {
  const { error, value } = Joi.validate(req.body, schema);
  if (error) return res.status(httpStatus.BAD_REQUEST).send(error);
  req.value = value;
  return next();
};

const logged = (req, res, next) => {
  if (req.user) return next();
  return res.status(401).send({ error: 'Not logged' });
};

module.exports = { validating, logged };
