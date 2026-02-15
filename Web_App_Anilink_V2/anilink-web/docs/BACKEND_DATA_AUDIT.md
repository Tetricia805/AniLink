# Backend Data Audit

**Purpose:** Complete inventory of entities, endpoints, RBAC, and visibility rules for the AniLink backend (FastAPI under `/v1`).  
**Source:** Backend code only — no guessing.

---

## 1) Entity inventory (models + tables)

All data is stored in **Postgres**. No Mongo.

### 1.1 Users & profiles

| Entity | Table | PK | Fields | Required / defaults | FKs |
|--------|--------|-----|--------|---------------------|-----|
| **User** | `users` | `id` (UUID) | `role` (enum), `name`, `email`, `phone` (nullable), `password_hash`, `created_at`, `updated_at` | role required; name, email, password_hash required | — |
| **UserProfile** | `user_profiles` | `user_id` (UUID, FK users) | `district`, `region`, `address_text`, `lat`, `lng`, `avatar_url`, `created_at`, `updated_at` | All nullable | users.id |

- **UserRole enum:** OWNER, VET, SELLER, ADMIN.
- **Visibility:** User + profile are per-user; auth/me and users/me return current user only.

### 1.2 Vets

| Entity | Table | PK | Fields | Required / defaults | FKs |
|--------|--------|-----|--------|---------------------|-----|
| **Vet** | `vets` | `user_id` (UUID, FK users) | `clinic_name`, `license_number` (opt), `services` (JSONB), `specializations` (JSONB), `is_24_7`, `farm_visits`, `avg_rating`, `review_count`, `location_lat`, `location_lng`, `location_label`, `address`, `district`, `verified`, `created_at`, `updated_at` | clinic_name required; verified default False | users.id |
| **VetAvailabilitySlot** | `vet_availability_slots` | `id` (UUID) | `vet_user_id`, `day_of_week`, `start_time`, `end_time`, `slot_minutes`, `created_at` | — | vets.user_id |
| **VetAvailability** | `vet_availability` | `user_id` (UUID, FK users) | `accept_farm_visits`, `is_emergency_247`, `weekly_schedule` (JSONB), `created_at`, `updated_at` | Defaults: False, False, {} | users.id |

- **Visibility:** List vets returns only `verified == True`. Vet profile (me) and availability (me) are vet-only.

### 1.3 Animals

| Entity | Table | PK | Fields | Required / defaults | FKs |
|--------|--------|-----|--------|---------------------|-----|
| **Animal** | `animals` | `id` (UUID) | `owner_user_id`, `type`, `breed`, `name`, `sex`, `dob_estimated`, `color`, `tag_number`, `photo_url`, `notes`, `vaccination_records` (JSONB), `treatment_records` (JSONB), `created_at`, `updated_at` | owner_user_id, type, name required | users.id |

- **Visibility:** Owner sees only their animals (owner_user_id = current user).

### 1.4 Bookings (appointments)

| Entity | Table | PK | Fields | Required / defaults | FKs |
|--------|--------|-----|--------|---------------------|-----|
| **Booking** | `bookings` | `id` (UUID) | `owner_user_id`, `vet_user_id`, `case_id` (opt), `visit_type`, `scheduled_time`, `status`, `notes`, `created_at`, `updated_at` | owner, vet, visit_type, scheduled_time required; status default REQUESTED | users.id, vets.user_id, cases.id |

- **VisitType:** CLINIC, FARM. **BookingStatus:** REQUESTED, CONFIRMED, DECLINED, IN_PROGRESS, COMPLETED, CANCELLED.
- **Visibility:** Owner sees own bookings; vet sees bookings where vet_user_id = current user.

### 1.5 Cases (health cases / scans)

| Entity | Table | PK | Fields | Required / defaults | FKs |
|--------|--------|-----|--------|---------------------|-----|
| **Case** | `cases` | `id` (UUID) | `owner_user_id`, `animal_id` (opt), `animal_type`, `suspected_disease`, `symptoms` (JSONB), `notes`, `lat`, `lng`, `location`, `district`, `status`, `created_at`, `updated_at` | owner_user_id, animal_type required; status default SUBMITTED | users.id, animals.id |
| **CaseImage** | `case_images` | `id` (UUID) | `case_id`, `image_url`, `meta` (JSONB), `created_at` | — | cases.id |

- **CaseStatus:** SUBMITTED, UNDER_REVIEW, CLOSED.
- **Visibility:** Owner sees own cases; vet sees cases (e.g. assigned or all depending on implementation).

### 1.6 Marketplace & orders

