const express = require('express');
const router = express.Router();
const doctorProfileController = require('../controllers/doctorProfileController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Защищаем все маршруты для профиля врача
router.use(authenticateToken);
router.use(authorize('d')); // Только для врачей

// Получение профиля текущего врача
router.get('/', doctorProfileController.getProfile);

// Обновление профиля врача
router.put('/', doctorProfileController.updateProfile);

// Изменение пароля врача
router.post('/change-password', doctorProfileController.changePassword);

module.exports = router;