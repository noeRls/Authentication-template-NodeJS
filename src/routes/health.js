const routes = require('express').Router();
const httpStatus = require('http-status-codes');
const { isConnected } = require('../db/tools/info');

module.exports = () => {
  routes.get('/health', (req, res) => {
    if (isConnected()) return res.status(200).end();
    return res.status(httpStatus.SERVICE_UNAVAILABLE).send({ error: 'Database not connected' });
  });

  return routes;
};
