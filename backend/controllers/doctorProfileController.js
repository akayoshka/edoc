const Doctor = require('../models/doctorModel');
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Получение профиля текущего врача
const getProfile = async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    // Получаем данные врача по email
    const doctor = await Doctor.findByEmail(userEmail);
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Врач не найден'
      });
    }
    
    // Удаляем пароль из ответа
    const { docpassword, ...doctorData } = doctor;
    
    res.status(200).json({
      status: 'success',
      data: {
        doctor: doctorData
      }
    });
  } catch (error) {
    console.error('Ошибка при получении профиля врача:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить профиль врача. Пожалуйста, попробуйте позже.'
    });
  }
};

// Обновление профиля врача
const updateProfile = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { name, nic, tel, specialtyId } = req.body;
    
    // Получаем данные врача по email
    const doctor = await Doctor.findByEmail(userEmail);
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Врач не найден'
      });
    }
    
    // Обновляем данные врача
    const updatedDoctor = await Doctor.update(doctor.docid, {
      name,
      nic,
      tel,
      specialtyId
    });
    
    // Получаем обновленные данные врача с названием специальности
    const fullUpdatedDoctor = await Doctor.findById(doctor.docid);
    
    // Удаляем пароль из ответа
    const { docpassword, ...doctorData } = fullUpdatedDoctor;
    
    res.status(200).json({
      status: 'success',
      message: 'Профиль обновлен успешно',
      data: {
        doctor: doctorData
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении профиля врача:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось обновить профиль врача. Пожалуйста, попробуйте позже.'
    });
  }
};

// Изменение пароля врача
const changePassword = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Проверяем, совпадают ли новый пароль и его подтверждение
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Новый пароль и подтверждение пароля не совпадают'
      });
    }
    
    // Получаем данные врача по email
    const doctor = await Doctor.findByEmail(userEmail);
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Врач не найден'
      });
    }
    
    // Проверяем текущий пароль
    const isPasswordCorrect = await Doctor.checkPassword(userEmail, currentPassword);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Неверный текущий пароль'
      });
    }
    
    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Обновляем пароль в базе данных
    await db.query(
      'UPDATE doctor SET docpassword = $1 WHERE docemail = $2',
      [hashedPassword, userEmail]
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Пароль изменен успешно'
    });
  } catch (error) {
    console.error('Ошибка при изменении пароля врача:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось изменить пароль. Пожалуйста, попробуйте позже.'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};