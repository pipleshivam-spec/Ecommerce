# 🔑 FIX POSTGRESQL PASSWORD

## Problem:
PostgreSQL password doesn't match `.env` file

## Solution - Choose ONE:

### Option 1: Update .env to match PostgreSQL password

If your PostgreSQL password is different from `1234`:

1. Open: `backend/.env`
2. Change line:
```
DB_PASSWORD=1234
```
To your actual PostgreSQL password (the one you set during installation)

### Option 2: Reset PostgreSQL password to 1234

1. Open Command Prompt as Administrator
2. Run:
```bash
psql -U postgres
# Enter current password
ALTER USER postgres WITH PASSWORD '1234';
\q
```

### Option 3: Find your PostgreSQL password

Check these locations:
- Installation notes
- pgAdmin saved connections
- Windows Credential Manager

---

## Quick Test:

Try connecting with psql:
```bash
psql -U postgres -d ecommerce
# If it asks for password, enter it
# If it connects, that's your password!
```

---

## After fixing password:

1. Update `backend/.env` with correct password
2. Restart Node.js backend:
```bash
npm run dev
```

Should see: `✅ Connected to PostgreSQL database`
