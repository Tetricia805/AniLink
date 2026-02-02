# Quick Start Guide

## First Time Setup

1. **Install Flutter** (if not already installed)
   ```bash
   # Check Flutter installation
   flutter doctor
   ```

2. **Get Dependencies**
   ```bash
   flutter pub get
   ```

3. **Generate Code**
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```
   This generates:
   - Freezed files (*.freezed.dart)
   - JSON serialization files (*.g.dart)
   - Retrofit API files (*.g.dart)

4. **Configure API URL**
   Edit `lib/core/network/api_config.dart`:
   ```dart
   static const String baseUrl = 'https://your-backend-url.com/v1';
   ```

5. **Run the App**
   ```bash
   flutter run
   ```

## Development Workflow

### After Adding New DTOs/Models

If you add new Freezed models or Retrofit APIs, regenerate:
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Hot Reload

During development, use hot reload:
- Press `r` in terminal for hot reload
- Press `R` for hot restart

## Testing the App

### Test User Flow

1. **Welcome Screen** → Select role → Register/Login
2. **Home Dashboard** → Tap "Scan Animal"
3. **Scan Flow**:
   - Select animal type
   - Capture images (1-6)
   - Select symptoms
   - Review and submit
   - View AI result
4. **Find Vets** → Browse list/map → View profile → Book appointment
5. **Marketplace** → Browse products → View details
6. **Records** → View animals → Add new animal

## Common Issues

### Build Runner Errors
```bash
flutter clean
flutter pub get
flutter pub run build_runner clean
flutter pub run build_runner build --delete-conflicting-outputs
```

### Missing Generated Files
Ensure all `part` directives in your files match:
- `part 'filename.freezed.dart';`
- `part 'filename.g.dart';`

### API Connection Issues
- Check `api_config.dart` base URL
- Verify backend is running
- Check network permissions in AndroidManifest.xml / Info.plist

## Next Steps

1. Connect to your FastAPI backend
2. Add Google Maps API key for map features
3. Configure push notifications (optional)
4. Add app icons and splash screen
5. Test on physical devices
