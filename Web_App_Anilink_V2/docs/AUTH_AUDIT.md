# Auth Features Audit (Phase 0) — COMPLETED

## Frontend – EXISTS
- **Login page**: `src/pages/login.tsx` ✓
- **"Forgot password?" link**: Links to `/forgot-password` ✓
- **"Continue with Google" button**: Present but `disabled` ✓
- **Auth API**: `src/api/auth.ts` – login, register, logout, getCurrentUser ✓
- **Auth store**: `src/store/authStore.ts` – login/register via api ✓
- **Route `/forgot-password`**: ✓
- **ForgotPasswordPage**: Exists; placeholder "Coming soon" ✗

## Frontend – MISSING
- Route `/reset-password`
- ResetPasswordPage component
- API: forgot password, verify token, reset password, Google login
- ForgotPasswordPage implementation (form + API call)
- Google OAuth wiring (button enabled + handler)

## Backend – EXISTS
- Auth router: `/v1/auth/*` (login, register, refresh, me, logout) ✓
- Auth service: login, register, refresh, logout ✓
- User model: password_hash, email, is_active ✓
- RefreshToken model ✓

## Backend – MISSING
- `POST /v1/auth/password/forgot`
- `POST /v1/auth/password/verify`
- `POST /v1/auth/password/reset`
- `POST /v1/auth/google`
- `password_reset_tokens` table
- User `google_id` column (for OAuth link/create)
- Email/mailer service + SMTP config
- `google-auth` package
