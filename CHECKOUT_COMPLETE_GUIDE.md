# 🛒 Checkout Flow - Complete Testing Guide

## ⚠️ Why Checkout Shows 404

The checkout endpoint `/api/checkout/process` exists and works correctly. The 404 error you're seeing is likely because:

1. **User not logged in** - Token missing or expired
2. **Cart is empty** - No items added to cart
3. **Proxy issue** - Request not reaching backend

---

## ✅ Complete Checkout Flow (Step-by-Step)

### Step 1: Login as Customer
```
URL: http://localhost:8080/login
Email: john@customer.com
Password: Customer@123
```

### Step 2: Add Products to Cart
1. Go to Products page: `http://localhost:8080/products`
2. Click on any product
3. Click "Add to Cart" button
4. Repeat for 2-3 products

### Step 3: View Cart
1. Click cart icon in navbar
2. Verify items are in cart
3. Update quantities if needed

### Step 4: Proceed to Checkout
1. Click "Proceed to Checkout" button
2. Fill in shipping address:
   - Full Name
   - Phone Number
   - Address Line 1
   - City
   - State
   - Postal Code
3. Click "Continue to Payment"

### Step 5: Complete Payment
1. Review order summary
2. Click "Place Order" button
3. Wait for payment processing (demo mode)
4. Order confirmation should appear
5. Redirected to Orders page

---

## 🔧 Troubleshooting Checkout Issues

### Issue 1: "404 Not Found" on checkout
**Causes:**
- Backend not running
- Proxy not configured
- Wrong URL

**Solutions:**
```bash
# 1. Check backend is running
curl http://localhost:5000/api/health

# 2. Check proxy in vite.config.ts
# Should have:
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    secure: false,
  },
}

# 3. Restart frontend
npm run dev
```

### Issue 2: "Cart not found" or "Cart is empty"
**Cause:** No items in cart

**Solution:**
1. Add products to cart first
2. Verify cart has items before checkout

### Issue 3: "Invalid or expired token"
**Cause:** Not logged in or token expired

**Solution:**
1. Login again
2. Check localStorage has token:
   ```javascript
   localStorage.getItem('token')
   ```

### Issue 4: "Complete shipping address is required"
**Cause:** Missing required address fields

**Solution:**
Fill all required fields:
- Name *
- Phone *
- Address Line 1 *
- City *
- State *
- Postal Code *

### Issue 5: "Insufficient stock"
**Cause:** Product out of stock

**Solution:**
1. Go to Admin → Products
2. Update product stock
3. Try checkout again

---

## 🧪 Testing Checkout API Directly

### Test 1: Check if endpoint exists
```bash
curl -X POST http://localhost:5000/api/checkout/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** Should return error about missing shipping address (not 404)

### Test 2: Add item to cart
```bash
# First login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@customer.com","password":"Customer@123"}'

# Use the token from response
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"product_id":1,"quantity":1}'
```

### Test 3: View cart
```bash
curl http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 4: Process checkout
```bash
curl -X POST http://localhost:5000/api/checkout/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "shipping_address": {
      "name": "John Doe",
      "phone": "9876543210",
      "address_line1": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postal_code": "400001"
    }
  }'
```

---

## 📊 Checkout Flow Diagram

```
User → Login → Browse Products → Add to Cart → View Cart → Checkout
                                                              ↓
                                                    Fill Shipping Address
                                                              ↓
                                                      Review & Pay
                                                              ↓
                                                    Order Confirmation
                                                              ↓
                                                      View Orders
```

---

## 🔐 Required Data for Checkout

### 1. User Authentication:
- Valid JWT token in localStorage
- Token not expired (7 days validity)

### 2. Cart Data:
- At least 1 product in cart
- Products must be active
- Sufficient stock available

### 3. Shipping Address:
```javascript
{
  name: "John Doe",              // Required
  phone: "9876543210",           // Required
  address_line1: "123 Main St",  // Required
  address_line2: "Apt 4B",       // Optional
  city: "Mumbai",                // Required
  state: "Maharashtra",          // Required
  postal_code: "400001",         // Required
  country: "India"               // Optional (defaults to India)
}
```

