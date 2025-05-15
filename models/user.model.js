const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../data/users.json');

function loadUsers() {
  if (!fs.existsSync(usersFile)) return {};
  return JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
}

module.exports = {
  findByEmail: (email) => {
    const users = loadUsers();
    return users[email] || null;
  },

  addUser: (user) => {
    const users = loadUsers();
    users[user.email] = user;         
  },

  confirmEmail: (token) => {
    const users = loadUsers();
    for (const email in users) {
      if (users[email].emailToken === token) {
        users[email].isVerified = true;
        saveUsers(users);
        return users[email];
      }
    }
    return null;
  }
};
