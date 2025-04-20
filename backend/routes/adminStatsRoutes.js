const express = require('express');
const router = express.Router();
const adminStatsController = require('../controllers/adminStatsController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Защищаем все маршруты для администраторов
router.use(authenticateToken);
router.use(authorize('a')); // Только для администраторов

// Получение общей статистики системы
router.get('/', adminStatsController.getSystemStats);

module.exports = router;