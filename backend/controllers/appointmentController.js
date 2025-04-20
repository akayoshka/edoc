const Appointment = require('../models/appointmentModel');
const Schedule = require('../models/scheduleModel');
const Patient = require('../models/patientModel');
const db = require('../config/db');

// Получение всех записей на прием для текущего пациента
const getMyAppointments = async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    // Получаем ID пациента по email
    const patient = await Patient.findByEmail(userEmail);
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Пациент не найден'
      });
    }
    
    // Получаем все записи на прием для данного пациента
    const appointments = await Appointment.findByPatientId(patient.pid);
    
    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: {
        appointments
      }
    });
  } catch (error) {
    console.error('Ошибка при получении записей на прием:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить список записей на прием. Пожалуйста, попробуйте позже.'
    });
  }
};

// Создание новой записи на прием
const createAppointment = async (req, res) => {
  try {
    const { scheduleId } = req.body;
    const userEmail = req.user.email;
    
    // Получаем ID пациента по email
    const patient = await Patient.findByEmail(userEmail);
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Пациент не найден'
      });
    }
    
    // Проверяем, существует ли расписание
    const schedule = await Schedule.findById(scheduleId);
    
    if (!schedule) {
      return res.status(404).json({
        status: 'error',
        message: 'Расписание не найдено'
      });
    }
    
    // Проверяем, не прошла ли дата расписания
    const today = new Date();
    const scheduleDate = new Date(schedule.scheduledate);
    
    if (scheduleDate < today) {
      return res.status(400).json({
        status: 'error',
        message: 'Невозможно записаться на прошедшую дату'
      });
    }
    
    // Проверяем, есть ли свободные места
    const bookings = await Appointment.countByScheduleId(scheduleId);
    
    if (bookings >= schedule.nop) {
      return res.status(400).json({
        status: 'error',
        message: 'Нет свободных мест для записи'
      });
    }
    
    // Проверяем, не записан ли уже пациент на это расписание
    const existingAppointment = await db.query(
      'SELECT * FROM appointment WHERE pid = $1 AND scheduleid = $2',
      [patient.pid, scheduleId]
    );
    
    if (existingAppointment.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Вы уже записаны на это расписание'
      });
    }
    
    // Определяем номер записи
    const appoNum = bookings + 1;
    
    // Создаем новую запись на прием
    const appointment = await Appointment.create(
      patient.pid,
      scheduleId,
      appoNum,
      today.toISOString().split('T')[0] // текущая дата в формате YYYY-MM-DD
    );
    
    // Получаем полную информацию о созданной записи
    const fullAppointment = await Appointment.findById(appointment.appoid);
    
    res.status(201).json({
      status: 'success',
      message: 'Запись на прием создана успешно',
      data: {
        appointment: fullAppointment
      }
    });
  } catch (error) {
    console.error('Ошибка при создании записи на прием:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось создать запись на прием. Пожалуйста, попробуйте позже.'
    });
  }
};

// Получение информации о записи на прием по ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;
    
    // Получаем ID пациента по email
    const patient = await Patient.findByEmail(userEmail);
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Пациент не найден'
      });
    }
    
    // Получаем запись на прием
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Запись на прием не найдена'
      });
    }
    
    // Проверяем, принадлежит ли запись текущему пациенту
    if (appointment.pid !== patient.pid) {
      return res.status(403).json({
        status: 'error',
        message: 'У вас нет доступа к этой записи на прием'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Ошибка при получении записи на прием:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить информацию о записи на прием. Пожалуйста, попробуйте позже.'
    });
  }
};

// Отмена записи на прием
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;
    
    // Получаем ID пациента по email
    const patient = await Patient.findByEmail(userEmail);
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Пациент не найден'
      });
    }
    
    // Получаем запись на прием
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Запись на прием не найдена'
      });
    }
    
    // Проверяем, принадлежит ли запись текущему пациенту
    if (appointment.pid !== patient.pid) {
      return res.status(403).json({
        status: 'error',
        message: 'У вас нет доступа к этой записи на прием'
      });
    }
    
    // Проверяем, не прошла ли дата приема
    const today = new Date();
    const appointmentDate = new Date(appointment.scheduledate);
    
    if (appointmentDate < today) {
      return res.status(400).json({
        status: 'error',
        message: 'Невозможно отменить прошедший прием'
      });
    }
    
    // Удаляем запись на прием
    await Appointment.delete(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Запись на прием отменена успешно'
    });
  } catch (error) {
    console.error('Ошибка при отмене записи на прием:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось отменить запись на прием. Пожалуйста, попробуйте позже.'
    });
  }
};

module.exports = {
  getMyAppointments,
  createAppointment,
  getAppointmentById,
  cancelAppointment
};