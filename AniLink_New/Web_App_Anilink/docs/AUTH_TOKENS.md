# AniLink Auth Tokens

## Overview

AniLink uses JWT access tokens with refresh token support. Access tokens are short-lived; refresh tokens are stored server-side and used to obtain new access tokens.

## Token Types

| Token | Expiry | Storage | Purpose |
|-------|--------|---------|---------|
| **Access** | 15 min | localStorage (`anilink.accessToken`) | Bearer auth for API requests |
| **Refresh** | 30 days | localStorage (`anilink.refreshToken`) | Obtain new access token when expired |

## Backend (python-jose)

- **Access token**: JWT with `sub` (user_id), `type: "access"`, `exp`
- **Refresh token**: JWT with `sub`, `type: "refresh"`, `exp` + stored hash in `refresh_tokens` table
- **Config**: `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES=15`, `REFRESH_TOKEN_EXPIRE_DAYS=30`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /v1/auth/login | Returns `accessToken`, `refreshToken`, `user` |
| POST | /v1/auth/register | Same |
| POST | /v1/auth/refresh | Body: `{ refreshToken }` → new access + refresh tokens |
| POST | /v1/auth/logout | Body: `{ refreshToken }` → revokes refresh token |

## Frontend Flow

1. **Request**: axios interceptor adds `Authorization: Bearer ${accessToken}`
2. **401 response**: Interceptor calls `POST /auth/refresh` with stored refresh token
3. **On success**: Stores new tokens, retries original request once
4. **On failure**: Clears tokens; user must re-login

## Logout

- Frontend calls `POST /auth/logout` with refresh token
- Backend sets `revoked_at` on the refresh token record
- Frontend clears `localStorage` (access + refresh + user)

## Security Notes

- Tokens are in localStorage (XSS exposure). For stronger security, consider HttpOnly cookies for refresh token in production.
- Access token is not stored server-side; it is verified by signature only.
- Refresh tokens are hashed before storage; only the hash is kept in DB.
