const jwt = require('jsonwebtoken');
require('dotenv').config();

// Секретный ключ для подписи токенов из переменных окружения
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Генерация JWT токена для пользователя
const generateToken = (user) => {
  return jwt.sign(
    { 
      email: user.email, 
      userType: user.usertype
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Проверка и декодирование JWT токена
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};