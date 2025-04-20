const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/userModel');

// Middleware для проверки аутентификации
const authenticateToken = async (req, res, next) => {
  // Получаем токен из заголовка Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // формат: Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Вход не выполнен. Пожалуйста, авторизуйтесь.' 
    });
  }

  // Проверяем и декодируем токен
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Невалидный или истекший токен. Пожалуйста, авторизуйтесь заново.' 
    });
  }

  // Проверяем, существует ли пользователь
  const user = await User.findByEmail(decoded.email);
  if (!user) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Пользователь с этим токеном больше не существует.' 
    });
  }

  // Если всё хорошо, сохраняем информацию о пользователе в объект запроса
  req.user = {
    email: decoded.email,
    userType: decoded.userType
  };
  
  next();
};

// Middleware для проверки роли пользователя
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Пожалуйста, авторизуйтесь.' 
      });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ 
        status: 'error',
        message: 'У вас нет прав для выполнения этого действия.' 
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorize
};