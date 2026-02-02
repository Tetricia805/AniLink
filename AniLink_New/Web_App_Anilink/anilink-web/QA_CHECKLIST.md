## AniLink React QA Checklist

### Auth
- Register a new user with OWNER role
- Login with existing user
- Verify tokens stored in localStorage
- Refresh page and confirm session persists

### Core Navigation
- Welcome -> Login/Register
- Permissions -> Home
- Bottom navigation switches between Home, Scan, Vets, Marketplace, Records

### Vets
- Vets list loads from `/v1/vets`
- Map view loads (Google Maps key + billing enabled)
- Vet profile details render

### Marketplace
- Marketplace list loads from `/v1/marketplace/products`
- Product detail loads and displays price
- Cart page renders

### Notifications
- Notifications list loads from `/v1/notifications`

### Scan Flow
- Start -> Capture/Symptoms -> Summary -> Result pages render

### Profile/Settings
- Profile page shows user info and logout works
- Settings page renders
