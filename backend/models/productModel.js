const { pool } = require('../config/db');

class Product {
  // Create new product
  static async create(name, price, categoryId, description, imageUrl, stock, rating = 0, reviews = 0, badge = null) {
    const query = `
      INSERT INTO products (name, price, category_id, description, image_url, stock, rating, reviews, badge)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [name, price, categoryId, description, imageUrl, stock, rating, reviews, badge];
    const result = await pool.query(query, values);
    
    if (result.lastID) {
      const selectQuery = 'SELECT * FROM products WHERE id = ?';
      const prodResult = await pool.query(selectQuery, [result.lastID]);
      return prodResult.rows[0];
    }
    return null;
  }

  // Get all products with category name
  static async getAll() {
    const query = `
      SELECT p.*, c.category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get product by ID
  static async findById(id) {
    const query = `
      SELECT p.*, c.category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get products by category
  static async getByCategory(categoryId) {
    const query = `
      SELECT p.*, c.category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ?
      ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query, [categoryId]);
    return result.rows;
  }

  // Update product
  static async update(id, name, price, categoryId, description, imageUrl, stock, rating, reviews, badge) {
    const query = `
      UPDATE products 
      SET name = ?, price = ?, category_id = ?, description = ?, 
          image_url = ?, stock = ?, rating = ?, reviews = ?, badge = ?
      WHERE id = ?
    `;
    const values = [name, price, categoryId, description, imageUrl, stock, rating, reviews, badge, id];
    await pool.query(query, values);
    
    const selectQuery = 'SELECT * FROM products WHERE id = ?';
    const prodResult = await pool.query(selectQuery, [id]);
    return prodResult.rows[0];
  }

  // Delete product
  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = ?';
    await pool.query(query, [id]);
  }

  // Update stock
  static async updateStock(id, quantity) {
    const query = 'UPDATE products SET stock = stock - ? WHERE id = ?';
    await pool.query(query, [quantity, id]);
    
    const selectQuery = 'SELECT * FROM products WHERE id = ?';
    const result = await pool.query(selectQuery, [id]);
    return result.rows[0];
  }

  // Search products
  static async search(searchTerm) {
    const query = `
      SELECT p.*, c.category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.name LIKE ? OR p.description LIKE ?
      ORDER BY p.created_at DESC
    `;
    const searchPattern = `%${searchTerm}%`;
    const result = await pool.query(query, [searchPattern, searchPattern]);
    return result.rows;
  }

  // Count total products
  static async count() {
    const query = 'SELECT COUNT(*) as total FROM products';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }
}

module.exports = Product;
