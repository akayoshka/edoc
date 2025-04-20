const db = require('../config/db');

class Schedule {
  // Создание нового расписания
  static async create(docId, title, date, time, nop) {
    const query = `
      INSERT INTO schedule (docid, title, scheduledate, scheduletime, nop) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    const values = [docId, title, date, time, nop];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Поиск расписания по ID
  static async findById(id) {
    const query = `
      SELECT s.*, d.docname, d.docemail
      FROM schedule s
      JOIN doctor d ON s.docid = d.docid
      WHERE s.scheduleid = $1
    `;
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Получение всех расписаний
  static async findAll() {
    const query = `
      SELECT s.*, d.docname, d.docemail
      FROM schedule s
      JOIN doctor d ON s.docid = d.docid
      ORDER BY s.scheduledate DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // Получение расписаний врача
  static async findByDoctorId(docId) {
    const query = `
      SELECT s.*, d.docname, d.docemail
      FROM schedule s
      JOIN doctor d ON s.docid = d.docid
      WHERE s.docid = $1
      ORDER BY s.scheduledate DESC
    `;
    const values = [docId];
    const result = await db.query(query, values);
    return result.rows;
  }

  // Получение расписаний на определенную дату
  static async findByDate(date) {
    const query = `
      SELECT s.*, d.docname, d.docemail
      FROM schedule s
      JOIN doctor d ON s.docid = d.docid
      WHERE s.scheduledate = $1
      ORDER BY s.scheduletime ASC
    `;
    const values = [date];
    const result = await db.query(query, values);
    return result.rows;
  }

  // Обновление расписания
  static async update(id, data) {
    const { title, date, time, nop } = data;
    
    const query = `
      UPDATE schedule 
      SET title = $1, scheduledate = $2, scheduletime = $3, nop = $4
      WHERE scheduleid = $5
      RETURNING *
    `;
    const values = [title, date, time, nop, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Удаление расписания
  static async delete(id) {
    const query = 'DELETE FROM schedule WHERE scheduleid = $1';
    await db.query(query, [id]);
    return true;
  }
}

module.exports = Schedule;