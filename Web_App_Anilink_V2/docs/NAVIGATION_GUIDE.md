# AniLink - Navigation Guide & Screen Overview

This guide shows all available screens and how to navigate between them.

## 🗺️ Available Screens

### 🔐 Authentication Flow

1. **Welcome Screen** (`/welcome`)
   - First screen users see
   - Onboarding carousel with 3 pages
   - "Continue" button → Register
   - "Already have an account? Login" → Login

2. **Login Screen** (`/login`)
   - Email + Password login
   - "Forgot password?" link
   - "Register" link → Register
   - After login → Permissions screen

3. **Register Screen** (`/register`)
   - Full name, email, phone, role selection
   - Password + confirm password
   - "Login" link → Login
   - After registration → Permissions screen

4. **Permissions Screen** (`/permissions`)
   - Request location, camera, notifications permissions
   - Shown after successful login/register
   - Continue → Home dashboard

---

### 🏠 Main Dashboard (Bottom Navigation)

After authentication, you land here with 5 bottom tabs:

#### 1. **Home** (`/home`)
   - Dashboard with user greeting
   - Quick action cards:
     - **Scan Animal** → `/scan/start`
     - **Find Vet** → `/vets/map`
     - **Emergency** → `/emergency`
   - Quick access grid:
     - Marketplace
     - My Animals
     - My Bookings
     - Records
   - Header actions:
     - Bell icon → Notifications (`/notifications`)
     - Profile icon → Profile (`/profile`)

#### 2. **Scan** (`/scan/start`)
   - Animal type selection (Cattle, Goat, Sheep, Pig, Poultry, Pet)
   - "Continue" → Capture Images

#### 3. **Vets** (`/vets/map`)
   - Map/List toggle view
   - Search bar
   - Filter chips
   - Vet cards → Vet Profile (`/vets/:vetId`)

#### 4. **Marketplace** (`/marketplace`)
   - Product search
   - Category horizontal scroll
   - Product grid → Product Detail (`/product/:productId`)
   - Cart icon (top right)

#### 5. **Records** (`/records`)
   - My Animals grid
   - "Add" button (top right) → Create Animal (`/animal/create`)
   - Animal cards → Animal Profile (`/animal/:animalId`)
   - Case history section

---

### 📸 Scan/Case Flow

1. **Scan Start** (`/scan/start`)
   - Select animal type → Continue

2. **Scan Capture** (`/scan/capture`)
   - Take photos (1-6 images)
   - Camera or Gallery
   - Remove images
   - "Next" → Symptoms

3. **Scan Symptoms** (`/scan/symptoms`)
   - Check symptom boxes:
     - Drooling, Mouth sores, Lameness, Fever
     - Loss of appetite, Blisters, Swelling, Discharge
   - Add notes (optional)
   - "Next" → Summary

4. **Scan Summary** (`/scan/summary`)
   - Review: Animal type, images, symptoms, notes
   - "Submit Case" → Creates case + uploads images + requests AI
   - Progress indicator (1/3, 2/3, 3/3)
   - Auto-navigates to Result

5. **Scan Result** (`/scan/result/:caseId`)
   - AI assessment status (FMD/NOT_FMD/UNCLEAR/PENDING)
   - Confidence percentage
   - Severity indicator
   - Recommended actions:
     - **Find Nearby Vets** → `/vets/map`
     - **Book Farm Visit** → `/booking/create?caseId=...`
     - **Buy Recommended Supplies** → `/marketplace`
   - Emergency instructions (expandable)
   - Share case button

---

### 🏥 Vets Module

1. **Vets Map/List** (`/vets/map`)
   - Toggle between Map and List view
   - Search bar
   - Filters: Farm Visits, 24/7, Livestock, Poultry, Pets, Distance
   - Vet cards show: name, rating, distance, open status
   - Tap card → Vet Profile

2. **Vet Profile** (`/vets/:vetId`)
   - Hero section with vet info
   - Rating, distance, open status
   - Action buttons:
     - **Call** → Phone dialer
     - **WhatsApp** → WhatsApp chat
     - **Directions** → Maps navigation
   - Services & specialization chips
   - **Book Appointment** button → `/booking/create?v=vetId`

---

### 📅 Bookings Module

1. **Create Booking** (`/booking/create`)
   - Can be accessed from:
     - Vet Profile → Book Appointment
     - Scan Result → Book Farm Visit
   - Visit type: Clinic or Farm
   - Date picker
   - Time picker
   - Notes (optional)
   - "Book Appointment" → Success + navigate back

2. **My Bookings** (`/bookings`)
   - Tabs: Upcoming / Past
   - Booking cards with status chips
   - Tap booking → Details (future enhancement)

---

### 🛒 Marketplace Module

1. **Marketplace Home** (`/marketplace`)
   - Search bar
   - Category chips (horizontal scroll)
   - Nearby deals section
   - Product grid
   - Tap product → Product Detail

2. **Product Detail** (`/product/:productId`)
   - Image carousel
   - Price, rating, reviews
   - Seller info with distance
   - Actions:
     - **Add to Cart**
     - **Contact Seller** (WhatsApp)
     - **Buy Now**

3. **Create Product** (`/sell/create-product`)
   - Category dropdown
   - Title, price, stock quantity
   - Description
   - Upload images
   - "Publish Product" → Creates listing

4. **Orders** (`/orders`)
   - Order history (future enhancement)

---

### 📋 Records Module

