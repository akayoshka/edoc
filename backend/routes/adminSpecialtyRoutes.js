const express = require('express');
const router = express.Router();
const adminSpecialtyController = require('../controllers/adminSpecialtyController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Защищаем все маршруты для администраторов
router.use(authenticateToken);
router.use(authorize('a')); // Только для администраторов

// Получение всех специальностей
router.get('/', adminSpecialtyController.getAllSpecialties);

// Создание новой специальности
router.post('/', adminSpecialtyController.createSpecialty);

// Обновление специальности
router.put('/:id', adminSpecialtyController.updateSpecialty);

// Удаление специальности
router.delete('/:id', adminSpecialtyController.deleteSpecialty);

module.exports = router;