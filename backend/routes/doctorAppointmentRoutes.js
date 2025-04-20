const express = require('express');
const router = express.Router();
const doctorAppointmentController = require('../controllers/doctorAppointmentController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Защищаем все маршруты для записей на прием
router.use(authenticateToken);
router.use(authorize('d')); // Только для врачей

// Получение всех записей на прием для текущего врача
router.get('/', doctorAppointmentController.getMyAppointments);

// Получение записей на прием по дате
router.get('/date/:date', doctorAppointmentController.getAppointmentsByDate);

// Получение информации о записи на прием по ID
router.get('/:id', doctorAppointmentController.getAppointmentById);

// Отмена записи на прием
router.delete('/:id', doctorAppointmentController.cancelAppointment);

module.exports = router;