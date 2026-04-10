# 🔐 ECOMMERCE PLATFORM - LOGIN CREDENTIALS

## 📋 Default Login Credentials

### 👨‍💼 ADMIN LOGIN
```
URL: http://localhost:8080/admin/login
Email: admin@ecommerce.com
Password: Admin@123
Role: admin
```

**Admin Capabilities:**
- Full access to admin dashboard
- Manage products (CRUD operations)
- Manage categories
- Manage users
- View orders
- View analytics
- Manage coupons
- Site settings

---

### 👥 CUSTOMER LOGINS

#### Customer 1
```
URL: http://localhost:8080/login
Email: john@customer.com
Password: Customer@123
Role: customer
```

#### Customer 2
```
Email: jane@customer.com
Password: Customer@123
Role: customer
```

#### Customer 3
```
Email: mike@customer.com
Password: Customer@123
Role: customer
```

**Customer Capabilities:**
- Browse products
- Add to cart
- Place orders
- View order history
- Manage profile
- Add to wishlist
- Write reviews
- Manage addresses

---

## 🗄️ DATABASE CREDENTIALS

### PostgreSQL Database
```
Host: localhost
Port: 5432
Database: ecommerce
Username: postgres
Password: Yash@#$2018
```

**Connection String:**
```
postgresql://postgres:Yash@#$2018@localhost:5432/ecommerce
```

---

## 🚀 API ENDPOINTS

### Base URL
```
Backend API: http://localhost:5000/api
Frontend: http://localhost:8080
```

### Authentication Endpoints
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login user
GET  /api/auth/profile     - Get user profile (Protected)
POST /api/auth/logout      - Logout user
```

### Product Endpoints
```
GET    /api/products       - Get all products
GET    /api/products/:id   - Get single product
POST   /api/products       - Create product (Admin)
PUT    /api/products/:id   - Update product (Admin)
DELETE /api/products/:id   - Delete product (Admin)
```

### Category Endpoints
```
GET    /api/categories     - Get all categories
POST   /api/categories     - Create category (Admin)
PUT    /api/categories/:id - Update category (Admin)
DELETE /api/categories/:id - Delete category (Admin)
```

### Order Endpoints
```
GET    /api/orders         - Get user orders
POST   /api/orders         - Create order
GET    /api/orders/:id     - Get order details
PUT    /api/orders/:id     - Update order status (Admin)
```

---

## 🔑 JWT TOKEN INFORMATION

### Token Configuration
```
JWT_SECRET: your_super_secret_jwt_key_change_this_in_production
Token Expiry: 7 days
Token Type: Bearer
```

### How to Use Token
```javascript
// In API requests
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

---

## 📧 EMAIL CONFIGURATION (To Be Implemented)

### SMTP Settings (Example)
```
SMTP_HOST: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: your-email@gmail.com
SMTP_PASS: your-app-password
```

---

## 💳 PAYMENT GATEWAY (To Be Implemented)

### Razorpay (Recommended for India)
```
RAZORPAY_KEY_ID: your_key_id
RAZORPAY_KEY_SECRET: your_key_secret
```

### Stripe (International)
```
STRIPE_PUBLIC_KEY: your_public_key
STRIPE_SECRET_KEY: your_secret_key
```

---

## 🛠️ DEVELOPMENT SETUP

### Start Backend Server
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend Server
```bash
cd frontend (root directory)
npm install
npm run dev
# Frontend runs on http://localhost:8080
```

### Seed Database with Users
```bash
cd backend
npm run seed:users
```

---

## 🔒 SECURITY NOTES

### ⚠️ IMPORTANT - PRODUCTION CHECKLIST

1. **Change All Default Passwords**
   - Admin password
   - Database password
   - JWT secret

2. **Environment Variables**
   - Never commit .env files
   - Use strong, unique secrets
   - Rotate keys regularly

3. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Regular backups
   - Limit user permissions

4. **API Security**
   - Enable rate limiting
   - Use HTTPS only
   - Implement CORS properly
   - Add request validation

5. **User Data**
   - Hash all passwords
   - Encrypt sensitive data
   - GDPR compliance
   - Regular security audits

---

## 📱 TEST ACCOUNTS FOR DIFFERENT SCENARIOS

### Test Admin Account
```
Email: admin@ecommerce.com
Password: Admin@123
Use Case: Testing admin features
```

### Test Customer Account (With Orders)
```
Email: john@customer.com
Password: Customer@123
Use Case: Testing customer flow
```

### Test Customer Account (New User)
```
Email: jane@customer.com
Password: Customer@123
Use Case: Testing first-time user experience
```

---

## 🎯 QUICK START GUIDE

### 1. First Time Setup
```bash
# Clone repository
git clone <your-repo-url>

# Install backend dependencies
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Start PostgreSQL database
# Create database 'ecommerce'

# Run backend
npm run dev

# In new terminal - Install frontend dependencies
cd ..
npm install

# Run frontend
npm run dev
```

### 2. Access the Application
```
Frontend: http://localhost:8080
Backend API: http://localhost:5000
Admin Panel: http://localhost:8080/admin
```

### 3. Login
- Use admin credentials for admin panel
- Use customer credentials for shopping
- Or register a new account

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue: Cannot connect to database**
```
Solution: 
1. Check PostgreSQL is running
2. Verify database credentials in .env
3. Ensure database 'ecommerce' exists
```

**Issue: JWT token invalid**
```
Solution:
1. Check JWT_SECRET in .env
2. Clear browser localStorage
3. Login again
```

**Issue: CORS error**
```
Solution:
1. Check backend CORS configuration
2. Verify frontend URL in CORS settings
3. Restart backend server
```

---

## 📝 NOTES

- All passwords use bcrypt hashing with salt rounds = 10
- Tokens expire after 7 days
- Admin accounts have elevated privileges
- Customer accounts are created with 'customer' role by default
- Database uses PostgreSQL with proper foreign key constraints

---

**Last Updated:** $(date)
**Version:** 1.0
**Status:** Active Development

⚠️ **SECURITY WARNING:** 
These are development credentials. 
NEVER use these in production!
Always change default passwords before deploying.
