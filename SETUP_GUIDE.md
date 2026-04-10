# 🚀 COMPLETE ECOMMERCE WEBSITE SETUP GUIDE

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Admin Panel Access](#admin-panel-access)
7. [API Testing](#api-testing)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before starting, make sure you have installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** (optional) - [Download](https://git-scm.com/)

---

## 🔧 Backend Setup

### Step 1: Navigate to Backend Folder
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- express
- pg (PostgreSQL client)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- dotenv (environment variables)
- cors (cross-origin requests)
- multer (file uploads)
- express-validator (validation)

### Step 3: Configure Environment Variables

The `.env` file is already created. Update it with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_NAME=ecommerce_db
DB_PORT=5432

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

PORT=5000
NODE_ENV=development

ADMIN_EMAIL=admin@ecommerce.com
ADMIN_PASSWORD=admin123
```

⚠️ **IMPORTANT**: Change `DB_PASSWORD` to your PostgreSQL password!

---

## 🗄️ Database Setup

### Step 1: Create Database

Open PostgreSQL (pgAdmin or command line) and run:

```sql
CREATE DATABASE ecommerce_db;
```

### Step 2: Start Backend Server

The server will automatically create all tables:

```bash
npm start
```

You should see:
```
✅ Connected to PostgreSQL database
✅ Database tables created successfully
✅ Default admin created
   Email: admin@ecommerce.com
   Password: admin123
✅ Database initialized successfully

═══════════════════════════════════════════
🚀 Server running on port 5000
📍 API URL: http://localhost:5000
🏥 Health Check: http://localhost:5000/api/health
═══════════════════════════════════════════
```

### Step 3: Seed Database (Optional)

To add sample products and categories:

```bash
npm run seed
```

This will create:
- 5 Categories (Men, Women, Shoes, Accessories, Bags)
- 8 Sample Products

---

## 🎨 Frontend Setup

### Step 1: Navigate to Root Folder
```bash
cd ..
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Start Frontend Development Server
```bash
npm run dev
```

The frontend will start on: **http://localhost:8080**

---

## 🏃 Running the Application

### Full Stack Running Process:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Backend runs on: **http://localhost:5000**

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend runs on: **http://localhost:8080**

---

## 👨‍💼 Admin Panel Access

### Default Admin Credentials:
- **Email**: admin@ecommerce.com
- **Password**: admin123

### Admin Features:
1. **Dashboard** - View statistics (total orders, revenue, users, products)
2. **Product Management** - Add, edit, delete products
3. **Order Management** - View and update order status
4. **Category Management** - Manage product categories
5. **User Management** - View and manage users

### Admin Routes:
- Login: `/admin/login`
- Dashboard: `/admin`
- Products: `/admin/products`
- Orders: `/admin/orders` (to be created)
- Categories: `/admin/categories`
- Users: `/admin/users`

---

## 🧪 API Testing

### Test with cURL or Postman:

**1. Health Check:**
```bash
curl http://localhost:5000/api/health
```

**2. Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890"
  }'
```

**3. Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ecommerce.com",
    "password": "admin123"
  }'
```

**4. Get Products:**
```bash
curl http://localhost:5000/api/products
```

**5. Get Categories:**
```bash
curl http://localhost:5000/api/categories
```

---

## 🔐 Authentication Flow

### For Customers:
1. Register at `/register`
2. Login at `/login`
3. Browse products
4. Add to cart
5. Place order
6. View order history

### For Admin:
1. Login at `/admin/login` with admin credentials
2. Access admin dashboard
3. Manage products, orders, categories, users

---

## 📱 Hero Section Options

The Hero Section supports 3 background types:

### Option 1: Video Background
```tsx
<HeroSection 
  type="video" 
  videoSrc="/assets/video/hero.mp4"
/>
```

### Option 2: GIF Background
```tsx
<HeroSection 
  type="gif" 
  gifSrc="/assets/images/hero.gif"
/>
```

### Option 3: Image Slider (Default)
```tsx
<HeroSection 
  type="slider" 
  images={[
    "/images/hero1.jpg",
    "/images/hero2.jpg",
    "/images/hero3.jpg"
  ]}
/>
```

To change, edit `src/pages/Index.tsx` and update the `type` prop.

---

## 🐛 Troubleshooting

### Backend Issues:

**Problem**: Cannot connect to database
```
Solution: 
1. Check if PostgreSQL is running
2. Verify credentials in .env file
3. Ensure database 'ecommerce_db' exists
```

**Problem**: Port 5000 already in use
```
Solution: 
Change PORT in .env file to another port (e.g., 5001)
```

**Problem**: JWT token errors
```
Solution: 
Make sure JWT_SECRET is set in .env file
```

### Frontend Issues:

**Problem**: Cannot connect to backend
```
Solution: 
1. Ensure backend is running on port 5000
2. Check CORS settings in backend
3. Update API base URL if needed
```

**Problem**: Port 8080 already in use
```
Solution: 
The dev server will automatically try another port
```

---

## 📂 Project Structure

```
Ecommerce/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── categoryController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── productModel.js
│   │   ├── orderModel.js
│   │   └── categoryModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── categoryRoutes.js
│   ├── .env
│   ├── server.js
│   ├── seed.js
│   └── package.json
├── src/
│   ├── components/
│   │   ├── HeroSection.tsx (NEW)
│   │   ├── ProductCard.tsx
│   │   └── layout/
│   ├── pages/
│   │   ├── Index.tsx (UPDATED)
│   │   ├── Products.tsx
│   │   ├── Cart.tsx
│   │   └── admin/
│   ├── contexts/
│   └── ...
└── package.json
```

---

## 🎯 Next Steps

1. ✅ Backend is running
2. ✅ Frontend is running
3. ✅ Database is set up
4. ✅ Admin account created

### Now you can:
- Browse products on the frontend
- Register as a customer
- Login as admin and manage the store
- Place orders
- View order history

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation in `backend/README.md`
3. Check console logs for errors

---

## 🎉 Congratulations!

Your fully functional ecommerce website is now ready!

**Frontend**: http://localhost:8080
**Backend API**: http://localhost:5000
**Admin Panel**: http://localhost:8080/admin/login

---

## 📝 Important Notes

1. **Security**: Change default admin password in production
2. **Environment**: Never commit `.env` file to version control
3. **Database**: Backup your database regularly
4. **JWT Secret**: Use a strong, random secret in production
5. **CORS**: Configure CORS properly for production

---

## 🚀 Production Deployment

For production deployment:
1. Set `NODE_ENV=production` in .env
2. Use environment variables for sensitive data
3. Enable HTTPS
4. Use a production-grade database
5. Implement rate limiting
6. Add logging and monitoring
7. Set up automated backups

---

**Happy Coding! 🎉**
