# AniLink – Veterinary Telehealth Platform

AniLink is a full-stack application that connects livestock farmers and veterinary professionals across Uganda. It combines an interactive React frontend with a secure Node/Express backend to provide authentication, vet discovery, AI-driven symptom checks, appointment booking, health-record management, and a veterinary marketplace.

---

## ✨ Key Features

- **Modern landing experience** with sections for vets, marketplace, appointments, health records, AI tools, and FMD tracking.
- **Authentication workflow** (register, login, logout, profile) powered by JWTs and MongoDB.
- **Reusable UI system** built with Radix UI primitives, Tailwind CSS, and custom motion effects.
- **API service layer** using Axios with automatic token injection and error handling.
- **Secure backend** with middleware for CORS, Helmet security headers, compression, logging, and global error handling.
- **Graceful server lifecycle** with MongoDB connection management, retry logic, and port-conflict handling.
- **Ready-to-extend domain models** for vets, appointments, marketplace, and AI integrations.

---

## 🧱 Tech Stack

| Layer      | Technologies |
|------------|--------------|
| Frontend   | React 18, Vite, React Router, Tailwind CSS, Radix UI, Framer Motion, Axios |
| Backend    | Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, express-validator |
| Tooling    | Nodemon, dotenv, Helmet, Morgan, Compression, CORS |

---

## 📁 Project Structure

```
vetconnect12/
├── README.md                 # You are here
├── package.json              # Frontend dependencies & scripts
├── vite.config.js            # Vite configuration
├── src/                      # React application
│   ├── api/                  # Axios instance + auth service
│   ├── components/           # Header, Footer, reusable UI primitives
│   ├── pages/                # Home, Vets, Marketplace, Booking, HealthRecords, AI tools
│   └── main.jsx              # App bootstrap
└── anilink-backend/          # Express API
    ├── server.js             # App bootstrap & middleware
    ├── routes/               # API routes (auth, etc.)
    ├── controllers/          # Business logic (authController, ...)
    ├── models/               # Mongoose models (User, Vet)
    ├── middleware/           # Auth guard, error handler
    └── config/               # Database connection, cloudinary placeholder
```

---

## ⚙️ Prerequisites

- Node.js v18+ (v22 recommended for parity with development environment)
- npm v9+
- MongoDB Atlas cluster or local MongoDB instance

---

## 🧩 Environment Variables

### Frontend (`.env`)

Create `vetconnect12/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

### Backend (`anilink-backend/.env`)

Copy `anilink-backend/env-template.txt` to `.env` and customize:

```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

Add optional provider keys (Cloudinary, Flutterwave, Twilio, Email) as needed.

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
# Frontend
cd vetconnect12
npm install

# Backend
cd anilink-backend
npm install
```

### 2. Start the backend API

```bash
cd anilink-backend
npm run dev   # Starts nodemon on http://localhost:5000
```

The server will:
- Connect to MongoDB (see `config/database.js`)
- Expose health check at `/api/health`
- Mount authentication routes under `/api/auth`

### 3. Start the frontend

```bash
cd vetconnect12
npm run dev   # Launches Vite on http://localhost:5173
```

The frontend will automatically proxy API calls to `VITE_API_URL`.

---

## 🔐 Authentication Flow

1. **Sign Up**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`
3. **Current User**: `GET /api/auth/me` (requires `Authorization: Bearer <token>`)
4. **Logout**: `POST /api/auth/logout`

Frontend state is persisted with `localStorage` and Axios interceptors inject the JWT into subsequent requests. Unauthorized responses automatically clear stale tokens.

---

## 🧪 Testing the API

Use the included PowerShell snippets (see conversation history) or Postman:

```powershell
$body = @{ name='Test User'; email='test@example.com'; phone='+256700000000'; password='secret123' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:5000/api/auth/register -Method POST -Body $body -ContentType 'application/json'
```

---

## 🛠️ Useful Scripts

| Location            | Command              | Description                          |
|---------------------|----------------------|--------------------------------------|
| `vetconnect12/`     | `npm run dev`        | Start Vite dev server                |
|                     | `npm run build`      | Production build                     |
| `anilink-backend/`  | `npm run dev`        | Start nodemon + Express server       |
|                     | `npm start`          | Production start (Node)              |

---

## 📌 Roadmap

- GPS-based vet locator (Leaflet + geospatial queries)
- Appointments CRUD + notifications
- Marketplace orders & payments
- Health record uploads
- AI symptom checker integration

See `IMPLEMENTATION_CHECKLIST.md` and `ANILINK_COMPLETE_TECH_STACK.md` for detailed plans.

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/awesome`)
3. Commit changes (`git commit -m 'Add awesome feature'`)
4. Push branch (`git push origin feature/awesome`)
5. Open a Pull Request

---

## 📄 License

This project is currently proprietary. Update this section if/when an open-source license is chosen.

---

Questions or suggestions? Open an issue or reach out to the maintainers. Happy building! 🐾