| Entity | Table | PK | Fields | Required / defaults | FKs |
|--------|--------|-----|--------|---------------------|-----|
| **Product** | `marketplace_products` | `id` (UUID) | `seller_user_id`, `category`, `title`, `description`, `price`, `currency`, `stock_qty`, `location_lat`, `location_lng`, `district`, `is_active`, `verified`, `recommended`, `created_at`, `updated_at` | seller, category, title, price required; verified default False, is_active default True | users.id |
| **ProductImage** | `product_images` | `id` (UUID) | `product_id`, `image_url`, `created_at` | — | marketplace_products.id |
| **Order** | `orders` | `id` (UUID) | `buyer_user_id`, `seller_user_id`, `status`, `total_price`, `delivery_option`, `delivery_address` (JSONB), `delivery_district`, `created_at`, `updated_at` | buyer, seller, total_price, delivery_option required; status default pending | users.id |
| **OrderItem** | `order_items` | `id` (UUID) | `order_id`, `product_id`, `seller_id`, `product_name`, `qty`, `unit_price`, `subtotal` | — | orders.id, marketplace_products.id, users.id |

- **ProductCategory:** ANIMAL, FEED, MEDICINE, EQUIPMENT, ACCESSORY.
- **OrderStatus:** pending, confirmed, packed, dispatched, delivered, cancelled.
- **DeliveryOption:** PICKUP, DELIVERY.
- **Visibility:** Owner marketplace list returns only `verified == True` AND `is_active == True`. Seller sees own products and own order_items. Orders: buyer sees own; seller sees orders where seller_user_id = current user.

### 1.7 Notifications

| Entity | Table | PK | Fields | Required / defaults | FKs |
|--------|--------|-----|--------|---------------------|-----|
| **Notification** | `notifications` | `id` (UUID) | `user_id`, `type`, `title`, `message`, `payload` (JSONB), `read`, `created_at` | user_id, title, message required; read default False | users.id |
| **DeviceToken** | `device_tokens` | `id` (UUID) | `user_id`, `platform`, `fcm_token`, `created_at` | — | users.id |

- **Visibility:** Each user sees only their notifications (user_id = current user). Supports all roles.

### 1.8 Seller profile

| Entity | Table | PK | Fields | Required / defaults | FKs |
|--------|--------|-----|--------|---------------------|-----|
| **SellerProfile** | `seller_profiles` | `id` (UUID) | `user_id`, `store_name`, `contact_email`, `created_at`, `updated_at` | user_id unique | users.id |

- **Visibility:** Seller sees/edits own profile only.

---

## 2) Endpoints inventory (by module)

Base prefix: **/v1**. Auth: Bearer token where noted.

### Auth (`/v1/auth`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| POST | /register | No | — | RegisterRequest (name, email, password, phone, role) | AuthResponse (accessToken, refreshToken?, user: UserResponse) |
| POST | /login | No | — | LoginRequest (email, password) | AuthResponse |
| POST | /refresh | No (body has refreshToken) | — | RefreshTokenRequest | AuthResponse |
| GET | /me | Yes | Any | — | UserResponse (id, name, email, role, phone?, profileImageUrl?, district?, createdAt?) |
| POST | /logout | Yes | Any | RefreshTokenRequest | 204 |

### Users (`/v1/users`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| GET | /me | Yes | Any | — | UserResponse |
| PUT | /me | Yes | Any | UserUpdate (name?, phone?, email?, avatarUrl?) | UserResponse |
| PATCH | /me | Yes | Any | UserUpdate (fullName/name, phone, avatarUrl) | UserResponse |
| POST | /me/avatar | Yes | Any | multipart file | { avatarUrl } |
| GET | /me/profile | Yes | Any | — | UserProfileResponse |
| PUT | /me/profile | Yes | Any | UserProfileUpdate | UserProfileResponse |

### Vets (`/v1/vets`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| GET | (empty) | No | — | Query: latitude?, longitude?, radius_km?, specialization?, farmVisits?, is24Hours? | List\<VetResponse\> (only verified vets) |
| GET | /me | Yes | VET | — | VetResponse |
| PUT/PATCH | /me | Yes | VET | VetUpdateRequest | VetResponse |
| GET | /me/availability | Yes | VET | — | VetAvailabilityResponse |
| PUT | /me/availability | Yes | VET | VetAvailabilityUpdate | VetAvailabilityResponse |
| GET | /{vet_id} | No | — | — | VetResponse |
| GET | /{vet_id}/availability | No | — | — | List\<AvailabilitySlotResponse\> |

