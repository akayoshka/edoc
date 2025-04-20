const db = require('../config/db');

// Получение всех специальностей
const getAllSpecialties = async (req, res) => {
  try {
    const query = 'SELECT * FROM specialties ORDER BY sname ASC';
    const result = await db.query(query);
    
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
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

// Создание новой специальности
const createSpecialty = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Пожалуйста, укажите название специальности'
      });
    }
    
    // Проверяем, существует ли уже такая специальность
    const existing = await db.query('SELECT * FROM specialties WHERE sname = $1', [name]);
    
    if (existing.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Специальность с таким названием уже существует'
      });
    }
    
    // Создаем новую специальность
    const result = await db.query(
      'INSERT INTO specialties (sname) VALUES ($1) RETURNING *',
      [name]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Специальность создана успешно',
      data: {
        specialty: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Ошибка при создании специальности:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось создать специальность. Пожалуйста, попробуйте позже.'
    });
  }
};

// Обновление специальности
const updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Пожалуйста, укажите название специальности'
      });
    }
    
    // Проверяем, существует ли специальность
    const specialty = await db.query('SELECT * FROM specialties WHERE id = $1', [id]);
    
    if (specialty.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Специальность не найдена'
      });
    }
    
    // Проверяем, существует ли уже другая специальность с таким названием
    const existing = await db.query('SELECT * FROM specialties WHERE sname = $1 AND id != $2', [name, id]);
    
    if (existing.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Специальность с таким названием уже существует'
      });
    }
    
    // Обновляем специальность
    const result = await db.query(
      'UPDATE specialties SET sname = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Специальность обновлена успешно',
      data: {
        specialty: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении специальности:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось обновить специальность. Пожалуйста, попробуйте позже.'
    });
  }
};

// Удаление специальности
const deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем, существует ли специальность
    const specialty = await db.query('SELECT * FROM specialties WHERE id = $1', [id]);
    
    if (specialty.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Специальность не найдена'
      });
    }
    
    // Проверяем, используется ли специальность врачами
    const doctors = await db.query('SELECT * FROM doctor WHERE specialties = $1', [id]);
    
    if (doctors.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Невозможно удалить специальность, так как она используется врачами'
      });
    }
    
    // Удаляем специальность
    await db.query('DELETE FROM specialties WHERE id = $1', [id]);
    
    res.status(200).json({
      status: 'success',
      message: 'Специальность удалена успешно'
    });
  } catch (error) {
    console.error('Ошибка при удалении специальности:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось удалить специальность. Пожалуйста, попробуйте позже.'
    });
  }
};

module.exports = {
  getAllSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty
};