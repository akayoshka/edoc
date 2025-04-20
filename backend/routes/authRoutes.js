const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Маршрут для универсального входа
router.post('/login', authController.login);

// Маршруты для входа по типам пользователей
router.post('/login/admin', authController.loginAdmin);
router.post('/login/doctor', authController.loginDoctor);
router.post('/login/patient', authController.loginPatient);

// Маршрут для регистрации пациента
router.post('/register/patient', authController.registerPatient);

// Маршрут для получения информации о текущем пользователе
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;