const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../../data/users.json');

function ensureStore() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]', 'utf-8');
  }
}

function readUsers() {
  ensureStore();
  const raw = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function findByEmail(email) {
  const users = readUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

function create(user) {
  const users = readUsers();
  const newUser = { ...user, id: cryptoRandomId() };
  users.push(newUser);
  writeUsers(users);
  return newUser;
}

function cryptoRandomId() {
  return require('crypto').randomUUID();
}

module.exports = {
  findByEmail,
  create,
};
