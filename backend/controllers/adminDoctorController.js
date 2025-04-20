const Doctor = require('../models/doctorModel');
const User = require('../models/userModel');
const db = require('../config/db');
const bcrypt = require('bcrypt');

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

// Создание нового врача
const createDoctor = async (req, res) => {
  try {
    const { name, email, password, nic, tel, specialtyId } = req.body;
    
    // Проверяем наличие всех необходимых полей
    if (!name || !email || !password || !specialtyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Пожалуйста, заполните все обязательные поля'
      });
    }
    
    // Проверяем, существует ли уже пользователь с таким email
    const userExists = await User.exists(email);
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Пользователь с таким email уже существует'
      });
    }
    
    // Создаем нового врача
    const doctor = await Doctor.create(
      email,
      name,
      password,
      nic,
      tel,
      specialtyId
    );
    
    // Получаем созданного врача с названием специальности
    const createdDoctor = await Doctor.findById(doctor.docid);
    
    res.status(201).json({
      status: 'success',
      message: 'Врач создан успешно',
      data: {
        doctor: createdDoctor
      }
    });
  } catch (error) {
    console.error('Ошибка при создании врача:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось создать врача. Пожалуйста, попробуйте позже.'
    });
  }
};

// Обновление врача
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nic, tel, specialtyId } = req.body;
    
    // Проверяем, существует ли врач
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Врач не найден'
      });
    }
    
    // Обновляем данные врача
    const updatedDoctor = await Doctor.update(id, {
      name,
      nic,
      tel,
      specialtyId
    });
    
    // Получаем обновленного врача с названием специальности
    const fullUpdatedDoctor = await Doctor.findById(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Информация о враче обновлена успешно',
      data: {
        doctor: fullUpdatedDoctor
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении врача:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось обновить информацию о враче. Пожалуйста, попробуйте позже.'
    });
  }
};

// Сброс пароля врача
const resetDoctorPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Пожалуйста, укажите новый пароль'
      });
    }
    
    // Проверяем, существует ли врач
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Врач не найден'
      });
    }
    
    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Обновляем пароль в базе данных
    await db.query(
      'UPDATE doctor SET docpassword = $1 WHERE docid = $2',
      [hashedPassword, id]
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Пароль врача сброшен успешно'
    });
  } catch (error) {
    console.error('Ошибка при сбросе пароля врача:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось сбросить пароль врача. Пожалуйста, попробуйте позже.'
    });
  }
};

// Удаление врача
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем, существует ли врач
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Врач не найден'
      });
    }
    
    // Проверяем, есть ли у врача расписания
    const schedules = await db.query('SELECT * FROM schedule WHERE docid = $1', [id]);
    
    if (schedules.rows.length > 0) {
      // Получаем ID всех расписаний
      const scheduleIds = schedules.rows.map(s => s.scheduleid);
      
      // Проверяем, есть ли записи на прием
      const appointments = await db.query(
        'SELECT * FROM appointment WHERE scheduleid = ANY($1)',
        [scheduleIds]
      );
      
      if (appointments.rows.length > 0) {
        // Удаляем все записи на прием
        await db.query('DELETE FROM appointment WHERE scheduleid = ANY($1)', [scheduleIds]);
      }
      
      // Удаляем все расписания
      await db.query('DELETE FROM schedule WHERE docid = $1', [id]);
    }
    
    // Удаляем врача
    const result = await Doctor.delete(id);
    
    if (!result) {
      return res.status(500).json({
        status: 'error',
        message: 'Не удалось удалить врача. Пожалуйста, попробуйте позже.'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Врач удален успешно'
    });
  } catch (error) {
    console.error('Ошибка при удалении врача:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось удалить врача. Пожалуйста, попробуйте позже.'
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  resetDoctorPassword,
  deleteDoctor
};