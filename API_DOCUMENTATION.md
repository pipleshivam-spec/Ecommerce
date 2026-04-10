# 📡 COMPLETE API DOCUMENTATION

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 AUTHENTICATION

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": {...},
    "token": "jwt_token_here"
  }
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer {token}
```

---

## 🛒 CART

### Get Cart
```http
GET /cart
Authorization: Bearer {token}
```

### Add to Cart
```http
POST /cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}
```

### Update Cart Item
```http
PUT /cart/update/:itemId
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /cart/remove/:itemId
Authorization: Bearer {token}
```

### Clear Cart
```http
DELETE /cart/clear
Authorization: Bearer {token}
```

### Get Cart Count
```http
GET /cart/count
Authorization: Bearer {token}
```

---

## 💳 CHECKOUT

### Process Checkout
```http
POST /checkout/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "shipping_address": {
    "name": "John Doe",
    "phone": "9876543210",
    "address_line1": "123 Main St",
    "address_line2": "Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001",
    "country": "India"
  },
  "notes": "Please deliver before 5 PM"
}
```

### Get Order Details
```http
GET /checkout/order/:orderId
Authorization: Bearer {token}
```

### Get User Orders
```http
GET /checkout/orders?page=1&limit=10
Authorization: Bearer {token}
```

### Cancel Order
```http
PUT /checkout/order/:orderId/cancel
Authorization: Bearer {token}
```

---

## 💰 PAYMENT

### Create Razorpay Order
```http
POST /payment/create-order
Authorization: Bearer {token}
Content-Type: application/json

{
  "order_id": 123
}

Response:
{
  "success": true,
  "data": {
    "order_id": "order_razorpay_id",
    "amount": 50000,
    "currency": "INR",
    "key_id": "rzp_test_xxxxx"
  }
}
```

### Verify Payment
```http
POST /payment/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx"
}
```

### Handle Payment Failure
```http
POST /payment/failure
Authorization: Bearer {token}
Content-Type: application/json

{
  "order_id": "order_xxxxx",
  "error": {
    "description": "Payment failed"
  }
}
```

---

## ⭐ REVIEWS

### Get Product Reviews
```http
GET /reviews/product/:productId?page=1&limit=10
```

### Create Review
```http
POST /reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": 1,
  "order_id": 123,
  "rating": 5,
  "title": "Great product!",
  "comment": "Excellent quality and fast delivery",
  "images": ["url1", "url2"]
}
```

### Update Review
```http
PUT /reviews/:reviewId
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 4,
  "title": "Updated title",
  "comment": "Updated comment"
}
```

### Delete Review
```http
DELETE /reviews/:reviewId
Authorization: Bearer {token}
```

### Mark Review as Helpful
```http
POST /reviews/:reviewId/helpful
Authorization: Bearer {token}
```

### Check if User Can Review
```http
GET /reviews/check/:productId
Authorization: Bearer {token}
```

---

## 🔍 SEARCH

### Search Products
```http
GET /search?q=shirt&category=clothing&min_price=100&max_price=1000&min_rating=4&sort_by=price_asc&page=1&limit=20

Query Parameters:
- q: Search query
- category: Category slug
- min_price: Minimum price
- max_price: Maximum price
- min_rating: Minimum rating (1-5)
- sort_by: relevance|price_asc|price_desc|rating|newest|popular
- page: Page number
- limit: Items per page
```

### Get Search Suggestions
```http
GET /search/suggestions?q=shi&limit=5
```

### Get Available Filters
```http
GET /search/filters?q=shirt

Response:
{
  "success": true,
  "data": {
    "categories": [...],
    "price_range": {
      "min_price": 100,
      "max_price": 5000
    },
    "ratings": [...]
  }
}
```

---

## 👨‍💼 ADMIN

### Get Dashboard Stats
```http
GET /admin/stats
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "data": {
    "total_users": 150,
    "total_products": 200,
    "total_orders": 500,
    "total_revenue": "125000.00",
    "orders_by_status": [...],
    "recent_orders": 25,
    "monthly_revenue": "15000.00",
    "revenue_growth": "12.5"
  }
}
```

### Get Revenue Data
```http
GET /admin/revenue?period=month
Authorization: Bearer {admin_token}

