const Doctor = require('../models/doctorModel');
const db = require('../config/db');

// Получение всех врачей
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll();
    
    res.status(200).json({
      status: 'success',
      results: doctors.length,
      data: {
        doctors
      }
    });
  } catch (error) {
    console.error('Ошибка при получении врачей:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить список врачей. Пожалуйста, попробуйте позже.'
    });
  }
};

// Получение врача по ID
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Врач не найден'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        doctor
      }
    });
  } catch (error) {
    console.error('Ошибка при получении врача:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить информацию о враче. Пожалуйста, попробуйте позже.'
    });
  }
};

// Поиск врачей по названию или специальности
const searchDoctors = async (req, res) => {
  try {
    let { query, specialtyId } = req.query;
    let sqlQuery = `
      SELECT d.*, s.sname as specialty_name 
      FROM doctor d 
      LEFT JOIN specialties s ON d.specialties = s.id 
      WHERE 1=1
    `;
    const params = [];
    
    // Если указан поисковый запрос
    if (query) {
      sqlQuery += ` AND (d.docname ILIKE $${params.length + 1} OR d.docemail ILIKE $${params.length + 1})`;
      params.push(`%${query}%`);
    }
    
    // Если указана специальность
    if (specialtyId) {
      sqlQuery += ` AND d.specialties = $${params.length + 1}`;
      params.push(specialtyId);
    }
    
    sqlQuery += ` ORDER BY d.docname ASC`;
    
    const result = await db.query(sqlQuery, params);
    
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        doctors: result.rows
      }
    });
  } catch (error) {
    console.error('Ошибка при поиске врачей:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось выполнить поиск врачей. Пожалуйста, попробуйте позже.'
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  searchDoctors
};