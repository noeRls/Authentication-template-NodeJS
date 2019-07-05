const fs = require('fs');

const beforeEachLog = () => {
  try { fs.writeFileSync('./console.log', '') } catch (e) { }
}

const afterEachLog = state => {
  if (state !== 'failed') return;
  console.log(fs.readFileSync('./console.log').toString());
}

module.exports = { afterEachLog, beforeEachLog }
