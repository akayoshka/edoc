const Patient = require('../models/patientModel');
const bcrypt = require('bcrypt');

// Получение профиля текущего пациента
const getProfile = async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    // Получаем данные пациента по email
    const patient = await Patient.findByEmail(userEmail);
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Пациент не найден'
      });
    }
    
    // Удаляем пароль из ответа
    const { ppassword, ...patientData } = patient;
    
    res.status(200).json({
      status: 'success',
      data: {
        patient: patientData
      }
    });
  } catch (error) {
    console.error('Ошибка при получении профиля пациента:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить профиль пациента. Пожалуйста, попробуйте позже.'
    });
  }
};

// Обновление профиля пациента
const updateProfile = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { name, address, nic, tel } = req.body;
    
    // Получаем данные пациента по email
    const patient = await Patient.findByEmail(userEmail);
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Пациент не найден'
      });
    }
    
    // Обновляем данные пациента
    const updatedPatient = await Patient.update(patient.pid, {
      name,
      address,
      nic,
      tel
    });
    
    // Удаляем пароль из ответа
    const { ppassword, ...patientData } = updatedPatient;
    
    res.status(200).json({
      status: 'success',
      message: 'Профиль обновлен успешно',
      data: {
        patient: patientData
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении профиля пациента:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось обновить профиль пациента. Пожалуйста, попробуйте позже.'
    });
  }
};

// Изменение пароля пациента
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
    
    // Получаем данные пациента по email
    const patient = await Patient.findByEmail(userEmail);
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Пациент не найден'
      });
    }
    
    // Проверяем текущий пароль
    const isPasswordCorrect = await Patient.checkPassword(userEmail, currentPassword);
    
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
      'UPDATE patient SET ppassword = $1 WHERE pemail = $2',
      [hashedPassword, userEmail]
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Пароль изменен успешно'
    });
  } catch (error) {
    console.error('Ошибка при изменении пароля пациента:', error);
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