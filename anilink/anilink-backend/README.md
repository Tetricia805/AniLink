# AniLink Backend API

Backend server for AniLink - AI-Powered Health Intelligence Platform for Veterinary Services in Uganda.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
anilink-backend/
├── config/          # Configuration files (database, cloudinary, etc.)
├── controllers/     # Route controllers
├── models/          # Mongoose models
├── routes/          # API routes
├── middleware/      # Custom middleware (auth, error handling, etc.)
├── services/        # Business logic services
├── utils/           # Utility functions
├── server.js        # Main server file
└── .env            # Environment variables (not in git)
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Server health check

### Authentication (Coming Soon)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Vets (Coming Soon)
- `GET /api/vets` - Get all vets
- `GET /api/vets/nearby` - Get nearby vets (GPS)
- `GET /api/vets/:id` - Get vet details

### Appointments (Coming Soon)
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Book appointment

### Marketplace (Coming Soon)
- `GET /api/products` - Get all products
- `POST /api/orders` - Create order

### Health Records (Coming Soon)
- `GET /api/animals` - Get user's animals
- `POST /api/animals/:id/records` - Add health record

### AI Services (Coming Soon)
- `POST /api/ai/symptom-checker` - AI symptom analysis
- `POST /api/ai/fmd-checker` - FMD detection

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

## 🗄️ Database

Uses MongoDB with Mongoose ODM. Make sure MongoDB is running or use MongoDB Atlas.

## 📝 License

ISC

