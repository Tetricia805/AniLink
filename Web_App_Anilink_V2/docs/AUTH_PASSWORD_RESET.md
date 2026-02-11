# Password Reset Flow

## Overview

- **Forgot password**: User submits email → backend creates token → email sent with link (or logged in dev)
- **Reset password**: User opens link → frontend verifies token → user sets new password → backend updates

## Backend Endpoints

### POST /v1/auth/password/forgot
**Body:** `{ "email": "user@example.com" }`  
**Response:** `200 { "message": "If that email exists, we sent a reset link." }`  
Always returns 200; never reveals if email exists.

### POST /v1/auth/password/verify
**Body:** `{ "token": "<reset_token>" }`  
**Response:** `200 { "valid": true }` or `200 { "valid": false }`

### POST /v1/auth/password/reset
**Body:** `{ "token": "<reset_token>", "new_password": "newpass123" }`  
**Response:** `200 { "message": "Password updated" }`  
**Errors:** `400` for invalid/expired token or password too short.

## curl Examples

```bash
# Forgot password
curl -X POST http://localhost:8000/v1/auth/password/forgot \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com"}'

# Verify token (replace TOKEN with actual value from email/dev log)
curl -X POST http://localhost:8000/v1/auth/password/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN"}'

# Reset password
curl -X POST http://localhost:8000/v1/auth/password/reset \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN","new_password":"newpass123"}'
```

## Environment (Backend)

| Variable   | Description                    |
|------------|--------------------------------|
| SMTP_HOST  | SMTP server (e.g. smtp.gmail.com) |
| SMTP_PORT  | Port (default 587)             |
| SMTP_USER  | SMTP username                  |
| SMTP_PASS  | SMTP password                  |
| SMTP_FROM  | From address                   |
| FRONTEND_URL | Base URL for reset links (e.g. http://localhost:5173) |

**Dev without SMTP:** Reset link is printed to backend console.

## Manual QA

1. Go to `/forgot-password`, enter `owner@example.com`, submit.
2. Check backend logs for reset URL (or email if SMTP configured).
3. Open URL in browser → should show "Set new password" form.
4. Enter new password (min 8 chars), confirm, submit.
5. Should redirect to `/login` with toast.
6. Login with new password.
7. Reuse same token → should fail (token used).
