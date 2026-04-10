const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  // Create new user
  static async create(name, email, password, phone, role = 'customer') {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (name, email, password, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [name, email, hashedPassword, phone, role];
    const result = await pool.query(query, values);
    
    // Fetch the created user by ID
    if (result.lastID) {
      const selectQuery = 'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?';
      const userResult = await pool.query(selectQuery, [result.lastID]);
      return userResult.rows[0];
    }
    return null;
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get all users
  static async getAll() {
    const query = 'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Update user
  static async update(id, name, email, phone) {
    const query = `
      UPDATE users 
      SET name = ?, email = ?, phone = ?
      WHERE id = ?
    `;
    const values = [name, email, phone, id];
    await pool.query(query, values);
    
    // Fetch the updated user
    const selectQuery = 'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?';
    const userResult = await pool.query(selectQuery, [id]);
    return userResult.rows[0];
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    await pool.query(query, [id]);
  }

  // Compare password
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Count total users
  static async count() {
    const query = 'SELECT COUNT(*) as total FROM users';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }
}

module.exports = User;
