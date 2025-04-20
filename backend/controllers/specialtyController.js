const db = require('../config/db');

// Получение всех специальностей
const getAllSpecialties = async (req, res) => {
  try {
    const query = 'SELECT * FROM specialties ORDER BY sname ASC';
    const result = await db.query(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        specialties: result.rows
      }
    });
  } catch (error) {
    console.error('Ошибка при получении специальностей:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить список специальностей. Пожалуйста, попробуйте позже.'
    });
  }
};

// Получение специальности по ID
const getSpecialtyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM specialties WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Специальность не найдена'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        specialty: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Ошибка при получении специальности:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить информацию о специальности. Пожалуйста, попробуйте позже.'
    });
  }
};

module.exports = {
  getAllSpecialties,
  getSpecialtyById
};