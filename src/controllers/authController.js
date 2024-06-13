const authService = require('../services/authService');

const register = async (request, h) => {
  const { username, password, role } = request.payload;
  if (!username || !password || !role) {
    throw new InputError('Missing required fields');
  }
  await authService.register(username, password, role);
  return h.response({ status: 'success', message: 'User registered successfully' }).code(201);
};

const loginUser = async (request, h) => {
  const { username, password } = request.payload;
  if (!username || !password) {
    throw new InputError('Missing required fields');
  }
  const token = await authService.login(username, password);
  return h.response({ status: 'success', token }).code(200);
};

const loginAdmin = async (request, h) => {
  const { username, password } = request.payload;
  if (!username || !password) {
    throw new InputError('Missing required fields');
  }
  const token = await authService.login(username, password);
  return h.response({ status: 'success', token }).code(200);
};

module.exports = { register, loginUser, loginAdmin };
