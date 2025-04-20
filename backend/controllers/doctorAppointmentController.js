const Appointment = require('../models/appointmentModel');
const Doctor = require('../models/doctorModel');
const Schedule = require('../models/scheduleModel');

// Получение всех записей на прием для текущего врача
const getMyAppointments = async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    // Получаем ID врача по email
    const doctor = await Doctor.findByEmail(userEmail);
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Врач не найден'
      });
    }
    
    // Получаем все записи на прием для этого врача
    const appointments = await Appointment.findByDoctorId(doctor.docid);
    
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

// Получение записей на прием по дате
const getAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const userEmail = req.user.email;
    
    // Получаем ID врача по email
    const doctor = await Doctor.findByEmail(userEmail);
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Врач не найден'
      });
    }
    
    // Получаем все расписания этого врача на указанную дату
    const schedules = await db.query(
      'SELECT scheduleid FROM schedule WHERE docid = $1 AND scheduledate = $2',
      [doctor.docid, date]
    );
    
    if (schedules.rows.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: {
          appointments: []
        }
      });
    }
    
    // Получаем ID всех расписаний
    const scheduleIds = schedules.rows.map(s => s.scheduleid);
    
    // Получаем все записи на прием для этих расписаний
    const appointments = await db.query(`
      SELECT a.*, p.pname, p.pemail, s.title, s.scheduledate, s.scheduletime, d.docname, d.docemail
      FROM appointment a
      JOIN patient p ON a.pid = p.pid
      JOIN schedule s ON a.scheduleid = s.scheduleid
      JOIN doctor d ON s.docid = d.docid
      WHERE a.scheduleid = ANY($1)
      ORDER BY s.scheduletime ASC, a.apponum ASC
    `, [scheduleIds]);
    
    res.status(200).json({
      status: 'success',
      results: appointments.rows.length,
      data: {
        appointments: appointments.rows
      }
    });
  } catch (error) {
    console.error('Ошибка при получении записей на прием по дате:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить список записей на прием. Пожалуйста, попробуйте позже.'
    });
  }
};

// Получение информации о записи на прием по ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;
    
    // Получаем ID врача по email
    const doctor = await Doctor.findByEmail(userEmail);
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Врач не найден'
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
    
    // Проверяем, принадлежит ли расписание этой записи текущему врачу
    if (appointment.docid !== doctor.docid) {
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
    
    // Получаем ID врача по email
    const doctor = await Doctor.findByEmail(userEmail);
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Врач не найден'
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
    
    // Проверяем, принадлежит ли расписание этой записи текущему врачу
    if (appointment.docid !== doctor.docid) {
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
  getAppointmentsByDate,
  getAppointmentById,
  cancelAppointment
};