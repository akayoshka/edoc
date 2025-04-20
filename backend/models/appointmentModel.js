const db = require('../config/db');

class Appointment {
  // Создание новой записи на прием
  static async create(patientId, scheduleId, appointmentNumber, appointmentDate) {
    const query = `
      INSERT INTO appointment (pid, scheduleid, apponum, appodate) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const values = [patientId, scheduleId, appointmentNumber, appointmentDate];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Поиск записи на прием по ID
  static async findById(id) {
    const query = `
      SELECT a.*, p.pname, p.pemail, s.title, s.scheduledate, s.scheduletime, d.docname, d.docemail
      FROM appointment a
      JOIN patient p ON a.pid = p.pid
      JOIN schedule s ON a.scheduleid = s.scheduleid
      JOIN doctor d ON s.docid = d.docid
      WHERE a.appoid = $1
    `;
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Получение всех записей на прием
  static async findAll() {
    const query = `
      SELECT a.*, p.pname, p.pemail, s.title, s.scheduledate, s.scheduletime, d.docname, d.docemail
      FROM appointment a
      JOIN patient p ON a.pid = p.pid
      JOIN schedule s ON a.scheduleid = s.scheduleid
      JOIN doctor d ON s.docid = d.docid
      ORDER BY a.appodate DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // Получение записей на прием пациента
  static async findByPatientId(patientId) {
    const query = `
      SELECT a.*, p.pname, p.pemail, s.title, s.scheduledate, s.scheduletime, d.docname, d.docemail
      FROM appointment a
      JOIN patient p ON a.pid = p.pid
      JOIN schedule s ON a.scheduleid = s.scheduleid
      JOIN doctor d ON s.docid = d.docid
      WHERE a.pid = $1
      ORDER BY a.appodate DESC
    `;
    const values = [patientId];
    const result = await db.query(query, values);
    return result.rows;
  }

  // Получение записей на прием врача
  static async findByDoctorId(doctorId) {
    const query = `
      SELECT a.*, p.pname, p.pemail, s.title, s.scheduledate, s.scheduletime, d.docname, d.docemail
      FROM appointment a
      JOIN patient p ON a.pid = p.pid
      JOIN schedule s ON a.scheduleid = s.scheduleid
      JOIN doctor d ON s.docid = d.docid
      WHERE d.docid = $1
      ORDER BY a.appodate DESC
    `;
    const values = [doctorId];
    const result = await db.query(query, values);
    return result.rows;
  }

  // Получение записей на прием по расписанию
  static async findByScheduleId(scheduleId) {
    const query = `
      SELECT a.*, p.pname, p.pemail
      FROM appointment a
      JOIN patient p ON a.pid = p.pid
      WHERE a.scheduleid = $1
      ORDER BY a.apponum ASC
    `;
    const values = [scheduleId];
    const result = await db.query(query, values);
    return result.rows;
  }

  // Подсчет количества записей на прием по расписанию
  static async countByScheduleId(scheduleId) {
    const query = 'SELECT COUNT(*) as count FROM appointment WHERE scheduleid = $1';
    const values = [scheduleId];
    const result = await db.query(query, values);
    return parseInt(result.rows[0].count);
  }

  // Удаление записи на прием
  static async delete(id) {
    const query = 'DELETE FROM appointment WHERE appoid = $1';
    await db.query(query, [id]);
    return true;
  }
}

module.exports = Appointment;