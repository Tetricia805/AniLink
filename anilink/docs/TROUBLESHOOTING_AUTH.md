# Authentication Troubleshooting

## 🐛 Current Issue: Login/Register Failing

**Symptoms:**
- `ERROR[null] => PATH: /auth/register`
- `ERROR[null] => PATH: /auth/login`
- Cannot log in or register

**Root Cause:** Connection error - backend not reachable OR CORS issue

---

## ✅ Fixes Applied

### 1. Enhanced Error Logging
- Added detailed error logging to see exact issue
- Shows error type, message, and connection details

### 2. Improved Navigation Flow
- Uses `ref.listen` pattern for reactive navigation
- Navigation happens when auth state actually changes
- Fixed router redirect to allow `/permissions` route

### 3. Better Error Messages
- User sees clear error messages
- Errors displayed in SnackBar with red background

---

## 🔍 Debugging Steps

### Step 1: Check Enhanced Logs

When you try to login/register, check Flutter console for:

```
REQUEST[POST] => PATH: /auth/login
REQUEST BASE URL: http://localhost:8000/v1
ERROR TYPE: DioExceptionType.connectionError  ← This will tell us the issue
ERROR MESSAGE: Connection failed...
CONNECTION ERROR: Cannot connect to backend at http://localhost:8000/v1
```

### Step 2: Verify Backend is Running

```bash
cd backend
docker-compose ps
```

All services should show "Up" or "healthy".

### Step 3: Test Backend Directly

Open in browser:
- http://localhost:8000/health
- http://localhost:8000/docs

If these don't work, backend isn't accessible.

### Step 4: Check Backend Logs

```bash
cd backend
docker-compose logs -f backend
```

Then try login/register in app - should see requests in logs.

---

## 🔧 Common Solutions

### Solution 1: Browser CORS Issue

**If you see CORS error in browser console:**

1. Update `backend/docker-compose.yml`:
   ```yaml
   CORS_ORIGINS: http://localhost:*,http://127.0.0.1:*,http://localhost:8000
   ```

2. Restart backend:
   ```bash
   docker-compose restart backend
   ```

### Solution 2: Backend Not Accessible

**If backend logs show no requests:**

1. Check if backend is listening:
   ```bash
   docker-compose logs backend | grep "Application startup complete"
   ```

2. Check port 8000 is not blocked

3. Try accessing http://localhost:8000/health in browser

### Solution 3: Connection Timeout

**If you see timeout errors:**

1. Check backend is healthy:
   ```bash
   docker-compose ps
   ```

2. Increase timeout in `api_config.dart`:
   ```dart
   static const Duration connectTimeout = Duration(seconds: 60);
   ```

---

## 🧪 Test with Seeded Account

Backend has seeded accounts:
- **Owner:** owner@example.com / password123
- **Vet:** vet@example.com / password123
- **Seller:** seller@example.com / password123

Try logging in with these credentials.

---

## ✅ Expected Behavior After Fixes

1. **Enhanced Logging:**
   - Console shows detailed request/response info
   - Errors show exact type and message

2. **Better Navigation:**
   - After successful login → navigates to `/permissions`
   - After permissions → navigates to `/home`
   - Router automatically redirects based on auth state

3. **Error Handling:**
   - User sees clear error messages
   - Loading states shown during requests

---

## 🚀 Next Steps

1. **Run the app again:**
   ```bash
   flutter run
   ```

2. **Try to login/register**

3. **Check console output** - the enhanced logging will show exactly what's wrong

4. **Share the console output** if still having issues

The enhanced logging will tell us:
- ✅ If it's a connection error
- ✅ If it's a CORS error
- ✅ If it's a backend error
- ✅ If it's a request format issue
