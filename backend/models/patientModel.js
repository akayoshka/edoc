const db = require('../config/db');
const bcrypt = require('bcrypt');
const User = require('./userModel');

class Patient {
  // Создание нового пациента
  static async create(email, name, password, address, nic, dob, tel) {
    // Сначала создаем запись в таблице webuser
    await User.createWebUser(email, 'p');
    
    // Хешируем пароль перед сохранением
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создаем запись пациента
    const query = `
      INSERT INTO patient (pemail, pname, ppassword, paddress, pnic, pdob, ptel) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const values = [email, name, hashedPassword, address, nic, dob, tel];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Поиск пациента по email
  static async findByEmail(email) {
    const query = 'SELECT * FROM patient WHERE pemail = $1';
    const values = [email];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Поиск пациента по ID
  static async findById(id) {
    const query = 'SELECT * FROM patient WHERE pid = $1';
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Получение всех пациентов
  static async findAll() {
    const query = 'SELECT * FROM patient';
    const result = await db.query(query);
    return result.rows;
  }

  // Проверка пароля пациента
  static async checkPassword(email, password) {
    const patient = await this.findByEmail(email);
    if (!patient) return false;
    
    // В существующей базе данных пароли хранятся в открытом виде
    if (patient.ppassword === password) return true;
    
    try {
      return await bcrypt.compare(password, patient.ppassword);
    } catch (error) {
      return false;
    }
  }

  // Обновление данных пациента
  static async update(id, data) {
    const { name, address, nic, tel } = data;
    
    const query = `
      UPDATE patient 
      SET pname = $1, paddress = $2, pnic = $3, ptel = $4
      WHERE pid = $5
      RETURNING *
    `;
    const values = [name, address, nic, tel, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Удаление пациента
  static async delete(id) {
    // Получаем email пациента перед удалением
    const patient = await this.findById(id);
    if (!patient) return false;
    
    // Удаляем запись из таблицы patient
    const query1 = 'DELETE FROM patient WHERE pid = $1';
    await db.query(query1, [id]);
    
    // Удаляем запись из таблицы webuser
    const query2 = 'DELETE FROM webuser WHERE email = $1';
    await db.query(query2, [patient.pemail]);
    
    return true;
  }
}

module.exports = Patient;