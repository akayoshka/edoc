const express = require('express');
const router = express.Router();
const adminPatientController = require('../controllers/adminPatientController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Защищаем все маршруты для администраторов
router.use(authenticateToken);
router.use(authorize('a')); // Только для администраторов

// Получение всех пациентов
router.get('/', adminPatientController.getAllPatients);

// Получение пациента по ID
router.get('/:id', adminPatientController.getPatientById);

// Создание нового пациента
router.post('/', adminPatientController.createPatient);

// Обновление пациента
router.put('/:id', adminPatientController.updatePatient);

// Сброс пароля пациента
router.post('/:id/reset-password', adminPatientController.resetPatientPassword);

// Удаление пациента
router.delete('/:id', adminPatientController.deletePatient);

module.exports = router;