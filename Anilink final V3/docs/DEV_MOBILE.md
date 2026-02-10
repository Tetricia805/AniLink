# AniLink Mobile (Expo) – Development

## Overview

The mobile app lives in **`apps/mobile`**. It uses the same FastAPI backend as the web app. Run the backend (and optionally the web app) via Docker; run the Expo app **on your machine**, not in Docker.

## Why not run Expo in Docker?

Expo dev server needs to serve the bundle to your phone/emulator and receive hot reload. Running it inside Docker adds network complexity (connecting device/emulator to the container) and often breaks the Expo Go / dev client connection. Running Expo locally with `npm run start` is the standard and most reliable setup.

## 1. Start the backend (and web) with Docker

From the **repo root**:

```bash
docker compose up -d --build db minio backend
# Optional: add frontend for web
docker compose up -d --build db minio backend frontend
```

- Backend: `http://localhost:8000`
- API base path: `http://localhost:8000/v1`

## 2. Run the mobile app (Expo)

From the **repo root**:

```bash
cd apps/mobile
npm install
npm run start
```

Then:

- Press **`a`** for Android emulator  
- Press **`i`** for iOS simulator  
- Or scan the QR code with **Expo Go** on a physical device (same Wi‑Fi as your machine)

## 3. API base URL (no localhost on device)

The app reads **`EXPO_PUBLIC_API_URL`**. Set it so the device/emulator can reach your backend.

| Environment              | API URL (example)        |
|---------------------------|--------------------------|
| **Android emulator**      | `http://10.0.2.2:8000/v1` |
| **iOS simulator**         | `http://localhost:8000/v1` |
| **Physical phone (same LAN)** | `http://<YOUR_PC_IP>:8000/v1` (e.g. `http://192.168.1.100:8000/v1`) |

Create `apps/mobile/.env` (or set env before `npm run start`):

```bash
# Android emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/v1

# iOS simulator (use when running on simulator)
# EXPO_PUBLIC_API_URL=http://localhost:8000/v1

# Physical device (replace with your machine’s LAN IP)
# EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/v1
```

- **10.0.2.2** is the Android emulator’s alias for the host machine’s `localhost`.
- **Physical device**: use your computer’s LAN IP so the phone can reach the backend. Ensure firewall allows port 8000.

Restart Expo after changing `.env` (`npm run start`).

## 4. CORS

The backend is already set up to allow all origins in DEBUG. If you run the backend with `DEBUG=true`, Expo (and Expo Go) origins are accepted. For a physical device, the request comes from the device IP; the backend’s CORS config in debug mode allows it.

## 5. Shared package

Types and status mappings are in **`packages/shared`**. The mobile app depends on it via `"@anilink/shared": "file:../../packages/shared"`. After pulling or changing `packages/shared`, run from `apps/mobile`:

```bash
npm install
```

## 6. First-time setup: assets

Expo expects:

- `apps/mobile/assets/icon.png`
- `apps/mobile/assets/splash-icon.png`
- `apps/mobile/assets/adaptive-icon.png`

If they are missing, add them (e.g. 1024×1024 for icon) or copy from a fresh `create-expo-app` template. Otherwise the app may fail to load or show a default icon.

## 7. Quick checklist

1. Backend: `docker compose up -d db minio backend` (from repo root).  
2. Set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` for your target (emulator/simulator/phone).  
3. From `apps/mobile`: `npm install` then `npm run start`.  
4. Open on emulator/simulator or Expo Go; log in with seed user (e.g. `owner@example.com` / `password123`).

## 8. Seed users (from backend seed script)

- Owner: `owner@example.com` / `password123`  
- Vet: `vet@example.com` / `password123`  
- Seller: `seller@example.com` / `password123`  
- Admin: `admin@example.com` / `password123`

Same as web; use these to test role-based tabs and API access.

## 9. Design system (mobile UI)

The mobile app uses a **design system** aligned with the web app (AniLink branding: primary green `#10b981`, cards, spacing, badges).

**Entry points:**

- **Theme:** `apps/mobile/src/theme/theme.ts`  
  Defines `colors`, `spacing`, `radius`, `shadows`, and `paperTheme` (React Native Paper MD3 override). The app wraps with `<PaperProvider theme={paperTheme}>` in `App.tsx`.

- **Screen wrapper:** `apps/mobile/src/components/layout/Screen.tsx`  
  Handles safe area, padding, background, and optional scroll. Use for consistent screen layout.

- **Reusable UI components** (in `apps/mobile/src/components/ui/`):
  - `AppCard` – surface card with padding, rounded corners, optional onPress
  - `StatCard` – bento-style card: icon + label + big number + subtitle + onPress
  - `Badge` – status chip (e.g. REQUESTED, CONFIRMED) with label and variant
  - `EmptyState` – title, description, optional action button
  - `ListRow` – title, subtitle, right accessory, onPress
  - `SectionHeader` – section title and optional subtitle
  - `LoadingState` – centered spinner + message
  - `ErrorState` – error title, message, optional retry

- **Helpers:**  
  - `apps/mobile/src/lib/format.ts` – `formatDateTime()`, `formatDateShort()`, `formatTime()`  
  - `apps/mobile/src/lib/statusUi.ts` – `getBookingStatusLabel/Variant`, `getCaseStatusLabel/Variant`, `getStatusColor()`

Screens (Vet Home, Appointments, Cases, Notifications, Profile) use these components and the theme for consistent look and UX with the web app.
