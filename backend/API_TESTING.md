# 🧪 API Testing Guide

## Base URL
```
http://localhost/ecommerce-backend/api/
```

---

## 🔐 AUTHENTICATION APIs

### 1. Admin Login
```http
POST /login.php
Content-Type: application/json

{
  "email": "admin@ecommerce.com",
  "password": "password"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@ecommerce.com",
    "role": "admin"
  }
}
```

### 2. User Registration
```http
POST /register.php
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}

Response:
{
  "success": true,
  "message": "Registration successful"
}
```

### 3. User Login
```http
POST /login.php
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 4. Logout
```http
POST /logout.php

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 📦 PRODUCTS APIs

### 1. Get All Products
```http
GET /products.php

Response:
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Modern Backpack",
      "price": "79.00",
      "category": "Backpack",
      "stock": 50
    }
  ]
}
```

### 2. Get Single Product
```http
GET /products.php?id=1

Response:
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Modern Backpack",
    "description": "...",
    "price": "79.00",
    "images": ["/Backpack/image1.jpg"]
  }
}
```

### 3. Create Product (Admin Only)
```http
POST /products.php
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "category": "Backpack",
  "image": "/path/to/image.jpg",
  "stock": 100
}
```

### 4. Update Product (Admin Only)
```http
PUT /products.php
Content-Type: application/json

{
  "id": 1,
  "name": "Updated Name",
  "price": 89.99,
  "stock": 75
}
```

### 5. Delete Product (Admin Only)
```http
DELETE /products.php?id=1
```

---

## 🛒 CART APIs (Requires Login)

### 1. Get Cart Items
```http
GET /cart.php

Response:
{
  "success": true,
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "name": "Modern Backpack",
      "price": "79.00",
      "quantity": 2,
      "image": "/Backpack/image1.jpg"
    }
  ]
}
```

### 2. Add to Cart
```http
POST /cart.php
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}

Response:
{
  "success": true,
  "message": "Added to cart"
}
```

### 3. Remove from Cart
```http
DELETE /cart.php?id=1

Response:
{
  "success": true,
  "message": "Removed from cart"
}
```

---

## 📋 ORDERS APIs (Requires Login)

### 1. Get User Orders
```http
GET /orders.php

Response:
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "total_amount": "158.00",
      "status": "pending",
      "created_at": "2024-01-01 10:00:00"
    }
  ]
}
```

### 2. Place Order
```http
POST /orders.php
Content-Type: application/json

{
  "total_amount": 158.00,
  "payment_method": "COD",
  "shipping_address": "123 Main St, City, State 12345",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 79.00
    }
  ]
}

Response:
{
  "success": true,
  "message": "Order placed",
  "order_id": 1
}
```

---

## 📊 ADMIN APIs (Admin Only)

### 1. Dashboard Statistics
```http
GET /admin-stats.php

Response:
{
  "success": true,
  "stats": {
    "total_products": 50,
    "total_users": 100,
    "total_orders": 250,
    "total_revenue": "25000.00",
    "recent_orders": [...]
  }
}
```

---

## 🧪 Testing with cURL

### Admin Login
```bash
curl -X POST http://localhost/ecommerce-backend/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecommerce.com","password":"password"}'
```

### Get Products
```bash
curl http://localhost/ecommerce-backend/api/products.php
```

### Register User
```bash
curl -X POST http://localhost/ecommerce-backend/api/register.php \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

---

## 🔑 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 401 | Unauthorized (Not logged in) |
| 403 | Forbidden (Not admin) |
| 404 | Not Found |
| 405 | Method Not Allowed |
| 500 | Server Error |

---

## ✅ Quick Test Checklist

- [ ] Admin can login
- [ ] User can register
- [ ] User can login
- [ ] Get all products works
- [ ] Add to cart works (after login)
- [ ] Place order works (after login)
- [ ] Admin can view stats
- [ ] Admin can create product
- [ ] Admin can delete product

---

**All APIs are ready to use! Start testing with Postman or cURL.**
