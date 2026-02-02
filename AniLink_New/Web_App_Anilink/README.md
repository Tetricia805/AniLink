# AniLink - AI-Driven Animal Health Platform

**Docker (Web app):** See [DOCKER.md](./DOCKER.md) for running backend + React frontend with Docker Compose.

A comprehensive Flutter mobile application for animal health management, veterinary services, and marketplace for farmers and pet owners in Uganda/Africa.

## Features

- 🐄 **AI-Powered Health Assessment**: Scan animals and get instant AI-powered health assessments (FMD detection and more)
- 🏥 **Find Vets**: Discover nearby veterinarians, view profiles, and book appointments
- 🛒 **Marketplace**: Buy and sell animal feeds, medicine, equipment, and animals
- 📋 **Digital Records**: Keep track of your animals' health records, vaccinations, and treatments
- 📱 **Emergency Support**: Quick access to emergency veterinary services
- 🔔 **Notifications**: Stay updated on bookings, cases, and orders

## Tech Stack

- **Flutter** (latest stable)
- **Riverpod** - State management
- **go_router** - Navigation
- **Dio** - HTTP client with interceptors
- **Freezed** - Immutable models and DTOs
- **json_serializable** - JSON serialization
- **flutter_secure_storage** - Secure token storage
- **image_picker** - Camera and gallery access
- **geolocator** - Location services
- **google_maps_flutter** - Maps integration

## Project Structure

```
lib/
├── main.dart
├── core/
│   ├── theme/          # Design system (colors, typography, spacing)
│   ├── routing/         # Navigation setup
│   ├── network/         # API client, interceptors
│   ├── storage/         # Secure storage
│   ├── models/          # Shared DTOs
│   ├── utils/           # Utilities and extensions
│   └── widgets/         # Reusable UI components
└── features/
    ├── auth/            # Authentication
    ├── home/            # Dashboard
    ├── scan_case/       # Animal scanning and case management
    ├── vets/            # Veterinarian discovery
    ├── bookings/         # Appointment booking
    ├── marketplace/     # Product marketplace
    ├── records/          # Animal records
    ├── notifications/   # Notifications
    └── profile/         # User profile and settings
```

## Setup Instructions

### Prerequisites

- Flutter SDK (latest stable version)
- Dart SDK
- Android Studio / Xcode (for mobile development)
- Google Maps API key (for maps feature)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ANILINK
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Generate code (Freezed, json_serializable, Retrofit)**
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

4. **Configure API Base URL**
   
   Update the base URL in `lib/core/network/api_config.dart`:
   ```dart
   static const String baseUrl = 'https://your-api-url.com/v1';
   ```

5. **Configure Google Maps (Optional)**
   
   For Android, add your API key in `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="YOUR_API_KEY"/>
   ```
   
   For iOS, add in `ios/Runner/AppDelegate.swift`:
   ```swift
   GMSServices.provideAPIKey("YOUR_API_KEY")
   ```

6. **Run the app**
   ```bash
   flutter run
   ```

## API Integration

The app is designed to work with a FastAPI backend. Ensure your backend implements the following endpoints:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

### Cases
- `POST /cases` - Create animal health case
- `GET /cases/:id` - Get case details
- `POST /cases/:id/request-ai` - Request AI assessment
- `GET /cases` - List cases

### Vets
- `GET /vets` - List veterinarians (with filters)
- `GET /vets/:id` - Get vet profile

### Bookings
- `POST /bookings` - Create booking
- `GET /bookings` - List bookings

### Marketplace
- `GET /products` - List products
- `GET /products/:id` - Get product details
- `POST /products` - Create product listing

### Animals
- `GET /animals` - List animals
- `GET /animals/:id` - Get animal details
- `POST /animals` - Create animal record

### Notifications
- `GET /notifications` - List notifications

## Environment Configuration

Create a `.env` file (optional) or update `api_config.dart` directly:

```dart
// lib/core/network/api_config.dart
static const String baseUrl = 'https://api.anilink.ug/v1';
```

## Building for Production

### Android
```bash
flutter build apk --release
# or
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

## Key Features Implementation

### AI Assessment Flow
1. User selects animal type
2. Captures 1-6 images
3. Selects symptoms
4. Submits case
5. Receives AI assessment (FMD/NOT_FMD/UNCLEAR/PENDING)
6. Gets recommendations and can book vet

### Role-Based UI
- **OWNER**: Full access to all features
- **VET**: Booking management, case reviews
- **SELLER**: Product management, orders

### State Management
- Riverpod providers for each feature
- Async providers for data fetching
- State notifiers for complex state

## Troubleshooting

### Code Generation Issues
If you encounter issues with generated files:
```bash
flutter clean
flutter pub get
flutter pub run build_runner clean
flutter pub run build_runner build --delete-conflicting-outputs
```

### Missing Dependencies
Ensure all dependencies are properly installed:
```bash
flutter pub get
```

### API Connection Issues
- Verify the base URL in `api_config.dart`
- Check network connectivity
- Ensure backend CORS is configured correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure code quality
5. Submit a pull request

## License

[Add your license here]

## Support

For issues and questions, please contact [support email] or open an issue on GitHub.

## Acknowledgments

Built for farmers and pet owners in Uganda/Africa to improve animal health management and access to veterinary services.
