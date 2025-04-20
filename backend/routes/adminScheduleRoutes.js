const express = require('express');
const router = express.Router();
const adminScheduleController = require('../controllers/adminScheduleController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Защищаем все маршруты для администраторов
router.use(authenticateToken);
router.use(authorize('a')); // Только для администраторов

// Получение всех расписаний
router.get('/', adminScheduleController.getAllSchedules);

// Получение расписания по ID
router.get('/:id', adminScheduleController.getScheduleById);

// Создание нового расписания
router.post('/', adminScheduleController.createSchedule);

// Обновление расписания
router.put('/:id', adminScheduleController.updateSchedule);

// Удаление расписания
router.delete('/:id', adminScheduleController.deleteSchedule);

module.exports = router;