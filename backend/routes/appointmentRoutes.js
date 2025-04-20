const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Защищаем все маршруты для записей на прием
router.use(authenticateToken);
router.use(authorize('p')); // Только для пациентов

// Получение всех записей на прием для текущего пациента
router.get('/my', appointmentController.getMyAppointments);

// Создание новой записи на прием
router.post('/', appointmentController.createAppointment);

// Получение информации о записи на прием по ID
router.get('/:id', appointmentController.getAppointmentById);

// Отмена записи на прием
router.delete('/:id', appointmentController.cancelAppointment);

module.exports = router;