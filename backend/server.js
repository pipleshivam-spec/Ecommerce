const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { pool, createTables } = require('./config/db');
const User = require('./models/userModel');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const mockPaymentRoutes = require('./routes/mockPaymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/payment', mockPaymentRoutes); // Mock payment for demo
app.use('/api/reviews', reviewRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ecommerce API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      categories: '/api/categories'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize database and create default admin
const initializeDatabase = async () => {
  try {
    // Create tables
    await createTables();

    // Check if admin exists
    const adminEmail = 'admin@ecommerce.com';
    const existingAdmin = await User.findByEmail(adminEmail);

    if (!existingAdmin) {
      // Create default admin
      await User.create('Admin User', adminEmail, 'Admin@123', '9876543210', 'admin');
      console.log('✅ Default admin created');
      console.log('   Email: admin@ecommerce.com');
      console.log('   Password: Admin@123');
    }

    // Create sample customers
    const customers = [
      { name: 'John Doe', email: 'john@customer.com', password: 'Customer@123', phone: '9876543211' },
      { name: 'Jane Smith', email: 'jane@customer.com', password: 'Customer@123', phone: '9876543212' },
    ];

    for (const customer of customers) {
      const exists = await User.findByEmail(customer.email);
      if (!exists) {
        await User.create(customer.name, customer.email, customer.password, customer.phone, 'customer');
        console.log(`✅ Sample customer created: ${customer.email}`);
      }
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log('═══════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
