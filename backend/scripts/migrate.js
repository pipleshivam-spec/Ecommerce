const { pool } = require('../config/db');

async function migrateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migration...');
    await client.query('BEGIN');

    // Check if order_number column exists
    const checkOrderNumber = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='orders' AND column_name='order_number'
    `);

    if (checkOrderNumber.rows.length === 0) {
      console.log('Adding order_number column to orders table...');
      await client.query(`
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS order_number VARCHAR(50) UNIQUE
      `);
      
      // Generate order numbers for existing orders
      await client.query(`
        UPDATE orders 
        SET order_number = 'ORD' || id || EXTRACT(EPOCH FROM created_at)::bigint
        WHERE order_number IS NULL
      `);
      
      await client.query(`
        ALTER TABLE orders 
        ALTER COLUMN order_number SET NOT NULL
      `);
    }

    // Add missing columns to orders table
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS shipping_amount NUMERIC(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
      ADD COLUMN IF NOT EXISTS shipping_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS shipping_address_line1 TEXT,
      ADD COLUMN IF NOT EXISTS shipping_address_line2 TEXT,
      ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(20),
      ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(100) DEFAULT 'India',
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // Update total_amount from total_price if exists
    const checkTotalPrice = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='orders' AND column_name='total_price'
    `);

    if (checkTotalPrice.rows.length > 0) {
      await client.query(`
        UPDATE orders 
        SET total_amount = total_price, subtotal = total_price
        WHERE total_amount IS NULL
      `);
    }

    // Add missing columns to users table
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // Add missing columns to products table
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS category VARCHAR(100),
      ADD COLUMN IF NOT EXISTS thumbnail TEXT,
      ADD COLUMN IF NOT EXISTS images TEXT[],
      ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // Update thumbnail from image_url if exists
    const checkImageUrl = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='image_url'
    `);

    if (checkImageUrl.rows.length > 0) {
      await client.query(`
        UPDATE products 
        SET thumbnail = image_url
        WHERE thumbnail IS NULL AND image_url IS NOT NULL
      `);
    }

    // Add missing columns to categories table
    await client.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // Copy category_name to name if exists
    const checkCategoryName = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='categories' AND column_name='category_name'
    `);

    if (checkCategoryName.rows.length > 0) {
      await client.query(`
        UPDATE categories 
        SET name = category_name
        WHERE name IS NULL
      `);
    }

    // Add missing columns to order_items table
    await client.query(`
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS product_name VARCHAR(200),
      ADD COLUMN IF NOT EXISTS product_image TEXT,
      ADD COLUMN IF NOT EXISTS product_sku VARCHAR(100),
      ADD COLUMN IF NOT EXISTS total NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // Update total in order_items
    await client.query(`
      UPDATE order_items 
      SET total = price * quantity
      WHERE total IS NULL
    `);

    // Create cart table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `);

    // Create cart_items table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER REFERENCES cart(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        price NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create reviews table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    console.log('✅ Database migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Run migration
migrateDatabase()
  .then(() => {
    console.log('✅ Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
