const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// Поиск расписаний
router.get('/search', scheduleController.searchSchedules);

// Получение всех расписаний
router.get('/', scheduleController.getAllSchedules);

// Получение расписания по ID
router.get('/:id', scheduleController.getScheduleById);

module.exports = router;