1. **Records Home** (`/records`)
   - Animals grid
   - "Add" button → Create Animal
   - Case history timeline

2. **Animal Profile** (`/animal/:animalId`)
   - Animal details
   - Image gallery
   - Vaccination records section
   - Treatment history
   - Related cases

3. **Create Animal** (`/animal/create`)
   - Name, type, breed
   - Date of birth
   - Gender, color, tag number
   - Upload image
   - "Save Animal"

4. **Case Detail** (`/case/:caseId`)
   - Status card
   - Images gallery
   - Symptoms chips
   - AI assessment results
   - Vet notes (if booking completed)

---

### 🆘 Emergency

**Emergency Screen** (`/emergency`)
- Big red banner
- Actions:
  - **Call Emergency Hotline** → Phone
  - **WhatsApp Emergency Support** → WhatsApp
  - **Share My Location**
- Emergency vets list
- **Create Emergency Case** button

---

### 🔔 Notifications

**Notifications Screen** (`/notifications`)
- List of all notifications
- Booking updates, case updates, order updates
- Mark all as read button
- Unread badges

---

### 👤 Profile & Settings

1. **Profile Screen** (`/profile`)
   - User avatar and info
   - Role badge
   - Menu items:
     - **My Bookings** → `/bookings`
     - **My Animals** → `/records`
     - **Settings** → `/settings`
     - **Help & FAQ**
     - **Terms & Privacy**
   - **Logout** button → Clears auth + `/welcome`

2. **Settings Screen** (`/settings`)
   - Location settings (district)
   - Notification preferences (toggle)
   - Change password
   - Security options

---

## 🚀 Quick Navigation Cheat Sheet

| From | Action | To |
|------|--------|-----|
| Welcome | Continue | Register |
| Welcome | Login | Login Screen |
| Login | Register link | Register Screen |
| Register | Login link | Login Screen |
| After Login/Register | Auto | Permissions → Home |
| Home | Scan Animal card | `/scan/start` |
| Home | Find Vet card | `/vets/map` |
| Home | Emergency card | `/emergency` |
| Home | Bell icon | `/notifications` |
| Home | Profile icon | `/profile` |
| Scan Start | Continue | `/scan/capture` |
| Scan Capture | Next | `/scan/symptoms` |
| Scan Symptoms | Next | `/scan/summary` |
| Scan Summary | Submit | `/scan/result/:caseId` |
| Scan Result | Find Vets | `/vets/map` |
| Scan Result | Book Visit | `/booking/create?caseId=...` |
| Vets Map | Tap vet card | `/vets/:vetId` |
| Vet Profile | Book Appointment | `/booking/create?v=vetId` |
| Marketplace | Tap product | `/product/:productId` |
| Records | Add button | `/animal/create` |
| Records | Tap animal | `/animal/:animalId` |
| Profile | Settings | `/settings` |
| Profile | Logout | Clears auth, goes to `/welcome` |

---

## 🧭 Navigation Methods Used

### Programmatic Navigation (go_router)

```dart
// Push (stack navigation)
context.push('/scan/start');

// Go (replace)
context.go('/home');

// With parameters
context.push('/vets/vet-123');
context.push('/scan/result/case-456');

// With query parameters
context.push('/booking/create?v=vetId&caseId=caseId');

// Pop (go back)
context.pop();
```

### Bottom Navigation
- Automatically handled by `MainShell` widget
- 5 tabs: Home, Scan, Vets, Marketplace, Records
- Active tab highlighted based on current route

### Deep Links
All routes support deep linking:
- `/welcome`
- `/login`
- `/register`
- `/home`
- `/scan/start`
- `/scan/capture`
- `/scan/symptoms`
- `/scan/summary`
- `/scan/result/:caseId`
- `/vets/map`
- `/vets/:vetId`
- `/booking/create`
- `/bookings`
- `/marketplace`
- `/product/:productId`
- `/sell/create-product`
- `/records`
- `/animal/create`
- `/animal/:animalId`
- `/case/:caseId`
- `/notifications`
- `/profile`
- `/settings`
- `/emergency`

---

## 🎨 UI Features Overview

### Design System
- **Colors**: Primary green, secondary orange, status colors
- **Typography**: Title, headline, body, caption styles
- **Components**: Buttons, cards, text fields, chips, ratings
- **Spacing**: Consistent padding and margins

### Loading States
- Shimmer skeletons
- Circular progress indicators
- Loading buttons

### Error States
- Error messages with retry buttons
- Empty states with helpful messages
- Network error handling

### User Feedback
- SnackBar notifications
- Success/error messages
- Form validation errors

---

## 🧪 Testing Navigation

To test all screens, you can:

1. **Start fresh**: Clear app data → See Welcome screen
2. **Register/Login**: Complete auth flow
3. **Navigate tabs**: Use bottom navigation
4. **Deep link test**: Use `context.go('/route')` in code
5. **Test flows**: 
   - Complete scan flow end-to-end
   - Create booking from vet profile
   - Browse marketplace → view product
   - Add animal → view profile

---

## 📝 Notes

- **Auth Guard**: Protected routes automatically redirect to `/welcome` if not authenticated
- **Bottom Nav**: Only shows on main app routes (Home, Scan, Vets, Marketplace, Records)
- **State Management**: All navigation state managed by Riverpod + go_router
- **Offline Support**: Connectivity banner shows when offline

---

**Happy Navigating! 🚀**
