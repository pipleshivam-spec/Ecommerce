const { pool } = require('../config/db');

class MockPaymentController {
  // Create mock order (no Razorpay needed)
  async createOrder(req, res) {
    try {
      const userId = req.user.id;
      const { order_id } = req.body;

      if (!order_id) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      // Get order details
      const orderResult = await pool.query(
        'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
        [order_id, userId]
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const order = orderResult.rows[0];

      // Create mock payment record
      const mockPaymentId = `mock_${Date.now()}`;
      
      await pool.query(`
        INSERT INTO payments (
          order_id,
          payment_id,
          payment_method,
          amount,
          currency,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        order.id,
        mockPaymentId,
        'mock_payment',
        order.total_amount,
        'INR',
        'pending'
      ]);

      res.status(200).json({
        success: true,
        message: 'Mock payment order created',
        data: {
          order_id: mockPaymentId,
          amount: Math.round(parseFloat(order.total_amount) * 100),
          currency: 'INR',
          mock_mode: true
        }
      });

    } catch (error) {
      console.error('Create mock order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment order'
      });
    }
  }

  // Verify mock payment (always succeeds)
  async verifyPayment(req, res) {
    const client = await pool.connect();

    try {
      const userId = req.user.id;
      const { payment_id } = req.body;

      if (!payment_id) {
        return res.status(400).json({
          success: false,
          message: 'Payment ID is required'
        });
      }

      await client.query('BEGIN');

      // Get payment record
      const paymentResult = await client.query(
        'SELECT * FROM payments WHERE payment_id = $1',
        [payment_id]
      );

      if (paymentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Payment record not found'
        });
      }

      const payment = paymentResult.rows[0];

      // Update payment status to success
      await client.query(`
        UPDATE payments 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, ['success', payment.id]);

      // Update order status
      await client.query(`
        UPDATE orders 
        SET payment_status = $1, status = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, ['paid', 'confirmed', payment.order_id]);

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully (DEMO MODE)',
        data: {
          order_id: payment.order_id,
          payment_id: payment_id,
          mock_mode: true
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Verify mock payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment'
      });
    } finally {
      client.release();
    }
  }
}

module.exports = new MockPaymentController();
