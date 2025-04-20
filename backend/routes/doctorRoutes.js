const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// Поиск врачей
router.get('/search', doctorController.searchDoctors);

// Получение всех врачей
router.get('/', doctorController.getAllDoctors);

// Получение врача по ID
router.get('/:id', doctorController.getDoctorById);

module.exports = router;