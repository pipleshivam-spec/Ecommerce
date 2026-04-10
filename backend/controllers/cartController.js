const { pool } = require('../config/db');

class CartController {
  // Get user's cart
  async getCart(req, res) {
    try {
      const userId = req.user.id;

      // Get or create cart
      let cart = await pool.query(
        'SELECT * FROM cart WHERE user_id = $1',
        [userId]
      );

      if (cart.rows.length === 0) {
        // Create new cart
        cart = await pool.query(
          'INSERT INTO cart (user_id) VALUES ($1) RETURNING *',
          [userId]
        );
      }

      const cartId = cart.rows[0].id;

      // Get cart items with product details
      const cartItems = await pool.query(`
        SELECT 
          ci.id,
          ci.quantity,
          ci.price,
          p.id as product_id,
          p.name,
          p.slug,
          p.thumbnail,
          p.stock,
          p.is_active,
          (ci.quantity * ci.price) as subtotal
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
        ORDER BY ci.created_at DESC
      `, [cartId]);

      // Calculate totals
      const subtotal = cartItems.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
      const shippingFee = subtotal > 500 ? 0 : 50;
      const total = subtotal + shippingFee;

      res.status(200).json({
        success: true,
        data: {
          cart_id: cartId,
          items: cartItems.rows,
          summary: {
            items_count: cartItems.rows.length,
            subtotal: subtotal.toFixed(2),
            shipping: shippingFee.toFixed(2),
            total: total.toFixed(2)
          }
        }
      });
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cart'
      });
    }
  }

  // Add item to cart
  async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const { product_id, quantity = 1 } = req.body;

      // Validate input
      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }

      // Check if product exists and is active
      const product = await pool.query(
        'SELECT id, name, price, stock, is_active FROM products WHERE id = $1',
        [product_id]
      );

      if (product.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const productData = product.rows[0];

      if (!productData.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Product is not available'
        });
      }

      if (productData.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${productData.stock} items available in stock`
        });
      }

      // Get or create cart
      let cart = await pool.query(
        'SELECT id FROM cart WHERE user_id = $1',
        [userId]
      );

      let cartId;
      if (cart.rows.length === 0) {
        const newCart = await pool.query(
          'INSERT INTO cart (user_id) VALUES ($1) RETURNING id',
          [userId]
        );
        cartId = newCart.rows[0].id;
      } else {
        cartId = cart.rows[0].id;
      }

      // Check if item already exists in cart
      const existingItem = await pool.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, product_id]
      );

      if (existingItem.rows.length > 0) {
        // Update quantity
        const newQuantity = existingItem.rows[0].quantity + quantity;

        if (productData.stock < newQuantity) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more. Only ${productData.stock} items available`
          });
        }

        await pool.query(
          'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newQuantity, existingItem.rows[0].id]
        );

        res.status(200).json({
          success: true,
          message: 'Cart updated successfully'
        });
      } else {
        // Add new item
        await pool.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [cartId, product_id, quantity, productData.price]
        );

        res.status(201).json({
          success: true,
          message: 'Item added to cart successfully'
        });
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add item to cart'
      });
    }
  }

  // Update cart item quantity
  async updateCartItem(req, res) {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Valid quantity is required'
        });
      }

      // Verify item belongs to user's cart
      const item = await pool.query(`
        SELECT ci.id, ci.product_id, p.stock, p.is_active
        FROM cart_items ci
        JOIN cart c ON ci.cart_id = c.id
        JOIN products p ON ci.product_id = p.id
        WHERE ci.id = $1 AND c.user_id = $2
      `, [itemId, userId]);

      if (item.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      const itemData = item.rows[0];

      if (!itemData.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Product is no longer available'
        });
      }

      if (itemData.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${itemData.stock} items available in stock`
        });
      }

      // Update quantity
      await pool.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantity, itemId]
      );

      res.status(200).json({
        success: true,
        message: 'Cart item updated successfully'
      });
    } catch (error) {
      console.error('Update cart item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update cart item'
      });
    }
  }

  // Remove item from cart
  async removeFromCart(req, res) {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;

      // Verify item belongs to user's cart
      const result = await pool.query(`
        DELETE FROM cart_items ci
        USING cart c
        WHERE ci.cart_id = c.id 
        AND ci.id = $1 
        AND c.user_id = $2
        RETURNING ci.id
      `, [itemId, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Item removed from cart successfully'
      });
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove item from cart'
      });
    }
  }

  // Clear entire cart
  async clearCart(req, res) {
    try {
      const userId = req.user.id;

      // Get cart ID
      const cart = await pool.query(
        'SELECT id FROM cart WHERE user_id = $1',
        [userId]
      );

      if (cart.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      // Delete all cart items
      await pool.query(
        'DELETE FROM cart_items WHERE cart_id = $1',
        [cart.rows[0].id]
      );

      res.status(200).json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cart'
      });
    }
  }

  // Get cart items count
  async getCartCount(req, res) {
    try {
      const userId = req.user.id;

      const result = await pool.query(`
        SELECT COALESCE(SUM(ci.quantity), 0) as count
        FROM cart c
        LEFT JOIN cart_items ci ON c.id = ci.cart_id
        WHERE c.user_id = $1
      `, [userId]);

      res.status(200).json({
        success: true,
        data: {
          count: parseInt(result.rows[0].count)
        }
      });
    } catch (error) {
      console.error('Get cart count error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cart count'
      });
    }
  }
}

module.exports = new CartController();
