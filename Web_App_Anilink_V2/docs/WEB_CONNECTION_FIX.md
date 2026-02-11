# Flutter Web Connection Fix

## Issue
Flutter web running in Chrome cannot connect to backend due to CORS restrictions.

## Solution Applied

### 1. Platform-Aware API Configuration ✅
- Updated `api_config.dart` to detect platform automatically
- Uses appropriate URL for web, Android, iOS, and desktop

### 2. Enhanced CORS Configuration ✅
- Updated backend to handle wildcard localhost origins
- Allows all ports on localhost for development
- Pattern: `http://localhost:*` matches any port

### 3. Restart Backend Required ⚠️

After making these changes, **restart your backend**:

```bash
cd backend
docker-compose restart backend
```

## Testing

1. **Check Backend is Running:**
   ```bash
   cd backend
   docker-compose ps
   ```

2. **Test Backend Health:**
   Open in browser: http://localhost:8000/health
   Should return: `{"status":"healthy"}`

3. **Run Flutter App:**
   ```bash
   flutter run -d chrome
   ```

4. **Try Login/Register:**
   - Should now connect successfully
   - Check console for request logs

## Alternative Fix (If Still Not Working)

If you still see CORS errors:

1. **Use 127.0.0.1 instead of localhost:**
   In `api_config.dart`, change:
   ```dart
   return 'http://127.0.0.1:8000/v1';
   ```

2. **Check Browser Console:**
   Look for CORS error messages
   Usually shows which origin is blocked

3. **Manual CORS Test:**
   Open browser console and run:
   ```javascript
   fetch('http://localhost:8000/health')
     .then(r => r.json())
     .then(console.log)
     .catch(console.error)
   ```

## Troubleshooting

### "Connection Refused"
- Backend not running → `docker-compose up -d`
- Wrong port → Check backend logs

### "CORS Error"
- Backend CORS not configured → Restart backend
- Wrong origin → Check Flutter web URL in browser address bar

### "Network Error"
- Backend not accessible → Check firewall/antivirus
- Docker networking issue → Restart Docker
