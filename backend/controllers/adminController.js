const { pool } = require('../config/db');

class AdminController {
  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      // Total users
      const usersResult = await pool.query(
        "SELECT COUNT(*) as total FROM users WHERE role = 'customer'"
      );

      // Total products
      const productsResult = await pool.query(
        'SELECT COUNT(*) as total FROM products WHERE is_active = true'
      );

      // Total categories
      const categoriesResult = await pool.query(
        'SELECT COUNT(*) as total FROM categories'
      );

      // Total orders
      const ordersResult = await pool.query(
        'SELECT COUNT(*) as total FROM orders'
      );

      // Total revenue
      const revenueResult = await pool.query(
        "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'paid'"
      );

      // Recent orders with user details
      const recentOrdersResult = await pool.query(`
        SELECT 
          o.id,
          o.order_number,
          o.total_amount,
          o.status,
          o.payment_status,
          o.created_at,
          u.name as user_name,
          u.email as user_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 5
      `);

      res.status(200).json({
        success: true,
        data: {
          totalUsers: parseInt(usersResult.rows[0].total),
          totalProducts: parseInt(productsResult.rows[0].total),
          totalCategories: parseInt(categoriesResult.rows[0].total),
          totalOrders: parseInt(ordersResult.rows[0].total),
          totalRevenue: parseFloat(revenueResult.rows[0].total),
          recentOrders: recentOrdersResult.rows
        }
      });

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  }

  // Get revenue data
  async getRevenueData(req, res) {
    try {
      const { period = 'month' } = req.query;

      let query = '';
      let groupBy = '';

      switch (period) {
        case 'week':
          query = `
            SELECT 
              TO_CHAR(created_at, 'Day') as label,
              DATE_TRUNC('day', created_at) as date,
              COALESCE(SUM(total_amount), 0) as revenue,
              COUNT(*) as orders
            FROM orders
            WHERE payment_status = 'paid'
            AND created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE_TRUNC('day', created_at), TO_CHAR(created_at, 'Day')
            ORDER BY date
          `;
          break;

        case 'year':
          query = `
            SELECT 
              TO_CHAR(created_at, 'Month') as label,
              DATE_TRUNC('month', created_at) as date,
              COALESCE(SUM(total_amount), 0) as revenue,
              COUNT(*) as orders
            FROM orders
            WHERE payment_status = 'paid'
            AND created_at >= NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'Month')
            ORDER BY date
          `;
          break;

        default: // month
          query = `
            SELECT 
              EXTRACT(DAY FROM created_at)::text as label,
              DATE_TRUNC('day', created_at) as date,
              COALESCE(SUM(total_amount), 0) as revenue,
              COUNT(*) as orders
            FROM orders
            WHERE payment_status = 'paid'
            AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY DATE_TRUNC('day', created_at), EXTRACT(DAY FROM created_at)
            ORDER BY date
          `;
      }

      const result = await pool.query(query);

      res.status(200).json({
        success: true,
        data: result.rows.map(row => ({
          label: row.label.trim(),
          revenue: parseFloat(row.revenue).toFixed(2),
          orders: parseInt(row.orders)
        }))
      });

    } catch (error) {
      console.error('Get revenue data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch revenue data'
      });
    }
  }

  // Get top products
  async getTopProducts(req, res) {
    try {
      const { limit = 10 } = req.query;

      const query = `
        SELECT 
          p.id,
          p.name,
          p.thumbnail,
          p.price,
          COALESCE(SUM(oi.quantity), 0) as total_sold,
          COALESCE(SUM(oi.total), 0) as total_revenue
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id
        WHERE o.payment_status = 'paid' OR o.payment_status IS NULL
        GROUP BY p.id, p.name, p.thumbnail, p.price
        ORDER BY total_sold DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);

      res.status(200).json({
        success: true,
        data: result.rows.map(row => ({
          ...row,
          total_sold: parseInt(row.total_sold),
          total_revenue: parseFloat(row.total_revenue).toFixed(2)
        }))
      });

    } catch (error) {
      console.error('Get top products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch top products'
      });
    }
  }

  // Get recent orders
  async getRecentOrders(req, res) {
    try {
      const { limit = 10 } = req.query;

      const query = `
        SELECT 
          o.id,
          o.order_number,
          o.total_amount,
          o.status,
          o.payment_status,
          o.created_at,
          u.name as customer_name,
          u.email as customer_email,
          COUNT(oi.id) as items_count
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id, u.name, u.email
        ORDER BY o.created_at DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);

      res.status(200).json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Get recent orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent orders'
      });
    }
  }

  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, role } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          id, name, email, phone, role, email_verified, is_active, created_at
        FROM users
        WHERE 1=1
      `;

      const queryParams = [];
      let paramIndex = 1;

      if (role) {
        query += ` AND role = $${paramIndex}`;
        queryParams.push(role);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limit, offset);

      const result = await pool.query(query, queryParams);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
      const countParams = [];

      if (role) {
        countQuery += ' AND role = $1';
        countParams.push(role);
      }

      const countResult = await pool.query(countQuery, countParams);
      const totalUsers = parseInt(countResult.rows[0].count);

      res.status(200).json({
        success: true,
        data: {
          users: result.rows,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(totalUsers / limit),
            total_users: totalUsers,
            per_page: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  // Update user status
  async updateUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { is_active } = req.body;

      if (typeof is_active !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'is_active must be a boolean'
        });
      }

      await pool.query(
        'UPDATE users SET is_active = $1 WHERE id = $2',
        [is_active, userId]
      );

      res.status(200).json({
        success: true,
        message: 'User status updated successfully'
      });

    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status'
      });
    }
  }

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order status'
        });
      }

      await pool.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, orderId]
      );

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully'
      });

    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
  }
}

module.exports = new AdminController();
