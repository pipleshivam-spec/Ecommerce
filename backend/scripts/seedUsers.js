const User = require('../models/userModel');
const { pool } = require('../config/db');
require('dotenv').config();

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding users...');

    // Admin credentials
    const adminEmail = 'admin@ecommerce.com';
    const adminExists = await User.findByEmail(adminEmail);
    
    if (!adminExists) {
      await User.create('Admin User', adminEmail, 'Admin@123', '9876543210', 'admin');
      console.log('✅ Admin created:');
      console.log('   Email: admin@ecommerce.com');
      console.log('   Password: Admin@123');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // Customer credentials
    const customers = [
      { name: 'John Doe', email: 'john@customer.com', password: 'Customer@123', phone: '9876543211' },
      { name: 'Jane Smith', email: 'jane@customer.com', password: 'Customer@123', phone: '9876543212' },
      { name: 'Mike Johnson', email: 'mike@customer.com', password: 'Customer@123', phone: '9876543213' },
    ];

    for (const customer of customers) {
      const exists = await User.findByEmail(customer.email);
      if (!exists) {
        await User.create(customer.name, customer.email, customer.password, customer.phone, 'customer');
        console.log(`✅ Customer created: ${customer.email}`);
      }
    }

    console.log('\n📋 Login Credentials Summary:');
    console.log('═══════════════════════════════════════════');
    console.log('ADMIN LOGIN:');
    console.log('  Email: admin@ecommerce.com');
    console.log('  Password: Admin@123');
    console.log('');
    console.log('CUSTOMER LOGINS:');
    console.log('  Email: john@customer.com | Password: Customer@123');
    console.log('  Email: jane@customer.com | Password: Customer@123');
    console.log('  Email: mike@customer.com | Password: Customer@123');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
