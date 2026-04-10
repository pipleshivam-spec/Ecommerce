# Testing Guide - Profile & Admin Dashboard

## 🧪 How to Test the New Features

### Prerequisites:
1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 8080
3. ✅ PostgreSQL database running
4. ✅ Vite proxy configured

---

## 1️⃣ Test User Profile Dashboard

### Step 1: Login as Customer
1. Go to `http://localhost:8080/login`
2. Use credentials:
   - Email: `john@customer.com`
   - Password: `Customer@123`
3. Click Login

### Step 2: Access Profile
1. After login, click the **User icon** in the top-right navbar
2. You should be redirected to `/profile`
3. You should see:
   - ✅ Your profile header with avatar (first letter of name)
   - ✅ User info (name, email, phone)
   - ✅ 4 stat cards (Orders, Pending, Delivered, Wishlist)
   - ✅ Tabbed interface (Overview, Orders, Addresses, Settings)

### Step 3: Test Features
- Click on **Total Orders** card → Should navigate to `/orders`
- Click on **Wishlist** card → Should navigate to `/wishlist`
- Click **Logout** button → Should logout and redirect to login
- Switch between tabs → Should show different content

---

## 2️⃣ Test Admin Dashboard

### Step 1: Login as Admin
1. Go to `http://localhost:8080/admin/login`
2. Use credentials:
   - Email: `admin@ecommerce.com`
   - Password: `Admin@123`
3. Click Login

### Step 2: View Dashboard
1. After login, you should be at `/admin`
2. You should see:
   - ✅ 4 stat cards with REAL numbers from database:
     - Total Products
     - Total Categories
     - Total Users
     - Total Orders
   - ✅ Revenue Overview card with total revenue
   - ✅ Recent Orders table (if orders exist)

### Step 3: Verify Real Data
- Numbers should match your database
- If no orders exist, you'll see "No orders yet"
- All data is fetched from PostgreSQL

---

## 3️⃣ Test Error Handling

### Test 1: Access Profile Without Login
1. Logout if logged in
2. Try to go to `http://localhost:8080/profile`
3. ✅ Should redirect to `/login` with error message

### Test 2: Access Admin Without Login
1. Logout if logged in
2. Try to go to `http://localhost:8080/admin`
3. ✅ Should redirect to `/admin/login` with error message

### Test 3: Access Admin as Regular User
1. Login as customer (`john@customer.com`)
2. Try to go to `http://localhost:8080/admin`
3. ✅ Should show "Unauthorized" error

---

## 4️⃣ Test Navigation

### Test User Icon in Navbar
1. **When NOT logged in:**
   - Click user icon → Should go to `/login`
   
2. **When logged in:**
   - Click user icon → Should go to `/profile`

---

## 🐛 Troubleshooting

### Issue: "Failed to load profile" or 404 error
**Solution:**
1. Check if backend is running: `http://localhost:5000/api/health`
2. Check if you're logged in: Open DevTools → Application → Local Storage → Check for `token`
3. Verify proxy is working: Check Network tab in DevTools

### Issue: "Unauthorized" or 401 error
**Solution:**
1. Your token might be expired
2. Logout and login again
3. Clear localStorage: `localStorage.clear()` in console

### Issue: Admin dashboard shows 0 for everything
**Solution:**
1. Your database might be empty
2. Add some products and create test orders
3. Refresh the dashboard

### Issue: Profile shows wrong data
**Solution:**
1. Check which user you're logged in as
2. Verify token in localStorage matches the user
3. Try logout and login again

---

## ✅ Expected Results

### User Profile:
- Shows correct user information
- Stats reflect actual orders from database
- All navigation works
- Logout works properly

### Admin Dashboard:
- Shows real numbers from database
- Recent orders table populated (if orders exist)
- Revenue calculations are correct
- All data updates when database changes

---

## 📊 Sample Test Data

If you need test data, you can:

1. **Create test orders:**
   - Login as customer
   - Add products to cart
   - Complete checkout
   - Go back to admin dashboard to see stats update

2. **Create test users:**
   - Register new users at `/register`
   - Check admin dashboard to see user count increase

---

## 🎯 Success Criteria

✅ User can view their profile with real data
✅ User can see their order statistics
✅ Admin can view dashboard with real database stats
✅ All navigation works correctly
✅ Error handling works (redirects, messages)
✅ No hardcoded data anywhere
✅ All API calls use relative URLs through proxy

---

**Everything should work smoothly now!** 🚀

If you encounter any issues, check:
1. Backend console for errors
2. Frontend console for errors
3. Network tab for failed requests
4. Database for data
