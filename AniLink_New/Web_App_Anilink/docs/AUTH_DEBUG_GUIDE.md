# Authentication Debug Guide

## 🔍 Current Issue

The app shows `ERROR[null]` when trying to login/register, which indicates:
- Connection is failing (not reaching backend)
- OR CORS error (browser blocking request)
- OR Backend not accessible from browser

---

## ✅ Fixes Applied

### 1. Enhanced Error Logging ✅
- Added detailed error logging in `dio_client.dart`
- Shows error type, message, and connection details
- Will help identify the exact issue

### 2. Improved Navigation ✅
- Added `ref.listen` pattern for reactive navigation
- Navigation happens when auth state actually changes
- Better error messages shown to user

### 3. Router Redirect Fix ✅
- Added `/permissions` route to allowed routes
- Prevents redirect loop after successful auth

---

## 🧪 How to Debug

### Step 1: Check Backend is Running

```bash
cd backend
docker-compose ps
```

Should show all services as "Up" or "healthy".

### Step 2: Test Backend Directly

Open browser and go to:
- http://localhost:8000/health
- Should show: `{"status":"healthy"}`

### Step 3: Check Flutter Console

After clicking Login/Register, you should see:
```
REQUEST[POST] => PATH: /auth/register
REQUEST BASE URL: http://localhost:8000/v1
REQUEST HEADERS: {...}
REQUEST DATA: {...}
ERROR TYPE: DioExceptionType.connectionError  // or other
ERROR MESSAGE: Connection failed...
```

This will tell us exactly what's wrong.

---

## 🐛 Common Issues & Solutions

### Issue 1: "Connection Error" / "ERR_CONNECTION_REFUSED"

**Problem:** Browser can't reach backend

**Solutions:**
1. **For Chrome/Edge (Web):**
   - Backend must be accessible from browser
   - Check: http://localhost:8000/health works
   - If not, backend not running or port blocked

2. **Check Backend Logs:**
   ```bash
   docker-compose logs -f backend
   ```
   - Should show incoming requests
   - If not, backend not receiving requests

3. **CORS Issue:**
   - Update `docker-compose.yml` CORS_ORIGINS
   - Restart: `docker-compose restart backend`

### Issue 2: "CORS Error" in Browser Console

**Problem:** Browser blocking cross-origin request

**Solution:**
1. Check backend CORS configuration
2. Ensure `CORS_ORIGINS` includes `http://localhost:*`
3. Restart backend: `docker-compose restart backend`

### Issue 3: Navigation Not Working

**Problem:** After login, doesn't navigate

**Fixed:** Now uses `ref.listen` to react to state changes
- Navigation happens automatically when `isAuthenticated` becomes true

---

## 📋 Testing Checklist

### Test Login Flow:
1. [ ] Backend is running (`docker-compose ps`)
2. [ ] Backend health check works (http://localhost:8000/health)
3. [ ] Open app in Chrome/Edge
4. [ ] Navigate to Login
5. [ ] Enter credentials (use seeded account: owner@example.com / password123)
6. [ ] Click Login
7. [ ] Check Flutter console for request details
8. [ ] Check backend logs: `docker-compose logs -f backend`
9. [ ] Should navigate to `/permissions` on success
10. [ ] Should show error message if failed

### Expected Console Output:

**Success:**
```
REQUEST[POST] => PATH: /auth/login
REQUEST BASE URL: http://localhost:8000/v1
REQUEST DATA: {email: ..., password: ...}
RESPONSE[200] => PATH: /auth/login
RESPONSE DATA: {accessToken: ..., refreshToken: ..., user: {...}}
```

**Failure:**
```
REQUEST[POST] => PATH: /auth/login
ERROR TYPE: DioExceptionType.connectionError
ERROR MESSAGE: Connection failed to http://localhost:8000/v1/auth/login
CONNECTION ERROR: Cannot connect to backend at http://localhost:8000/v1
```

---

## 🔧 Quick Fixes

### If Connection Error:

1. **Check backend:**
   ```bash
   cd backend
   docker-compose ps
   docker-compose logs backend | tail -20
   ```

2. **Restart backend:**
   ```bash
   docker-compose restart backend
   ```

3. **Check port 8000:**
   ```bash
   netstat -an | findstr :8000  # Windows
   ```

### If CORS Error:

1. **Update docker-compose.yml:**
   ```yaml
   CORS_ORIGINS: http://localhost:*,http://127.0.0.1:*
   ```

2. **Restart:**
   ```bash
   docker-compose restart backend
   ```

---

## ✅ Status After Fixes

1. ✅ Enhanced error logging - Will show exact error
2. ✅ Better navigation - Uses reactive listener
3. ✅ Router redirect fixed - Permissions route allowed
4. ✅ Error messages shown to user

**Next:** Run the app and check console output to see what the actual error is!
