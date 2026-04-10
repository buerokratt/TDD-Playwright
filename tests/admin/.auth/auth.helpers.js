const fs = require('fs');
const path = require('path');

const AUTH_FILE = 'tests/admin/.auth/user.json';

async function ensureAuthDirectory(authFile = AUTH_FILE) {
  const authDirectory = path.dirname(authFile);
  if (!fs.existsSync(authDirectory)) {
    fs.mkdirSync(authDirectory, { recursive: true });
  }
}

module.exports = {
  AUTH_FILE,
  ensureAuthDirectory,
};
