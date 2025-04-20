const db = require('../config/db');

// Получение общей статистики системы
const getSystemStats = async (req, res) => {
  try {
    // Получаем количество пользователей по типам
    const userStats = await db.query(`
      SELECT usertype, COUNT(*) as count
      FROM webuser
      GROUP BY usertype
    `);
    
    const userCounts = {
      total: 0,
      patients: 0,
      doctors: 0,
      admins: 0
    };
    
    userStats.rows.forEach(row => {
      if (row.usertype === 'p') userCounts.patients = parseInt(row.count);
      else if (row.usertype === 'd') userCounts.doctors = parseInt(row.count);
      else if (row.usertype === 'a') userCounts.admins = parseInt(row.count);
      
      userCounts.total += parseInt(row.count);
    });
    
    // Получаем количество расписаний
    const scheduleStats = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN scheduledate >= CURRENT_DATE THEN 1 END) as upcoming,
        COUNT(CASE WHEN scheduledate < CURRENT_DATE THEN 1 END) as past
      FROM schedule
    `);
    
    // Получаем количество записей на прием
    const appointmentStats = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN s.scheduledate = CURRENT_DATE THEN 1 END) as today,
        COUNT(CASE WHEN s.scheduledate > CURRENT_DATE THEN 1 END) as upcoming,
        COUNT(CASE WHEN s.scheduledate < CURRENT_DATE THEN 1 END) as past
      FROM appointment a
      JOIN schedule s ON a.scheduleid = s.scheduleid
    `);
    
    // Получаем статистику по специальностям
    const specialtyStats = await db.query(`
      SELECT s.sname, COUNT(d.docid) as doctor_count
      FROM specialties s
      LEFT JOIN doctor d ON s.id = d.specialties
      GROUP BY s.id, s.sname
      ORDER BY doctor_count DESC
    `);
    
    // Получаем статистику по активности за последний месяц
    const monthlyActivity = await db.query(`
      SELECT 
        COUNT(*) as appointments,
        COUNT(DISTINCT a.pid) as unique_patients,
        COUNT(DISTINCT s.docid) as unique_doctors
      FROM appointment a
      JOIN schedule s ON a.scheduleid = s.scheduleid
      WHERE a.appodate >= CURRENT_DATE - INTERVAL '30 days'
    `);
    
    res.status(200).json({
      status: 'success',
      data: {
        users: userCounts,
        schedules: {
          total: parseInt(scheduleStats.rows[0].total),
          upcoming: parseInt(scheduleStats.rows[0].upcoming),
          past: parseInt(scheduleStats.rows[0].past)
        },
        appointments: {
          total: parseInt(appointmentStats.rows[0].total),
          today: parseInt(appointmentStats.rows[0].today),
          upcoming: parseInt(appointmentStats.rows[0].upcoming),
          past: parseInt(appointmentStats.rows[0].past)
        },
        specialties: specialtyStats.rows,
        monthlyActivity: {
          appointments: parseInt(monthlyActivity.rows[0].appointments),
          uniquePatients: parseInt(monthlyActivity.rows[0].unique_patients),
          uniqueDoctors: parseInt(monthlyActivity.rows[0].unique_doctors)
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при получении статистики системы:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось получить статистику системы. Пожалуйста, попробуйте позже.'
    });
  }
};

module.exports = {
  getSystemStats
};