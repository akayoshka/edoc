const express = require('express');
const router = express.Router();
const adminDoctorController = require('../controllers/adminDoctorController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Защищаем все маршруты для администраторов
router.use(authenticateToken);
router.use(authorize('a')); // Только для администраторов

// Получение всех врачей
router.get('/', adminDoctorController.getAllDoctors);

// Получение врача по ID
router.get('/:id', adminDoctorController.getDoctorById);

// Создание нового врача
router.post('/', adminDoctorController.createDoctor);

// Обновление врача
router.put('/:id', adminDoctorController.updateDoctor);

// Сброс пароля врача
router.post('/:id/reset-password', adminDoctorController.resetDoctorPassword);

// Удаление врача
router.delete('/:id', adminDoctorController.deleteDoctor);

module.exports = router;