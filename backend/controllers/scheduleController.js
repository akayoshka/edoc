const Schedule = require('../models/scheduleModel');
const Appointment = require('../models/appointmentModel');
const db = require('../config/db');

// Получение всех сеансов расписания
const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.findAll();
    
    // Получаем количество уже забронированных мест для каждого расписания
    const schedulesWithBookings = await Promise.all(
      schedules.map(async (schedule) => {
        const bookings = await Appointment.countByScheduleId(schedule.scheduleid);
        return {
          ...schedule,
          bookedSlots: bookings,
          availableSlots: schedule.nop - bookings
        };
      })
    );
    
    res.status(200).json({
      status: 'success',
      results: schedulesWithBookings.length,
      data: {
        schedules: schedulesWithBookings
      }
    });
  } catch (error) {
    console.error('Ошибка при получении расписаний:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить список расписаний. Пожалуйста, попробуйте позже.'
    });
  }
};

// Получение расписания по ID
const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = await Schedule.findById(id);
    
    if (!schedule) {
      return res.status(404).json({
        status: 'error',
        message: 'Расписание не найдено'
      });
    }
    
    // Получаем количество уже забронированных мест
    const bookings = await Appointment.countByScheduleId(id);
    
    res.status(200).json({
      status: 'success',
      data: {
        schedule: {
          ...schedule,
          bookedSlots: bookings,
          availableSlots: schedule.nop - bookings
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при получении расписания:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить информацию о расписании. Пожалуйста, попробуйте позже.'
    });
  }
};

// Поиск расписания по врачу, дате, названию
const searchSchedules = async (req, res) => {
  try {
    let { doctorId, date, title } = req.query;
    let sqlQuery = `
      SELECT s.*, d.docname, d.docemail
      FROM schedule s
      JOIN doctor d ON s.docid = d.docid
      WHERE s.scheduledate >= CURRENT_DATE
    `;
    const params = [];
    
    // Если указан ID врача
    if (doctorId) {
      sqlQuery += ` AND s.docid = $${params.length + 1}`;
      params.push(doctorId);
    }
    
    // Если указана дата
    if (date) {
      sqlQuery += ` AND s.scheduledate = $${params.length + 1}`;
      params.push(date);
    }
    
    // Если указано название
    if (title) {
      sqlQuery += ` AND s.title ILIKE $${params.length + 1}`;
      params.push(`%${title}%`);
    }
    
    sqlQuery += ` ORDER BY s.scheduledate ASC, s.scheduletime ASC`;
    
    const result = await db.query(sqlQuery, params);
    
    // Получаем количество уже забронированных мест для каждого расписания
    const schedulesWithBookings = await Promise.all(
      result.rows.map(async (schedule) => {
        const bookings = await Appointment.countByScheduleId(schedule.scheduleid);
        return {
          ...schedule,
          bookedSlots: bookings,
          availableSlots: schedule.nop - bookings
        };
      })
    );
    
    res.status(200).json({
      status: 'success',
      results: schedulesWithBookings.length,
      data: {
        schedules: schedulesWithBookings
      }
    });
  } catch (error) {
    console.error('Ошибка при поиске расписаний:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось выполнить поиск расписаний. Пожалуйста, попробуйте позже.'
    });
  }
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  searchSchedules
};