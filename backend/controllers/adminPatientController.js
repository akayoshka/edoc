const Patient = require('../models/patientModel');
const User = require('../models/userModel');
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Получение всех пациентов
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll();
    
    // Удаляем пароли из ответа
    const patientsWithoutPasswords = patients.map(patient => {
      const { ppassword, ...patientData } = patient;
      return patientData;
    });
    
    res.status(200).json({
      status: 'success',
      results: patientsWithoutPasswords.length,
      data: {
        patients: patientsWithoutPasswords
      }
    });
  } catch (error) {
    console.error('Ошибка при получении пациентов:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить список пациентов. Пожалуйста, попробуйте позже.'
    });
  }
};

// Получение пациента по ID
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findById(id);
    
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
    console.error('Ошибка при получении пациента:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить информацию о пациенте. Пожалуйста, попробуйте позже.'
    });
  }
};

// Создание нового пациента
const createPatient = async (req, res) => {
  try {
    const { name, email, password, address, nic, dob, tel } = req.body;
    
    // Проверяем наличие всех необходимых полей
    if (!name || !email || !password) {
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
    
    // Создаем нового пациента
    const patient = await Patient.create(
      email,
      name,
      password,
      address,
      nic,
      dob,
      tel
    );
    
    // Удаляем пароль из ответа
    const { ppassword, ...patientData } = patient;
    
    res.status(201).json({
      status: 'success',
      message: 'Пациент создан успешно',
      data: {
        patient: patientData
      }
    });
  } catch (error) {
    console.error('Ошибка при создании пациента:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось создать пациента. Пожалуйста, попробуйте позже.'
    });
  }
};

// Обновление пациента
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, nic, tel } = req.body;
    
    // Проверяем, существует ли пациент
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Пациент не найден'
      });
    }
    
    // Обновляем данные пациента
    const updatedPatient = await Patient.update(id, {
      name,
      address,
      nic,
      tel
    });
    
    // Удаляем пароль из ответа
    const { ppassword, ...patientData } = updatedPatient;
    
    res.status(200).json({
      status: 'success',
      message: 'Информация о пациенте обновлена успешно',
      data: {
        patient: patientData
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении пациента:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось обновить информацию о пациенте. Пожалуйста, попробуйте позже.'
    });
  }
};

// Сброс пароля пациента
const resetPatientPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Пожалуйста, укажите новый пароль'
      });
    }
    
    // Проверяем, существует ли пациент
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Пациент не найден'
      });
    }
    
    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Обновляем пароль в базе данных
    await db.query(
      'UPDATE patient SET ppassword = $1 WHERE pid = $2',
      [hashedPassword, id]
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Пароль пациента сброшен успешно'
    });
  } catch (error) {
    console.error('Ошибка при сбросе пароля пациента:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось сбросить пароль пациента. Пожалуйста, попробуйте позже.'
    });
  }
};

// Удаление пациента
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем, существует ли пациент
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Пациент не найден'
      });
    }
    
    // Проверяем, есть ли у пациента записи на прием
    const appointments = await db.query('SELECT * FROM appointment WHERE pid = $1', [id]);
    
    if (appointments.rows.length > 0) {
      // Удаляем все записи на прием
      await db.query('DELETE FROM appointment WHERE pid = $1', [id]);
    }
    
    // Удаляем пациента
    const result = await Patient.delete(id);
    
    if (!result) {
      return res.status(500).json({
        status: 'error',
        message: 'Не удалось удалить пациента. Пожалуйста, попробуйте позже.'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Пациент удален успешно'
    });
  } catch (error) {
    console.error('Ошибка при удалении пациента:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось удалить пациента. Пожалуйста, попробуйте позже.'
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  resetPatientPassword,
  deletePatient
};