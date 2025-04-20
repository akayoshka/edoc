const db = require('../config/db');
const bcrypt = require('bcrypt');
const User = require('./userModel');

class Admin {
  static async create(email, password) {
    await User.createWebUser(email, 'a');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = 'INSERT INTO admin (aemail, apassword) VALUES ($1, $2) RETURNING *';
    const values = [email, hashedPassword];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM admin WHERE aemail = $1';
    const values = [email];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async checkPassword(email, password) {
    const admin = await this.findByEmail(email);
    if (!admin) return false;
    
    if (admin.apassword === password) return true;
    
    try {
      return await bcrypt.compare(password, admin.apassword);
    } catch (error) {
      return false;
    }
  }
}

module.exports = Admin;