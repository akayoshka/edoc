const express = require('express');
const router = express.Router();
const patientProfileController = require('../controllers/patientProfileController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Защищаем все маршруты для профиля пациента
router.use(authenticateToken);
router.use(authorize('p')); // Только для пациентов

// Получение профиля текущего пациента
router.get('/', patientProfileController.getProfile);

// Обновление профиля пациента
router.put('/', patientProfileController.updateProfile);

// Изменение пароля пациента
router.post('/change-password', patientProfileController.changePassword);

module.exports = router;