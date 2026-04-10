# Ecommerce Backend API

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup PostgreSQL Database

1. Open PostgreSQL and create database:
```sql
CREATE DATABASE ecommerce_db;
```

2. Update `.env` file with your database credentials:
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ecommerce_db
DB_PORT=5432
```

### Step 3: Start Server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will automatically:
- Create all required tables
- Create a default admin account

### Default Admin Credentials
- **Email**: admin@ecommerce.com
- **Password**: admin123

⚠️ **IMPORTANT**: Change these credentials in production!

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication APIs

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer YOUR_TOKEN
```

### Get All Users (Admin Only)
```http
GET /api/auth/users
Authorization: Bearer ADMIN_TOKEN
```

---

## 📦 Product APIs

### Get All Products
```http
GET /api/products
```

Query Parameters:
- `category` - Filter by category ID
- `search` - Search products by name/description

### Get Single Product
```http
GET /api/products/:id
```

### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Premium Blazer",
  "price": 299.99,
  "category_id": 1,
  "description": "Elegant premium blazer",
  "image_url": "/images/blazer.jpg",
  "stock": 50,
  "rating": 4.5,
  "reviews": 120,
  "badge": "Best Seller"
}
```

### Update Product (Admin Only)
```http
PUT /api/products/:id
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 349.99,
  "stock": 30
}
```

### Delete Product (Admin Only)
```http
DELETE /api/products/:id
Authorization: Bearer ADMIN_TOKEN
```

---

## 📂 Category APIs

### Get All Categories
```http
GET /api/categories
```

### Create Category (Admin Only)
```http
POST /api/categories
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "category_name": "Men"
}
```

### Update Category (Admin Only)
```http
PUT /api/categories/:id
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "category_name": "Men's Fashion"
}
```

### Delete Category (Admin Only)
```http
DELETE /api/categories/:id
Authorization: Bearer ADMIN_TOKEN
```

---

## 🛒 Order APIs

### Create Order (Protected)
```http
POST /api/orders
Authorization: Bearer USER_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 299.99
    },
    {
      "product_id": 3,
      "quantity": 1,
      "price": 149.99
    }
  ],
  "shipping_address": "123 Main St, City, Country"
}
```

### Get My Orders (Protected)
```http
GET /api/orders/my-orders
Authorization: Bearer USER_TOKEN
```

### Get All Orders (Admin Only)
```http
GET /api/orders
Authorization: Bearer ADMIN_TOKEN
```

### Get Order by ID (Protected)
```http
GET /api/orders/:id
Authorization: Bearer USER_TOKEN
```

### Update Order Status (Admin Only)
```http
PUT /api/orders/:id/status
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "status": "Shipped"
}
```

Valid statuses: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`

### Get Dashboard Stats (Admin Only)
```http
GET /api/orders/stats/dashboard
Authorization: Bearer ADMIN_TOKEN
```

---

## 🗄️ Database Schema

### Users Table
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR 100)
- email (VARCHAR 100 UNIQUE)
- password (TEXT)
- phone (VARCHAR 20)
- role (VARCHAR 20) - 'admin' or 'customer'
- created_at (TIMESTAMP)
```

### Categories Table
```sql
- id (SERIAL PRIMARY KEY)
- category_name (VARCHAR 100 UNIQUE)
- created_at (TIMESTAMP)
```

### Products Table
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR 150)
- price (NUMERIC)
- category_id (INTEGER FK)
- description (TEXT)
- image_url (TEXT)
- stock (INTEGER)
- rating (NUMERIC)
- reviews (INTEGER)
- badge (VARCHAR 50)
- created_at (TIMESTAMP)
```

### Orders Table
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK)
- total_price (NUMERIC)
- status (VARCHAR 50)
- shipping_address (TEXT)
- created_at (TIMESTAMP)
```

### Order Items Table
```sql
- id (SERIAL PRIMARY KEY)
- order_id (INTEGER FK)
- product_id (INTEGER FK)
- quantity (INTEGER)
- price (NUMERIC)
```

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Role-based access control (Admin/Customer)
- ✅ Protected routes
- ✅ SQL injection prevention
- ✅ CORS enabled

---

## 📝 Environment Variables

```env
# Database
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=ecommerce_db
DB_PORT=5432

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Server
PORT=5000
NODE_ENV=development

# Admin
ADMIN_EMAIL=admin@ecommerce.com
ADMIN_PASSWORD=admin123
```

---

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

---

## 📞 Support

For issues or questions, please contact the development team.

---

## 📄 License

ISC License