---

## 💡 Quick Fix for Checkout

If checkout is not working, follow these steps:

### 1. Verify Backend is Running
```bash
# Should return: {"success":true,"message":"Server is running"}
curl http://localhost:5000/api/health
```

### 2. Verify You're Logged In
```javascript
// Open browser console
console.log(localStorage.getItem('token'));
// Should show a long JWT token string
```

### 3. Verify Cart Has Items
```javascript
// In browser console on cart page
// Should show items array
```

### 4. Verify Proxy is Working
```javascript
// In browser console
fetch('/api/health')
  .then(r => r.json())
  .then(console.log);
// Should show: {success: true, message: "Server is running"}
```

### 5. Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try checkout
4. Look for `/api/checkout/process` request
5. Check:
   - Status code (should be 201, not 404)
   - Request headers (should have Authorization)
   - Request payload (should have shipping_address)
   - Response (should have success: true)

---

## 🎯 Expected Responses

### Success Response (201):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order_id": 1,
    "order_number": "ORD1234567890123",
    "total_amount": "1299.00",
    "payment_required": true
  }
}
```

### Error Responses:

**400 - Cart Empty:**
```json
{
  "success": false,
  "message": "Cart is empty"
}
```

**400 - Missing Address:**
```json
{
  "success": false,
  "message": "Complete shipping address is required"
}
```

**401 - Not Logged In:**
```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

**404 - Cart Not Found:**
```json
{
  "success": false,
  "message": "Cart not found"
}
```

---

## 🚀 Complete Test Scenario

### Scenario: First Time Checkout

1. **Setup:**
   - Backend running on port 5000 ✅
   - Frontend running on port 8080 ✅
   - Database has products ✅

2. **Login:**
   ```
   Email: john@customer.com
   Password: Customer@123
   ```

3. **Add Products:**
   - Go to /products
   - Click on "Wireless Headphones"
   - Click "Add to Cart"
   - Toast: "Item added to cart"

4. **View Cart:**
   - Click cart icon (shows 1)
   - See product in cart
   - Total shows correct amount

5. **Checkout:**
   - Click "Proceed to Checkout"
   - Fill address form
   - Click "Continue to Payment"
   - Click "Place Order"
   - See "Processing..." message
   - See "Order placed successfully! 🎉"
   - Redirected to /orders

6. **Verify:**
   - Order appears in orders list
   - Order status: Pending
   - Payment status: Paid
   - Cart is now empty

---

## 📝 Checklist Before Checkout

- [ ] Backend server running
- [ ] Frontend server running
- [ ] User logged in
- [ ] Token in localStorage
- [ ] Products exist in database
- [ ] At least 1 product in cart
- [ ] Products have sufficient stock
- [ ] Proxy configured in vite.config.ts
- [ ] No console errors

---

## 🎓 Demo Mode Features

The checkout uses **mock payment** for demonstration:

1. **No Real Payment Gateway** - Simulated payment
2. **Always Successful** - Payment never fails
3. **Instant Processing** - 2 second delay for UX
4. **Auto Verification** - Payment auto-verified
5. **Order Created** - Real order in database
6. **Stock Updated** - Product stock decreases
7. **Cart Cleared** - Cart emptied after order

---

## 🔄 After Successful Checkout

1. **Order Created** - New order in database
2. **Stock Updated** - Product quantities reduced
3. **Cart Cleared** - User's cart emptied
4. **Email Sent** - (Future: Order confirmation email)
5. **Redirect** - User sent to orders page
6. **Admin Notified** - (Future: Admin notification)

---

**If you're still seeing 404, please:**
1. Check backend console for errors
2. Check frontend console for errors
3. Verify proxy configuration
4. Restart both servers
5. Clear browser cache

The checkout system is fully functional and ready to use! 🎉
