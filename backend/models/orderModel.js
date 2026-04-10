const { pool } = require('../config/db');

class Order {
  // Create new order with items
  static async create(userId, totalPrice, status, shippingAddress, items) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert order
      const orderQuery = `
        INSERT INTO orders (user_id, total_price, status, shipping_address)
        VALUES (?, ?, ?, ?)
      `;
      const orderResult = await client.query(orderQuery, [userId, totalPrice, status, shippingAddress]);
      
      // Fetch the created order
      const selectOrderQuery = 'SELECT * FROM orders WHERE id = ?';
      const fetchedOrder = await client.query(selectOrderQuery, [orderResult.lastID]);
      const order = fetchedOrder.rows[0];

      // Insert order items
      for (const item of items) {
        const itemQuery = `
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `;
        await client.query(itemQuery, [order.id, item.product_id, item.quantity, item.price]);

        // Update product stock
        await client.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
      }

      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all orders with user details
  static async getAll() {
    const query = `
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get order by ID with items
  static async findById(id) {
    const orderQuery = `
      SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `;
    const orderResult = await pool.query(orderQuery, [id]);
    const order = orderResult.rows[0];

    if (!order) return null;

    // Get order items
    const itemsQuery = `
      SELECT oi.*, p.name as product_name, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;
    const itemsResult = await pool.query(itemsQuery, [id]);
    order.items = itemsResult.rows;

    return order;
  }

  // Get orders by user ID
  static async getByUserId(userId) {
    const query = `
      SELECT o.*
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    
    // Get items for each order
    for (let order of result.rows) {
      const itemsQuery = `
        SELECT oi.*, p.name as product_name, p.image_url
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `;
      const itemsResult = await pool.query(itemsQuery, [order.id]);
      order.items = itemsResult.rows;
    }

    return result.rows;
  }

  // Update order status
  static async updateStatus(id, status) {
    const query = `
      UPDATE orders 
      SET status = ?
      WHERE id = ?
    `;
    await pool.query(query, [status, id]);
    
    const selectQuery = 'SELECT * FROM orders WHERE id = ?';
    const result = await pool.query(selectQuery, [id]);
    return result.rows[0];
  }

  // Delete order
  static async delete(id) {
    const query = 'DELETE FROM orders WHERE id = ?';
    await pool.query(query, [id]);
  }

  // Get total revenue
  static async getTotalRevenue() {
    const query = 'SELECT SUM(total_price) as revenue FROM orders WHERE status = ?';
    const result = await pool.query(query, ['Delivered']);
    return parseFloat(result.rows[0].revenue) || 0;
  }

  // Count total orders
  static async count() {
    const query = 'SELECT COUNT(*) as total FROM orders';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }

  // Get recent orders
  static async getRecent(limit = 10) {
    const query = `
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT ?
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

module.exports = Order;
