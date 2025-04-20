const express = require('express');
const router = express.Router();
const doctorScheduleController = require('../controllers/doctorScheduleController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Защищаем все маршруты для расписания врача
router.use(authenticateToken);
router.use(authorize('d')); // Только для врачей

// Получение расписаний текущего врача
router.get('/', doctorScheduleController.getMySchedules);

// Создание нового расписания
router.post('/', doctorScheduleController.createSchedule);

// Получение информации о расписании по ID
router.get('/:id', doctorScheduleController.getScheduleById);

// Обновление расписания
router.put('/:id', doctorScheduleController.updateSchedule);

// Удаление расписания
router.delete('/:id', doctorScheduleController.deleteSchedule);

module.exports = router;