const users = require('./users.json');

const Login = (body) => {
  const {user, password} = body
  let token = null
  users.map((value) => {
    if (value.user === user && value.password === password) {
      token = value.token
    }
  });
  return token ?? null;
}

const Authorization = (token) => {
  let role = null
  users.map((value) => {
    if (value.token === token) {
      role = value.role
    }
  });
  return role ?? null;
}

module.exports = {
  Login,
  Authorization
}