### Animals (`/v1/animals`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| POST | (empty) | Yes | Any (owner) | AnimalCreate | AnimalResponse |
| GET | (empty) | Yes | Any | — | List\<AnimalResponse\> (owner's animals) |
| GET | /{id} | Yes | Any | — | AnimalResponse |
| PUT | /{id} | Yes | Any | AnimalUpdate | AnimalResponse |
| DELETE | /{id} | Yes | Any | — | 204 |

### Bookings (`/v1/bookings`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| POST | (empty) | Yes | Any | BookingCreate | BookingResponse |
| GET | (empty) | Yes | Owner, Vet | Query: status? | List\<BookingResponse\> (owner: own; vet: vet's bookings) |
| GET | /{id} | Yes | Owner, Vet | — | BookingResponse |
| PATCH | /{id}/status | Yes | VET | status | BookingResponse |

### Cases (`/v1/cases`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| POST | (empty) | Yes | Any | CaseCreate | CaseResponse |
| GET | (empty) | Yes | Owner, Vet | — | List\<CaseResponse\> |
| GET | /{id} | Yes | Any | — | CaseResponse |

### Marketplace (`/v1/marketplace`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| GET | /products | Yes | OWNER | Query: q?, category?, recommended?, page, limit, latitude?, longitude?, radius_km? | List\<ProductResponse\> (**verified + is_active only**) |
| GET | /products/{id} | Yes | OWNER | — | ProductResponse |

### Orders (`/v1/orders`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| POST | (empty) | Yes | Any | OrderCreate | OrderResponse |
| GET | (empty) | Yes | Any | Query: status? | List\<OrderResponse\> (buyer: own; seller: own sold) |
| GET | /{id} | Yes | Any | — | OrderResponse |

### Notifications (`/v1/notifications`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| GET | (empty) | Yes | Any | — | List\<NotificationResponse\> (current user) |
| POST | /{id}/read | Yes | Any | — | { message } |
| POST | /register-device | Yes | Any | DeviceTokenRegister | { message, id } |

### Seller (`/v1/seller`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| GET | /products | Yes | SELLER | — | List\<ProductResponse\> (seller's products only) |
| POST | /products | Yes | SELLER | ProductCreate | ProductResponse (verified=false by default) |
| GET | /products/{id} | Yes | SELLER | — | ProductResponse |
| PUT | /products/{id} | Yes | SELLER | ProductUpdate | ProductResponse |

### AI (`/v1/ai`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| (e.g. scan/assess) | (per router) | Yes | Any | — | (per implementation) |

---

## 3) RBAC matrix (role × operations)

| Entity / resource | OWNER | VET | SELLER | ADMIN |
|-------------------|-------|-----|--------|-------|
| Auth (login, me, refresh) | ✓ | ✓ | ✓ | ✓ |
| Users/me (profile, avatar) | ✓ | ✓ | ✓ | ✓ |
| Vets list (public) | ✓ (no auth required) | ✓ | ✓ | ✓ |
| Vets/me, vets/me/availability | — | ✓ | — | — |
| Animals (CRUD own) | ✓ | — | — | (all in future) |
| Bookings (create, list own) | ✓ | — | — | — |
| Bookings (list vet's, update status) | — | ✓ | — | — |
| Cases (create, list own) | ✓ | (list/assign) | — | — |
| Marketplace products (list verified+active) | ✓ | — | — | — |
| Orders (create, list own as buyer) | ✓ | — | — | — |
| Orders (list as seller) | — | — | ✓ | — |
| Notifications (list, mark read) | ✓ | ✓ | ✓ | ✓ |
| Seller products (CRUD own) | — | — | ✓ | — |

---

## 4) Visibility rules summary

- **Vets list (GET /v1/vets):** Only rows with `verified == True`. No auth required. Filters optional (specialization, farmVisits, is24Hours, lat/lng/radius).
- **Owner marketplace (GET /v1/marketplace/products):** Only `verified == True` AND `is_active == True`. Enforced in backend.
- **Seller products:** Seller sees all own products (verified or not). Admin can verify (if endpoint exists).
- **Orders:** Buyer sees orders where buyer_user_id = me; seller sees orders where seller_user_id = me.
- **Notifications:** user_id = current user. All roles.

---

## 5) Enumerations & status values

| Domain | Values |
|--------|--------|
| UserRole | OWNER, VET, SELLER, ADMIN |
| VisitType | CLINIC, FARM |
| BookingStatus | REQUESTED, CONFIRMED, DECLINED, IN_PROGRESS, COMPLETED, CANCELLED |
| CaseStatus | SUBMITTED, UNDER_REVIEW, CLOSED |
| OrderStatus | pending, confirmed, packed, dispatched, delivered, cancelled |
| DeliveryOption | PICKUP, DELIVERY |
| ProductCategory | ANIMAL, FEED, MEDICINE, EQUIPMENT, ACCESSORY |

---

## 6) Frontend pages → backend endpoints (summary)

See **FRONTEND_TO_BACKEND_MAP.md** for per-route mapping.  
See **GAPS_AND_MINIMAL_CHANGES.md** for missing storage/endpoints and minimal proposals.