Query Parameters:
- period: week|month|year
```

### Get Top Products
```http
GET /admin/top-products?limit=10
Authorization: Bearer {admin_token}
```

### Get Recent Orders
```http
GET /admin/recent-orders?limit=10
Authorization: Bearer {admin_token}
```

### Get All Users
```http
GET /admin/users?page=1&limit=20&role=customer
Authorization: Bearer {admin_token}
```

### Update User Status
```http
PUT /admin/users/:userId/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "is_active": false
}
```

### Update Order Status
```http
PUT /admin/orders/:orderId/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "shipped"
}

Valid statuses:
- pending
- confirmed
- processing
- shipped
- delivered
- cancelled
- refunded
```

---

## 📤 UPLOAD

### Upload Product Image
```http
POST /upload/product-image
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Form Data:
- image: File (max 5MB, jpeg/jpg/png/gif/webp)

Response:
{
  "success": true,
  "data": {
    "url": "https://cloudinary.com/...",
    "public_id": "ecommerce/products/xxxxx",
    "width": 1000,
    "height": 1000
  }
}
```

### Upload Multiple Product Images
```http
POST /upload/product-images
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Form Data:
- images: File[] (max 10 images)
```

### Upload Category Image
```http
POST /upload/category-image
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Form Data:
- image: File
```

### Upload Review Images
```http
POST /upload/review-images
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- images: File[] (max 5 images)
```

### Delete Image
```http
DELETE /upload/:public_id
Authorization: Bearer {admin_token}
```

---

## 📦 PRODUCTS

### Get All Products
```http
GET /products?page=1&limit=20
```

### Get Single Product
```http
GET /products/:id
```

### Create Product (Admin)
```http
POST /products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Product Name",
  "slug": "product-name",
  "description": "Product description",
  "price": 999.99,
  "original_price": 1299.99,
  "category_id": 1,
  "stock": 100,
  "sku": "PROD-001",
  "images": ["url1", "url2"],
  "thumbnail": "url",
  "is_featured": true
}
```

### Update Product (Admin)
```http
PUT /products/:id
Authorization: Bearer {admin_token}
Content-Type: application/json
```

### Delete Product (Admin)
```http
DELETE /products/:id
Authorization: Bearer {admin_token}
```

---

## 📂 CATEGORIES

### Get All Categories
```http
GET /categories
```

### Get Single Category
```http
GET /categories/:id
```

### Create Category (Admin)
```http
POST /categories
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Category Name",
  "slug": "category-name",
  "description": "Category description",
  "image_url": "url",
  "parent_id": null
}
```

### Update Category (Admin)
```http
PUT /categories/:id
Authorization: Bearer {admin_token}
Content-Type: application/json
```

### Delete Category (Admin)
```http
DELETE /categories/:id
Authorization: Bearer {admin_token}
```

---

## 🔒 AUTHENTICATION HEADERS

All protected routes require:
```http
Authorization: Bearer {jwt_token}
```

Get token from login response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## ⚠️ ERROR RESPONSES

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error message"
}
```

---

## 📊 RESPONSE FORMATS

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 200,
      "per_page": 20
    }
  }
}
```

---

## 🧪 TESTING WITH CURL

### Example: Add to Cart
```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
```

### Example: Search Products
```bash
curl "http://localhost:5000/api/search?q=shirt&min_price=100&max_price=1000&sort_by=price_asc"
```

### Example: Upload Image
```bash
curl -X POST http://localhost:5000/api/upload/product-image \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

---

## 📝 NOTES

- All prices are in INR (Indian Rupees)
- All timestamps are in ISO 8601 format
- File uploads limited to 5MB per file
- JWT tokens expire after 7 days
- Pagination default: page=1, limit=20
- Search results are cached for performance

---

**API Version:** 1.0
**Last Updated:** 2024
**Total Endpoints:** 52+
