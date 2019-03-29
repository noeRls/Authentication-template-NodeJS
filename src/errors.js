const typeHandler = {
  get: (obj, prop) => {
    if (!obj[prop])
      console.error(`Unkown type: ${prop}\nPossible type are: ${obj}`);
    return obj[prop];
  }
};

class DatabaseError extends Error {
  constructor(type = DatabaseError.Types.unknown, message) {
    super(message);
    this.name = 'DatabaseError';
    this.type = type;
    this.message = message;
  }
}

DatabaseError.Types = new Proxy({
  noResult: 'noResult',
  internalError: 'internalError',
  unknown: 'unknown',
}, typeHandler);

class PasswordError extends Error {
  constructor(type = PasswordError.Types.unknown, message) {
    super(message);
    this.name = 'PasswordError';
    this.type = type;
    this.message = message;
  }
}

PasswordError.Types = new Proxy({
  unknown: 'unknown',
  noMatch: 'noMatch',
  hashFailed: 'hashFailed'
}, typeHandler);

module.exports = { DatabaseError, PasswordError };