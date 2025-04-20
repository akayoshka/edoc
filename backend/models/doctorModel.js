const db = require('../config/db');
const bcrypt = require('bcrypt');
const User = require('./userModel');

class Doctor {
  static async create(email, name, password, nic, tel, specialtyId) {

    await User.createWebUser(email, 'd');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO doctor (docemail, docname, docpassword, docnic, doctel, specialties) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    const values = [email, name, hashedPassword, nic, tel, specialtyId];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT d.*, s.sname as specialty_name 
      FROM doctor d 
      LEFT JOIN specialties s ON d.specialties = s.id 
      WHERE d.docemail = $1
    `;
    const values = [email];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT d.*, s.sname as specialty_name 
      FROM doctor d 
      LEFT JOIN specialties s ON d.specialties = s.id 
      WHERE d.docid = $1
    `;
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT d.*, s.sname as specialty_name 
      FROM doctor d 
      LEFT JOIN specialties s ON d.specialties = s.id
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async checkPassword(email, password) {
    const doctor = await this.findByEmail(email);
    if (!doctor) return false;
    
    if (doctor.docpassword === password) return true;
    
    try {
      return await bcrypt.compare(password, doctor.docpassword);
    } catch (error) {
      return false;
    }
  }

  static async update(id, data) {
    const { name, nic, tel, specialtyId } = data;
    
    const query = `
      UPDATE doctor 
      SET docname = $1, docnic = $2, doctel = $3, specialties = $4
      WHERE docid = $5
      RETURNING *
    `;
    const values = [name, nic, tel, specialtyId, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const doctor = await this.findById(id);
    if (!doctor) return false;
    
    const query1 = 'DELETE FROM doctor WHERE docid = $1';
    await db.query(query1, [id]);
    
    const query2 = 'DELETE FROM webuser WHERE email = $1';
    await db.query(query2, [doctor.docemail]);
    
    return true;
  }
}

module.exports = Doctor;