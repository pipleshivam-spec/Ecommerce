# 🚀 QUICK START GUIDE - Ecommerce Platform

## ⚡ Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd backend
npm install razorpay
```

### Step 2: Setup Database
```bash
# Create database
createdb ecommerce

# Run migration
psql -U postgres -d ecommerce -f backend/database/schema_production.sql
```

### Step 3: Configure Environment
```bash
# backend/.env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=Yash@#$2018
DB_NAME=ecommerce
DB_PORT=5432

JWT_SECRET=your_super_secret_jwt_key

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

PORT=5000
NODE_ENV=development
```

### Step 4: Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Step 5: Test the Platform
```
Frontend: http://localhost:8080
Backend:  http://localhost:5000
Admin:    http://localhost:8080/admin
```

---

## 🔑 Login Credentials

### Admin
```
Email: admin@ecommerce.com
Password: Admin@123
```

### Customer
```
Email: john@customer.com
Password: Customer@123
```

---

## 📡 API Testing

### Test Cart API
```bash
# Get cart
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/cart

# Add to cart
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}' \
  http://localhost:5000/api/cart/add
```

### Test Checkout API
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shipping_address": {
      "name": "John Doe",
      "phone": "9876543210",
      "address_line1": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postal_code": "400001"
    }
  }' \
  http://localhost:5000/api/checkout/process
```

---

## 🎯 Key Features Implemented

✅ **Cart System**
- Add/Remove items
- Update quantities
- Persistent storage
- Stock validation

✅ **Checkout System**
- Address validation
- Order creation
- Stock management
- Order history

✅ **Payment Integration**
- Razorpay gateway
- Secure verification
- Payment tracking
- Order confirmation

---

## 📁 Important Files

### Backend
```
backend/controllers/cartController.js       - Cart logic
backend/controllers/checkoutController.js   - Checkout logic
backend/controllers/paymentController.js    - Payment logic
backend/database/schema_production.sql      - Database schema
backend/server.js                           - Main server
```

### Documentation
```
COMPLETE_IMPLEMENTATION.md  - Full implementation details
CREDENTIALS.md              - All login credentials
UPGRADE_PLAN.md             - Backend architecture
UI_UPGRADE_PLAN.md          - Frontend design system
```

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Verify credentials
psql -U postgres -d ecommerce
```

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change port in .env
PORT=5001
```

### JWT Token Invalid
```bash
# Clear browser localStorage
localStorage.clear()

# Login again to get new token
```

---

## 📊 Database Tables

```
users          - User accounts
categories     - Product categories
products       - Product catalog
cart           - Shopping carts
cart_items     - Cart items
orders         - Customer orders
order_items    - Order line items
payments       - Payment records
reviews        - Product reviews (schema ready)
addresses      - User addresses (schema ready)
wishlist       - User wishlists (schema ready)
```

---

## 🔗 API Endpoints

### Cart
```
GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/update/:itemId
DELETE /api/cart/remove/:itemId
DELETE /api/cart/clear
```

### Checkout
```
POST /api/checkout/process
GET  /api/checkout/order/:orderId
GET  /api/checkout/orders
PUT  /api/checkout/order/:orderId/cancel
```

### Payment
```
POST /api/payment/create-order
POST /api/payment/verify
POST /api/payment/failure
```

---

## 🎨 Frontend Integration

### Update API Service
```typescript
// src/services/api.ts
const API_BASE = 'http://localhost:5000/api';

export const cartAPI = {
  getCart: () => fetch(`${API_BASE}/cart`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  
  addToCart: (productId, quantity) => 
    fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product_id: productId, quantity })
    })
};
```

---

## 🚀 Next Steps

1. **Test Current Features**
   - Register new user
   - Add products to cart
   - Complete checkout
   - Make payment

2. **Implement Reviews**
   - Create review controller
   - Build review UI
   - Add rating system

3. **Add Search**
   - Implement search API
   - Create search page
   - Add filters

4. **Deploy**
   - Setup hosting
   - Configure domain
   - Enable SSL

---

## 📞 Support

**Documentation:**
- `COMPLETE_IMPLEMENTATION.md` - Full details
- `CREDENTIALS.md` - Login info
- `UPGRADE_PLAN.md` - Architecture

**Need Help?**
- Check documentation files
- Review API endpoints
- Test with provided credentials

---

**🎉 Your ecommerce platform is ready to use!**

**Current Status:** 36% Complete (4/11 Phases)
**Next Priority:** Reviews System

**Happy Coding! 🚀**
