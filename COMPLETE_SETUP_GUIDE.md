# 🚀 COMPLETE SETUP GUIDE - ECOMMERCE PROJECT

## 📋 PROJECT STRUCTURE

```
Ecommerce/
├── backend/
│   ├── api/              ← PHP API endpoints
│   ├── config/           ← Database config
│   ├── includes/         ← Auth helpers
│   ├── .env              ← Environment variables
│   └── schema_postgres.sql
├── src/                  ← React frontend
└── public/               ← Product images
```

---

## 🗄️ DATABASE SETUP

### Database Details:
- **Type**: PostgreSQL
- **Name**: `ecommerce`
- **User**: `postgres`
- **Password**: `1234`
- **Port**: `5432`

### Step 1: Install PostgreSQL
1. Download: https://www.postgresql.org/download/windows/
2. Install PostgreSQL 16
3. During installation:
   - Set password: `1234`
   - Port: `5432`
   - Install pgAdmin 4

### Step 2: Create Database

**Option A - Using pgAdmin:**
1. Open pgAdmin 4
2. Connect to PostgreSQL (password: `1234`)
3. Right-click "Databases" → Create → Database
4. Name: `ecommerce`
5. Click Save

**Option B - Using psql:**
```bash
psql -U postgres
# Enter password: 1234
CREATE DATABASE ecommerce;
\q
```

### Step 3: Import Schema
1. Open pgAdmin 4
2. Click on `ecommerce` database
3. Tools → Query Tool
4. File → Open: `D:\Yash\Ecommerce\backend\schema_postgres.sql`
5. Click Execute (F5)
6. Verify 9 tables created

---

## 🔧 PHP BACKEND SETUP

### Step 1: Enable PostgreSQL in PHP
1. Open: `C:\xampp\php\php.ini`
2. Find these lines and remove `;`:
```ini
;extension=pgsql
;extension=pdo_pgsql
```
Change to:
```ini
extension=pgsql
extension=pdo_pgsql
```
3. Save file

### Step 2: Verify Backend Location
Your backend should be at:
```
C:\xampp\htdocs\Ecommerce\backend\
```

If not, copy `D:\Yash\Ecommerce\backend` to `C:\xampp\htdocs\Ecommerce\`

### Step 3: Start XAMPP
1. Open XAMPP Control Panel
2. Click **Start** on Apache
3. Wait for green "Running" status

### Step 4: Test Backend
Open browser: `http://localhost/Ecommerce/backend/api/products_pg.php`

Should see:
```json
{"success":true,"products":[...]}
```

---

## ⚛️ FRONTEND SETUP

### Step 1: Install Dependencies
```bash
cd D:\Yash\Ecommerce
npm install
```

### Step 2: Verify API URL
Check `src/services/api.ts`:
```typescript
const API_BASE = 'http://localhost/Ecommerce/backend/api';
```

### Step 3: Start Frontend
```bash
npm run dev
```

Should see:
```
➜  Local:   http://localhost:8080/
```

---

## ✅ VERIFICATION CHECKLIST

### Database:
- [ ] PostgreSQL installed
- [ ] Password set to `1234`
- [ ] Database `ecommerce` created
- [ ] Schema imported (9 tables)
- [ ] Can connect via pgAdmin

### Backend:
- [ ] PHP extensions enabled (`pgsql`, `pdo_pgsql`)
- [ ] Apache running in XAMPP
- [ ] Backend at `C:\xampp\htdocs\Ecommerce\backend\`
- [ ] Test URL works: `http://localhost/Ecommerce/backend/api/products_pg.php`

### Frontend:
- [ ] Dependencies installed (`npm install`)
- [ ] API URL correct in `api.ts`
- [ ] Frontend running: `npm run dev`
- [ ] Website opens: `http://localhost:8080`

---

## 🔑 DEFAULT CREDENTIALS

### PostgreSQL Database:
- Host: `localhost`
- Port: `5432`
- Database: `ecommerce`
- Username: `postgres`
- Password: `1234`

### Admin Login:
- Email: `admin@ecommerce.com`
- Password: `password`

### Test User:
- Register new account at `/register`

---

## 🧪 TESTING

### 1. Test Database Connection
Create: `C:\xampp\htdocs\test_db.php`
```php
<?php
$conn = pg_connect("host=localhost port=5432 dbname=ecommerce user=postgres password=1234");
if ($conn) {
    echo "✅ Database Connected!";
    $result = pg_query($conn, "SELECT COUNT(*) FROM users");
    $row = pg_fetch_row($result);
    echo "<br>Users in database: " . $row[0];
} else {
    echo "❌ Connection Failed!";
}
?>
```
Open: `http://localhost/test_db.php`

### 2. Test Backend API
```
http://localhost/Ecommerce/backend/api/products_pg.php
```
Should return JSON with products

