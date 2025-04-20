const Schedule = require('../models/scheduleModel');
const Appointment = require('../models/appointmentModel');
const Doctor = require('../models/doctorModel');
const db = require('../config/db');

// Получение всех расписаний
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
    
    // Получаем все записи на это расписание
    const appointments = await Appointment.findByScheduleId(id);
    
    res.status(200).json({
      status: 'success',
      data: {
        schedule: {
          ...schedule,
          bookedSlots: bookings,
          availableSlots: schedule.nop - bookings
        },
        appointments
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

// Создание нового расписания
const createSchedule = async (req, res) => {
  try {
    const { doctorId, title, date, time, nop } = req.body;
    
    // Проверяем наличие всех необходимых полей
    if (!doctorId || !title || !date || !time || !nop) {
      return res.status(400).json({
        status: 'error',
        message: 'Пожалуйста, заполните все обязательные поля'
      });
    }
    
    // Проверяем, существует ли врач
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Врач не найден'
      });
    }
    
    // Проверяем, не прошла ли указанная дата
    const scheduleDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (scheduleDate < today) {
      return res.status(400).json({
        status: 'error',
        message: 'Невозможно создать расписание на прошедшую дату'
      });
    }
    
    // Проверяем, не существует ли уже расписание на это время у этого врача
    const existingSchedule = await db.query(
      'SELECT * FROM schedule WHERE docid = $1 AND scheduledate = $2 AND scheduletime = $3',
      [doctorId, date, time]
    );
    
    if (existingSchedule.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'У этого врача уже есть расписание на это время'
      });
    }
    
    // Создаем новое расписание
    const schedule = await Schedule.create(
      doctorId,
      title,
      date,
      time,
      nop
    );
    
    // Получаем полную информацию о созданном расписании
    const fullSchedule = await Schedule.findById(schedule.scheduleid);
    
    res.status(201).json({
      status: 'success',
      message: 'Расписание создано успешно',
      data: {
        schedule: {
          ...fullSchedule,
          bookedSlots: 0,
          availableSlots: fullSchedule.nop
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при создании расписания:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось создать расписание. Пожалуйста, попробуйте позже.'
    });
  }
};

// Обновление расписания
const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, time, nop } = req.body;
    
    // Проверяем, существует ли расписание
    const schedule = await Schedule.findById(id);
    
    if (!schedule) {
      return res.status(404).json({
        status: 'error',
        message: 'Расписание не найдено'
      });
    }
    
    // Проверяем, не прошла ли указанная дата
    const scheduleDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (scheduleDate < today) {
      return res.status(400).json({
        status: 'error',
        message: 'Невозможно обновить расписание на прошедшую дату'
      });
    }
    
    // Проверяем, не существует ли уже другое расписание на это время у этого врача
    const existingSchedule = await db.query(
      'SELECT * FROM schedule WHERE docid = $1 AND scheduledate = $2 AND scheduletime = $3 AND scheduleid != $4',
      [schedule.docid, date, time, id]
    );
    
    if (existingSchedule.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'У этого врача уже есть другое расписание на это время'
      });
    }
    
    // Получаем количество уже имеющихся записей
    const bookings = await Appointment.countByScheduleId(id);
    
    // Проверяем, не меньше ли новое количество мест, чем уже забронировано
    if (nop < bookings) {
      return res.status(400).json({
        status: 'error',
        message: `Невозможно уменьшить количество мест меньше, чем уже забронировано (${bookings})`
      });
    }
    
    // Обновляем расписание
    const updatedSchedule = await Schedule.update(id, {
      title,
      date,
      time,
      nop
    });
    
    // Получаем полную информацию об обновленном расписании
    const fullUpdatedSchedule = await Schedule.findById(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Расписание обновлено успешно',
      data: {
        schedule: {
          ...fullUpdatedSchedule,
          bookedSlots: bookings,
          availableSlots: fullUpdatedSchedule.nop - bookings
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении расписания:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось обновить расписание. Пожалуйста, попробуйте позже.'
    });
  }
};

// Удаление расписания
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем, существует ли расписание
    const schedule = await Schedule.findById(id);
    
    if (!schedule) {
      return res.status(404).json({
        status: 'error',
        message: 'Расписание не найдено'
      });
    }
    
    // Проверяем, есть ли записи на это расписание
    const appointments = await Appointment.findByScheduleId(id);
    
    if (appointments.length > 0) {
      // Удаляем все записи на прием для этого расписания
      await db.query('DELETE FROM appointment WHERE scheduleid = $1', [id]);
    }
    
    // Удаляем расписание
    await Schedule.delete(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Расписание удалено успешно'
    });
  } catch (error) {
    console.error('Ошибка при удалении расписания:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось удалить расписание. Пожалуйста, попробуйте позже.'
    });
  }
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
};