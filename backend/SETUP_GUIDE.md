# 🚀 PHP Backend Setup Guide - XAMPP

## 📋 STEP-BY-STEP INSTALLATION

### STEP 1: Install XAMPP
1. Download XAMPP from https://www.apachefriends.org/
2. Install XAMPP (default location: C:\xampp)
3. Start Apache and MySQL from XAMPP Control Panel

### STEP 2: Setup Database
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click "Import" tab
3. Choose file: `backend/schema.sql`
4. Click "Go" to import

**Default Admin Login:**
- Email: admin@ecommerce.com
- Password: password

### STEP 3: Move Backend Files
1. Copy `backend` folder to: `C:\xampp\htdocs\ecommerce-backend\`
2. Your structure should be:
```
C:\xampp\htdocs\ecommerce-backend\
├── api/
│   ├── login.php
│   ├── register.php
│   ├── logout.php
│   ├── products.php
│   ├── cart.php
│   ├── orders.php
│   └── admin-stats.php
├── config/
│   └── database.php
├── includes/
│   └── auth.php
└── schema.sql
```

### STEP 4: Configure Database
Edit `config/database.php` if needed:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', ''); // Your MySQL password
define('DB_NAME', 'ecommerce_db');
```

### STEP 5: Test APIs

**Base URL:** http://localhost/ecommerce-backend/api/

#### Test Login (Postman/Browser):
```
POST http://localhost/ecommerce-backend/api/login.php
Body (JSON):
{
  "email": "admin@ecommerce.com",
  "password": "password"
}
```

#### Test Products:
```
GET http://localhost/ecommerce-backend/api/products.php
```

---

## 🎯 TASK 1: ADMIN LOGIN & DASHBOARD

### Admin Features:
✅ Login with admin credentials
✅ View dashboard statistics
✅ Manage products (CRUD)
✅ View all orders
✅ View all users

### Admin API Endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/login.php` | POST | Admin login |
| `/api/admin-stats.php` | GET | Dashboard stats |
| `/api/products.php` | GET/POST/PUT/DELETE | Manage products |
| `/api/orders.php` | GET | View all orders |

### Admin Login Flow:
1. POST to `/api/login.php` with admin credentials
2. Receive session token
3. Access admin endpoints
4. View dashboard with stats

---

## 🎯 TASK 2: USER LOGIN & ALL PAGES

### User Features:
✅ Register new account
✅ Login with credentials
✅ Browse products
✅ Add to cart
✅ Place orders
✅ View order history

### User API Endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register.php` | POST | User registration |
| `/api/login.php` | POST | User login |
| `/api/logout.php` | POST | Logout |
| `/api/products.php` | GET | Get products |
| `/api/cart.php` | GET/POST/DELETE | Manage cart |
| `/api/orders.php` | GET/POST | Orders |

### User Flow:
1. Register: POST to `/api/register.php`
2. Login: POST to `/api/login.php`
3. Browse: GET `/api/products.php`
4. Add to Cart: POST `/api/cart.php`
5. Checkout: POST `/api/orders.php`

---

## 📊 DATABASE TABLES

### Users Table
- id, name, email, password, phone, address, role, created_at

### Products Table
- id, name, description, price, category, image, stock, rating, reviews

### Orders Table
- id, user_id, total_amount, status, payment_method, shipping_address

### Cart Table
- id, user_id, product_id, quantity

### Wishlist Table
- id, user_id, product_id

---

## 🔐 Authentication System

### Session-Based Auth:
- Login creates PHP session
- Session stores: user_id, name, email, role
- Protected routes check session
- Logout destroys session

### Role-Based Access:
- **Admin**: Full access to all endpoints
- **User**: Limited to own data (cart, orders)

---

## 🧪 Testing APIs

### Using Postman:

**1. Admin Login:**
```json
POST http://localhost/ecommerce-backend/api/login.php
{
  "email": "admin@ecommerce.com",
  "password": "password"
}
```

**2. User Registration:**
```json
POST http://localhost/ecommerce-backend/api/register.php
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

**3. Get Products:**
```
GET http://localhost/ecommerce-backend/api/products.php
```

**4. Add to Cart:**
```json
POST http://localhost/ecommerce-backend/api/cart.php
{
  "product_id": 1,
  "quantity": 2
}
```

**5. Place Order:**
```json
POST http://localhost/ecommerce-backend/api/orders.php
{
  "total_amount": 158.00,
  "payment_method": "COD",
  "shipping_address": "123 Main St, City",
  "items": [
    {"product_id": 1, "quantity": 2, "price": 79.00}
  ]
}
```

---

## 🔧 Troubleshooting

### Error: Database connection failed
- Check MySQL is running in XAMPP
- Verify database credentials in `config/database.php`
- Ensure database `ecommerce_db` exists

### Error: 404 Not Found
- Check file path: `C:\xampp\htdocs\ecommerce-backend\`
- Verify Apache is running
- Check URL: `http://localhost/ecommerce-backend/api/`

### Error: CORS issues
- Headers already set in PHP files
- If needed, add to `.htaccess`:
```
Header set Access-Control-Allow-Origin "*"
```

---

## 📱 Connect Frontend to Backend

Update your React app API calls:

```typescript
const API_BASE = 'http://localhost/ecommerce-backend/api';

// Login
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE}/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Get Products
const getProducts = async () => {
  const response = await fetch(`${API_BASE}/products.php`);
  return response.json();
};
```

---

## ✅ COMPLETED TASKS

### ✅ TASK 1: Admin Login & Dashboard
- Admin authentication system
- Dashboard statistics API
- Product management (CRUD)
- Order management
- User management

### ✅ TASK 2: User Login & All Pages
- User registration system
- User authentication
- Product browsing
- Shopping cart functionality
- Order placement
- Order history

---

## 🎉 SUCCESS!

Your PHP backend is ready with:
- ✅ Complete authentication system
- ✅ Admin dashboard with stats
- ✅ User management
- ✅ Product management
- ✅ Cart functionality
- ✅ Order processing
- ✅ Session-based security
- ✅ Role-based access control

**Start XAMPP and test your APIs!**
