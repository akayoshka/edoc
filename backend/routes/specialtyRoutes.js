const express = require('express');
const router = express.Router();
const specialtyController = require('../controllers/specialtyController');

// Получение всех специальностей
router.get('/', specialtyController.getAllSpecialties);

// Получение специальности по ID
router.get('/:id', specialtyController.getSpecialtyById);

module.exports = router;