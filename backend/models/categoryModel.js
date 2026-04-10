const { pool } = require('../config/db');

class Category {
  // Create new category
  static async create(name, description = '') {
    const query = `
      INSERT INTO categories (name, description)
      VALUES (?, ?)
    `;
    const result = await pool.query(query, [name, description]);
    
    if (result.lastID) {
      const selectQuery = 'SELECT * FROM categories WHERE id = ?';
      const catResult = await pool.query(selectQuery, [result.lastID]);
      return catResult.rows[0];
    }
    return null;
  }

  // Get all categories with product count
  static async getAll() {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.created_at,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category = c.name
      GROUP BY c.id, c.name, c.description, c.created_at
      ORDER BY c.name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get category by ID
  static async findById(id) {
    const query = 'SELECT * FROM categories WHERE id = ?';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get category by name
  static async findByName(name) {
    const query = 'SELECT * FROM categories WHERE name = ?';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  // Update category
  static async update(id, name, description = '') {
    const query = `
      UPDATE categories 
      SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await pool.query(query, [name, description, id]);
    
    const selectQuery = 'SELECT * FROM categories WHERE id = ?';
    const catResult = await pool.query(selectQuery, [id]);
    return catResult.rows[0];
  }

  // Delete category
  static async delete(id) {
    const query = 'DELETE FROM categories WHERE id = ?';
    await pool.query(query, [id]);
  }
}

module.exports = Category;
