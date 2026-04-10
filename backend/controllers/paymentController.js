const { pool } = require('../config/db');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

class PaymentController {
  // Create Razorpay order
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

      // Check if order is already paid
      if (order.payment_status === 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Order is already paid'
        });
      }

      // Create Razorpay order
      const amount = Math.round(parseFloat(order.total_amount) * 100); // Convert to paise
      
      const razorpayOrder = await razorpay.orders.create({
        amount: amount,
        currency: 'INR',
        receipt: order.order_number,
        notes: {
          order_id: order.id,
          user_id: userId
        }
      });

      // Store payment record
      await pool.query(`
        INSERT INTO payments (
          order_id,
          payment_id,
          payment_method,
          amount,
          currency,
          status,
          razorpay_order_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        order.id,
        razorpayOrder.id,
        'razorpay',
        order.total_amount,
        'INR',
        'pending',
        razorpayOrder.id
      ]);

      res.status(200).json({
        success: true,
        data: {
          order_id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key_id: process.env.RAZORPAY_KEY_ID
        }
      });

    } catch (error) {
      console.error('Create Razorpay order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment order'
      });
    }
  }

  // Verify Razorpay payment
  async verifyPayment(req, res) {
    const client = await pool.connect();

    try {
      const userId = req.user.id;
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing payment verification details'
        });
      }

      // Verify signature
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');

      if (razorpay_signature !== expectedSign) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

      await client.query('BEGIN');

      // Get payment record
      const paymentResult = await client.query(
        'SELECT * FROM payments WHERE razorpay_order_id = $1',
        [razorpay_order_id]
      );

      if (paymentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Payment record not found'
        });
      }

      const payment = paymentResult.rows[0];

      // Update payment record
      await client.query(`
        UPDATE payments 
        SET 
          status = $1,
          razorpay_payment_id = $2,
          razorpay_signature = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `, ['success', razorpay_payment_id, razorpay_signature, payment.id]);

      // Update order status
      await client.query(`
        UPDATE orders 
        SET 
          payment_status = $1,
          status = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, ['paid', 'confirmed', payment.order_id]);

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          order_id: payment.order_id,
          payment_id: razorpay_payment_id
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Verify payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment'
      });
    } finally {
      client.release();
    }
  }

  // Handle payment failure
  async handlePaymentFailure(req, res) {
    try {
      const { order_id, error } = req.body;

      if (!order_id) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      // Update payment status
      await pool.query(`
        UPDATE payments 
        SET 
          status = $1,
          error_message = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE razorpay_order_id = $3
      `, ['failed', error?.description || 'Payment failed', order_id]);

      res.status(200).json({
        success: true,
        message: 'Payment failure recorded'
      });

    } catch (error) {
      console.error('Handle payment failure error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record payment failure'
      });
    }
  }

  // Get payment details
  async getPaymentDetails(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const result = await pool.query(`
        SELECT 
          p.*,
          o.order_number,
          o.total_amount as order_amount
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        WHERE p.order_id = $1 AND o.user_id = $2
      `, [orderId, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Payment details not found'
        });
      }

      res.status(200).json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Get payment details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment details'
      });
    }
  }
}

module.exports = new PaymentController();
