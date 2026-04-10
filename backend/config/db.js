const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// SQLite database connection
const db = new sqlite3.Database(
  path.join(__dirname, '../ecommerce.db'),
  (err) => {
    if (err) {
      console.error('❌ Error opening SQLite database:', err);
      process.exit(-1);
    } else {
      console.log('✅ Connected to SQLite database');
    }
  }
);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Convert PostgreSQL-style placeholders to SQLite placeholders
const convertToSQLite = (sql) => {
  let paramIndex = 0;
  return sql.replace(/\$\d+/g, () => {
    paramIndex++;
    return '?';
  });
};

// Create a pool-like interface for compatibility with pg module
const pool = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      const sqliteSql = convertToSQLite(sql);
      const upperSql = sqliteSql.trim().toUpperCase();
      
      if (upperSql.startsWith('SELECT')) {
        db.all(sqliteSql, params, function(err, rows) {
          if (err) reject(err);
          else resolve({ rows: rows || [] });
        });
      } else if (upperSql.startsWith('INSERT') || upperSql.startsWith('UPDATE') || upperSql.startsWith('DELETE')) {
        db.run(sqliteSql, params, function(err) {
          if (err) reject(err);
          else resolve({ 
            rows: [], 
            lastID: this.lastID,
            changes: this.changes 
          });
        });
      } else {
        db.run(sqliteSql, params, function(err) {
          if (err) reject(err);
          else resolve({ rows: [] });
        });
      }
    });
  },
  connect: () => {
    return {
      query: (sql, params = []) => {
        return new Promise((resolve, reject) => {
          const sqliteSql = convertToSQLite(sql);
          const upperSql = sqliteSql.trim().toUpperCase();
          
          if (upperSql.startsWith('SELECT')) {
            db.all(sqliteSql, params, function(err, rows) {
              if (err) reject(err);
              else resolve({ rows: rows || [] });
            });
          } else {
            db.run(sqliteSql, params, function(err) {
              if (err) reject(err);
              else resolve({ 
                rows: [], 
                lastID: this.lastID,
                changes: this.changes 
              });
            });
          }
        });
      },
      release: () => {}
    };
  },
  end: () => {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Create tables if they don't exist
const createTables = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      try {
        // Users table
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone VARCHAR(20),
            role VARCHAR(20) DEFAULT 'customer',
            email_verified BOOLEAN DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Categories table
        db.run(`
          CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Products table
        db.run(`
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category VARCHAR(100),
            thumbnail TEXT,
            images TEXT,
            sku VARCHAR(100) UNIQUE,
            stock INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            rating REAL DEFAULT 0,
            reviews_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Cart table
        db.run(`
          CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        // Cart items table
        db.run(`
          CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cart_id INTEGER NOT NULL,
            product_id INTEGER,
            quantity INTEGER NOT NULL DEFAULT 1,
            price REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(cart_id) REFERENCES cart(id) ON DELETE CASCADE,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
          )
        `);

        // Orders table
        db.run(`
          CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number VARCHAR(50) UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            subtotal REAL NOT NULL,
            shipping_amount REAL DEFAULT 0,
            tax_amount REAL DEFAULT 0,
            total_amount REAL NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            payment_status VARCHAR(50) DEFAULT 'pending',
            payment_method VARCHAR(50),
            shipping_name VARCHAR(100),
            shipping_phone VARCHAR(20),
            shipping_address_line1 TEXT,
            shipping_address_line2 TEXT,
            shipping_city VARCHAR(100),
            shipping_state VARCHAR(100),
            shipping_postal_code VARCHAR(20),
            shipping_country VARCHAR(100) DEFAULT 'India',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        // Order items table
        db.run(`
          CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER,
            product_name VARCHAR(200) NOT NULL,
            product_image TEXT,
            product_sku VARCHAR(100),
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            total REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
          )
        `);

        // Reviews table
        db.run(`
          CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('❌ Error creating tables:', err.message);
            reject(err);
          } else {
            console.log('✅ Database tables created successfully');
            resolve();
          }
        });
      } catch (error) {
        console.error('❌ Error creating tables:', error.message);
        reject(error);
      }
    });
  });
};

module.exports = { pool, createTables };
