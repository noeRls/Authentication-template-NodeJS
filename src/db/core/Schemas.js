const { mongoose } = require('./connection');

const userSchema = new mongoose.Schema({
  mail: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
};
