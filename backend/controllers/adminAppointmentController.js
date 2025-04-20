const Appointment = require('../models/appointmentModel');
const Schedule = require('../models/scheduleModel');
const Patient = require('../models/patientModel');
const db = require('../config/db');

// Получение всех записей на прием
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    
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

// Получение записи на прием по ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Запись на прием не найдена'
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

// Создание новой записи на прием
const createAppointment = async (req, res) => {
  try {
    const { patientId, scheduleId } = req.body;
    
    // Проверяем наличие всех необходимых полей
    if (!patientId || !scheduleId) {
      return res.status(400).json({
        status: 'error',
        message: 'Пожалуйста, укажите ID пациента и расписания'
      });
    }
    
    // Проверяем, существует ли пациент
    const patient = await Patient.findById(patientId);
    
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
      [patientId, scheduleId]
    );
    
    if (existingAppointment.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Пациент уже записан на это расписание'
      });
    }
    
    // Определяем номер записи
    const appoNum = bookings + 1;
    
    // Создаем новую запись на прием
    const appointment = await Appointment.create(
      patientId,
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

// Отмена записи на прием
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем, существует ли запись на прием
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Запись на прием не найдена'
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

// Получение статистики записей на прием
const getAppointmentStats = async (req, res) => {
  try {
    // Получаем общее количество записей на прием
    const totalAppointments = await db.query('SELECT COUNT(*) as count FROM appointment');
    
    // Получаем количество записей на прием на сегодня
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = await db.query(
      'SELECT COUNT(*) as count FROM appointment a JOIN schedule s ON a.scheduleid = s.scheduleid WHERE s.scheduledate = $1',
      [today]
    );
    
    // Получаем количество записей на прием на будущие даты
    const futureAppointments = await db.query(
      'SELECT COUNT(*) as count FROM appointment a JOIN schedule s ON a.scheduleid = s.scheduleid WHERE s.scheduledate > $1',
      [today]
    );
    
    // Получаем количество записей на прием на прошедшие даты
    const pastAppointments = await db.query(
      'SELECT COUNT(*) as count FROM appointment a JOIN schedule s ON a.scheduleid = s.scheduleid WHERE s.scheduledate < $1',
      [today]
    );
    
    // Получаем статистику по врачам (топ-5 по количеству записей)
    const doctorStats = await db.query(`
      SELECT d.docid, d.docname, COUNT(a.appoid) as appointment_count
      FROM appointment a
      JOIN schedule s ON a.scheduleid = s.scheduleid
      JOIN doctor d ON s.docid = d.docid
      GROUP BY d.docid, d.docname
      ORDER BY appointment_count DESC
      LIMIT 5
    `);
    
    res.status(200).json({
      status: 'success',
      data: {
        total: parseInt(totalAppointments.rows[0].count),
        today: parseInt(todayAppointments.rows[0].count),
        future: parseInt(futureAppointments.rows[0].count),
        past: parseInt(pastAppointments.rows[0].count),
        topDoctors: doctorStats.rows
      }
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить статистику записей на прием. Пожалуйста, попробуйте позже.'
    });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  cancelAppointment,
  getAppointmentStats
};