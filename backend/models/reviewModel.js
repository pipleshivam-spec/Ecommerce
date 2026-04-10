const { pool } = require('../config/db');

class Review {
  // Create review
  static async create(productId, userId, orderId, rating, title, comment, images = []) {
    const query = `
      INSERT INTO reviews (
        product_id, user_id, order_id, rating, title, comment, images, is_verified_purchase
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const isVerified = orderId ? 1 : 0;
    const result = await pool.query(query, [
      productId, userId, orderId, rating, title, comment, images, isVerified
    ]);
    
    if (result.lastID) {
      const selectQuery = 'SELECT * FROM reviews WHERE id = ?';
      const revResult = await pool.query(selectQuery, [result.lastID]);
      return revResult.rows[0];
    }
    return null;
  }

  // Get product reviews
  static async getByProduct(productId, limit = 10, offset = 0) {
    const query = `
      SELECT 
        r.*,
        u.name as user_name,
        u.avatar_url as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.is_approved = 1
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const result = await pool.query(query, [productId, limit, offset]);
    return result.rows;
  }

  // Get review by ID
  static async getById(id) {
    const query = 'SELECT * FROM reviews WHERE id = ?';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update review
  static async update(id, rating, title, comment, images) {
    const query = `
      UPDATE reviews 
      SET rating = ?, title = ?, comment = ?, images = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await pool.query(query, [rating, title, comment, images, id]);
    
    const selectQuery = 'SELECT * FROM reviews WHERE id = ?';
    const revResult = await pool.query(selectQuery, [id]);
    return revResult.rows[0];
  }

  // Delete review
  static async delete(id) {
    const query = 'DELETE FROM reviews WHERE id = ?';
    await pool.query(query, [id]);
  }

  // Update product rating
  static async updateProductRating(productId) {
    const query = `
      UPDATE products 
      SET 
        rating = (
          SELECT COALESCE(AVG(rating), 0) 
          FROM reviews 
          WHERE product_id = ? AND is_approved = 1
        ),
        reviews_count = (
          SELECT COUNT(*) 
          FROM reviews 
          WHERE product_id = ? AND is_approved = 1
        )
      WHERE id = ?
    `;
    await pool.query(query, [productId, productId, productId]);
  }

  // Mark review as helpful
  static async markHelpful(id) {
    const query = `
      UPDATE reviews 
      SET helpful_count = helpful_count + 1 
      WHERE id = ?
    `;
    await pool.query(query, [id]);
    
    const selectQuery = 'SELECT helpful_count FROM reviews WHERE id = ?';
    const result = await pool.query(selectQuery, [id]);
    return result.rows[0];
  }

  // Check if user can review product
  static async canUserReview(userId, productId) {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = ? 
        AND oi.product_id = ? 
        AND o.status = 'delivered'
      ) as can_review
    `;
    const result = await pool.query(query, [userId, productId]);
    return result.rows[0] && result.rows[0].can_review;
  }

  // Check if user already reviewed
  static async hasUserReviewed(userId, productId) {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM reviews 
        WHERE user_id = ? AND product_id = ?
      ) as has_reviewed
    `;
    const result = await pool.query(query, [userId, productId]);
    return result.rows[0] && result.rows[0].has_reviewed;
  }

  // Get review count by product
  static async getCountByProduct(productId) {
    const query = `
      SELECT COUNT(*) as count 
      FROM reviews 
      WHERE product_id = ? AND is_approved = 1
    `;
    const result = await pool.query(query, [productId]);
    return parseInt(result.rows[0].count) || 0;
  }

  // Get rating distribution
  static async getRatingDistribution(productId) {
    const query = `
      SELECT 
        rating,
        COUNT(*) as count
      FROM reviews
      WHERE product_id = ? AND is_approved = 1
      GROUP BY rating
      ORDER BY rating DESC
    `;
    const result = await pool.query(query, [productId]);
    return result.rows;
  }
}

module.exports = Review;
