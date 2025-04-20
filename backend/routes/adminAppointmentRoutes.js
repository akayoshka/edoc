const express = require('express');
const router = express.Router();
const adminAppointmentController = require('../controllers/adminAppointmentController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Защищаем все маршруты для администраторов
router.use(authenticateToken);
router.use(authorize('a')); // Только для администраторов

// Получение статистики записей на прием
router.get('/stats', adminAppointmentController.getAppointmentStats);

// Получение всех записей на прием
router.get('/', adminAppointmentController.getAllAppointments);

// Получение записи на прием по ID
router.get('/:id', adminAppointmentController.getAppointmentById);

// Создание новой записи на прием
router.post('/', adminAppointmentController.createAppointment);

// Отмена записи на прием
router.delete('/:id', adminAppointmentController.cancelAppointment);

module.exports = router;