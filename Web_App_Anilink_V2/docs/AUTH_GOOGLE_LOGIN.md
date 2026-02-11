# Google OAuth Login

## Overview

- User clicks "Continue with Google" on login page.
- Google popup → user signs in → frontend receives JWT credential.
- Frontend sends credential to `POST /v1/auth/google`.
- Backend verifies JWT, finds or creates user, returns access token.

## Backend Endpoint

### POST /v1/auth/google
**Body:** `{ "id_token": "<google_jwt>" }`  
**Response:** Same as login: `{ "accessToken", "refreshToken", "user" }`  
**Errors:** `400` for invalid token or missing email.

## curl Example

Cannot easily test with curl (requires real Google JWT). Use frontend or Postman.

## Setup

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project or select existing.
3. APIs & Services → Credentials → Create OAuth 2.0 Client ID.
4. Application type: **Web application**.
5. Authorized JavaScript origins: `http://localhost:5173` (and production URL).
6. Copy Client ID.

### 2. Environment Variables

**Backend (.env):**
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Frontend (.env):**
```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Important:** Use the **same** Client ID for both. The frontend uses it for the Google button; the backend uses it to verify the token audience.

### 3. Docker

Add to `docker-compose.yml` backend environment:
```yaml
environment:
  GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
```

Frontend:
```yaml
environment:
  VITE_GOOGLE_CLIENT_ID: ${VITE_GOOGLE_CLIENT_ID}
```

## Manual QA

1. Set `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` in env.
2. Restart frontend and backend.
3. Open `/login` → "Continue with Google" button should appear.
4. Click → Google sign-in popup.
5. Sign in → should redirect to role home, logged in.
6. New user (new email) → creates user with role OWNER.
7. Existing user → links account, returns same user.
