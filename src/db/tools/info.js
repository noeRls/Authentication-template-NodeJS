const { mongoose } = require('../core/connection');

function isConnected() {
  return Boolean(mongoose.connection.readyState);
}

function isId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = { isId, isConnected };
