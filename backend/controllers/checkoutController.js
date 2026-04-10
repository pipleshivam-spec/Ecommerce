const { pool } = require('../config/db');

class CheckoutController {
  // Process checkout and create order
  async processCheckout(req, res) {
    const client = await pool.connect();
    
    try {
      const userId = req.user.id;
      const { shipping_address, payment_method, notes } = req.body;

      // Validate shipping address
      if (!shipping_address || !shipping_address.name || !shipping_address.phone || 
          !shipping_address.address_line1 || !shipping_address.city || 
          !shipping_address.state || !shipping_address.postal_code) {
        return res.status(400).json({
          success: false,
          message: 'Complete shipping address is required'
        });
      }

      await client.query('BEGIN');

      // Get cart items
      const cartResult = await client.query(
        'SELECT id FROM cart WHERE user_id = $1',
        [userId]
      );

      if (cartResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      const cartId = cartResult.rows[0].id;

      // Get cart items with product details
      const cartItems = await client.query(`
        SELECT 
          ci.id,
          ci.product_id,
          ci.quantity,
          ci.price,
          p.name,
          p.thumbnail,
          p.sku,
          p.stock,
          p.is_active
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
      `, [cartId]);

      if (cartItems.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

      // Validate stock availability
      for (const item of cartItems.rows) {
        if (!item.is_active) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Product "${item.name}" is no longer available`
          });
        }

        if (item.stock < item.quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${item.name}". Only ${item.stock} available`
          });
        }
      }

      // Calculate totals
      const subtotal = cartItems.rows.reduce((sum, item) => 
        sum + (parseFloat(item.price) * item.quantity), 0
      );
      
      const shippingAmount = subtotal > 500 ? 0 : 50;
      const taxAmount = subtotal * 0.18; // 18% GST
      const totalAmount = subtotal + shippingAmount + taxAmount;

      // Generate order number
      const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create order
      const orderResult = await client.query(`
        INSERT INTO orders (
          order_number,
          user_id,
          subtotal,
          shipping_amount,
          tax_amount,
          total_amount,
          status,
          payment_status,
          shipping_name,
          shipping_phone,
          shipping_address_line1,
          shipping_address_line2,
          shipping_city,
          shipping_state,
          shipping_postal_code,
          shipping_country,
          notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id, order_number, total_amount
      `, [
        orderNumber,
        userId,
        subtotal,
        shippingAmount,
        taxAmount,
        totalAmount,
        'pending',
        'pending',
        shipping_address.name,
        shipping_address.phone,
        shipping_address.address_line1,
        shipping_address.address_line2 || null,
        shipping_address.city,
        shipping_address.state,
        shipping_address.postal_code,
        shipping_address.country || 'India',
        notes || null
      ]);

      const order = orderResult.rows[0];

      // Create order items and update stock
      for (const item of cartItems.rows) {
        // Insert order item
        await client.query(`
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            product_image,
            product_sku,
            quantity,
            price,
            total
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          order.id,
          item.product_id,
          item.name,
          item.thumbnail,
          item.sku,
          item.quantity,
          item.price,
          item.price * item.quantity
        ]);

        // Update product stock
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // Clear cart
      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          order_id: order.id,
          order_number: order.order_number,
          total_amount: parseFloat(order.total_amount).toFixed(2),
          payment_required: true
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Checkout error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process checkout'
      });
    } finally {
      client.release();
    }
  }

  // Get order details
  async getOrderDetails(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      // Get order
      const orderResult = await pool.query(`
        SELECT 
          o.*,
          u.name as user_name,
          u.email as user_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = $1 AND o.user_id = $2
      `, [orderId, userId]);

      if (orderResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const order = orderResult.rows[0];

      // Get order items
      const itemsResult = await pool.query(`
        SELECT * FROM order_items WHERE order_id = $1
      `, [orderId]);

      res.status(200).json({
        success: true,
        data: {
          order: {
            ...order,
            items: itemsResult.rows
          }
        }
      });

    } catch (error) {
      console.error('Get order details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order details'
      });
    }
  }

  // Get user orders
  async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Get orders with pagination
      const ordersResult = await pool.query(`
        SELECT 
          o.id,
          o.order_number,
          o.total_amount,
          o.status,
          o.payment_status,
          o.created_at,
          COUNT(oi.id) as items_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      // Get total count
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM orders WHERE user_id = $1',
        [userId]
      );

      const totalOrders = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalOrders / limit);

      res.status(200).json({
        success: true,
        data: {
          orders: ordersResult.rows,
          pagination: {
            current_page: parseInt(page),
            total_pages: totalPages,
            total_orders: totalOrders,
            per_page: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  }

  // Cancel order
  async cancelOrder(req, res) {
    const client = await pool.connect();

    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      await client.query('BEGIN');

      // Get order
      const orderResult = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
        [orderId, userId]
      );

      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const order = orderResult.rows[0];

      // Check if order can be cancelled
      if (!['pending', 'confirmed'].includes(order.status)) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Order cannot be cancelled at this stage'
        });
      }

      // Get order items
      const itemsResult = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [orderId]
      );

      // Restore stock
      for (const item of itemsResult.rows) {
        await client.query(
          'UPDATE products SET stock = stock + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // Update order status
      await client.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['cancelled', orderId]
      );

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Cancel order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel order'
      });
    } finally {
      client.release();
    }
  }
}

module.exports = new CheckoutController();
