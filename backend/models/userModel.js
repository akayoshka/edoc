const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async createWebUser(email, usertype) {
    const query = 'INSERT INTO webuser (email, usertype) VALUES ($1, $2) RETURNING *';
    const values = [email, usertype];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM webuser WHERE email = $1';
    const values = [email];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async exists(email) {
    const user = await this.findByEmail(email);
    return !!user;
  }
}

module.exports = User;