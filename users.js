const rxjs = require('rxjs');
const crypto = require('crypto')
/*
 *  Users should look like
 *  id: number,
 *  name: string,
 *  apikey: string,
 *  password: hashed string;
 * */

let users = [];

let reverseKey = {}

function* idMaker() {

  let index = 0;
  while (true) {
    yield index++;

  }
}

const idGenerator = idMaker();

const register = (user) => {

  console.log(users);
  let hashedPass = crypto.createHash('md5').update(user.password).digest('hex');
  let userExists = users.findIndex((usr) => usr.name === user.name)
  if (userExists !== -1) {
    return null;
  }
  const id = idGenerator.next().value;
  users = [...users, { ...user, apiKey: null, id, password: hashedPass }]
  return {
    name: user.name,
    id
  }
}

const login = (user) => {

  let hashedPass = crypto.createHash('md5').update(user.password).digest('hex');

  let date = new Date().toString();
  let apiKey = crypto.createHash('md5').update(date + user.name).digest('hex');
  let index = users.findIndex((usr) => usr.name === user.name)
  if (index !== -1) {

    if (users[index].password !== hashedPass) {
      return null
    }
    users[index].apiKey = apiKey;
    reverseKey[apiKey] = users[index].id
    return { apiKey, id: users[index].id };
  }
  return null;
}

const getUserById = (id) => {
  console.log('In user', id, users)
  return users.find((u) => u.id === id)
}

const getUserByName = (name) => {
  const user = users.find((user) => user.name === name)
  if (!user) return null;
  return {
    name: user.name,
    id: user.id
  }
}

const getUserByKey = (key) => {
  console.log('In user', reverseKey)
  return reverseKey[key];
}

module.exports = {
  register,
  getUserById,
  getUserByName,
  getUserByKey,
  users,
  login
}