### 3. Test Frontend
```
http://localhost:8080
```
Should show website

### 4. Test Registration
1. Go to: `http://localhost:8080/register`
2. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 1234567890
   - Password: password123
3. Click "Create Account"
4. Should redirect to login

### 5. Test Login
1. Go to: `http://localhost:8080/login`
2. Email: `test@example.com`
3. Password: `password123`
4. Should redirect to home

### 6. Test Admin Login
1. Go to: `http://localhost:8080/login`
2. Email: `admin@ecommerce.com`
3. Password: `password`
4. Should redirect to: `/admin`

---

## 🔧 TROUBLESHOOTING

### Problem: PostgreSQL won't start
**Solution:**
- Check if port 5432 is free
- Restart PostgreSQL service
- Check Windows Services

### Problem: PHP can't connect to PostgreSQL
**Solution:**
1. Verify `pgsql` extension enabled in `php.ini`
2. Restart Apache
3. Check database credentials in `config/database.php`

### Problem: Backend 404 error
**Solution:**
- Verify path: `C:\xampp\htdocs\Ecommerce\backend\`
- Check Apache is running
- Test: `http://localhost/Ecommerce/backend/api/products_pg.php`

### Problem: Frontend can't connect
**Solution:**
- Check API URL in `src/services/api.ts`
- Should be: `http://localhost/Ecommerce/backend/api`
- Restart frontend: `npm run dev`

### Problem: CORS error
**Solution:**
- Already fixed in all PHP files
- Restart Apache
- Clear browser cache (Ctrl+Shift+Delete)

---

## 📁 IMPORTANT FILES

### Backend:
- `backend/config/database.php` - Database connection
- `backend/.env` - Environment variables
- `backend/schema_postgres.sql` - Database schema
- `backend/api/login.php` - Login endpoint
- `backend/api/register.php` - Registration endpoint
- `backend/api/products_pg.php` - Products endpoint

### Frontend:
- `src/services/api.ts` - API service
- `src/pages/Login.tsx` - Login page
- `src/pages/Register.tsx` - Register page

---

## 🚀 DAILY STARTUP

### Every time you work:

1. **Start PostgreSQL** (if not auto-started)
   - Windows Services → PostgreSQL → Start

2. **Start Apache**
   - XAMPP Control Panel → Start Apache

3. **Start Frontend**
   ```bash
   cd D:\Yash\Ecommerce
   npm run dev
   ```

4. **Open Browser**
   - Frontend: `http://localhost:8080`
   - Backend Test: `http://localhost/Ecommerce/backend/api/products_pg.php`

---

## 📊 DATABASE TABLES

Your `ecommerce` database has 9 tables:

1. **users** - User accounts (admin & customers)
2. **products** - Product catalog
3. **product_images** - Multiple images per product
4. **categories** - Product categories
5. **orders** - Customer orders
6. **order_items** - Order line items
7. **cart** - Shopping cart
8. **wishlist** - User wishlists
9. **contact_messages** - Contact form

---

## 🎯 API ENDPOINTS

All endpoints: `http://localhost/Ecommerce/backend/api/`

### Authentication:
- `POST /login.php` - User/Admin login
- `POST /register.php` - User registration
- `POST /logout.php` - Logout

### Products:
- `GET /products_pg.php` - Get all products
- `GET /products_pg.php?id=1` - Get single product
- `POST /products_pg.php` - Create product (Admin)
- `PUT /products_pg.php` - Update product (Admin)
- `DELETE /products_pg.php?id=1` - Delete product (Admin)

### Cart (requires login):
- `GET /cart.php` - Get cart items
- `POST /cart.php` - Add to cart
- `DELETE /cart.php?id=1` - Remove from cart

### Orders (requires login):
- `GET /orders.php` - Get orders
- `POST /orders.php` - Place order

### Admin (admin only):
- `GET /admin-stats.php` - Dashboard statistics

---

## ✅ SUCCESS INDICATORS

### ✅ Database Working:
- pgAdmin shows `ecommerce` database
- 9 tables visible
- Admin user exists

### ✅ Backend Working:
- Apache running (green in XAMPP)
- `http://localhost/Ecommerce/backend/api/products_pg.php` returns JSON

### ✅ Frontend Working:
- `npm run dev` runs without errors
- `http://localhost:8080` shows website
- Can navigate pages

### ✅ Integration Working:
- Can register new user
- Can login
- Admin redirects to `/admin`
- User redirects to `/`

---

## 🎉 YOU'RE READY!

**Start working:**
1. Start PostgreSQL (auto-starts usually)
2. Start Apache (XAMPP)
3. Run `npm run dev`
4. Open `http://localhost:8080`

**Test login:**
- Admin: `admin@ecommerce.com` / `password`
- Or register new user

---

**Everything is configured! Just follow the startup steps! 🚀**
