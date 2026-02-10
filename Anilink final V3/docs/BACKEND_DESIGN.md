# AniLink Backend Design

Backend schema, APIs, and RBAC derived from the AniLink React frontend UI. Every field and flow is traceable to a UI element.

**Roles:** `OWNER` (farmer/animal owner), `VET` (clinic staff), `ADMIN` (platform admin), `SELLER` (marketplace vendor).

---

## 1. UI Data Inventory

| Page | Component/Card | Fields displayed | Field type | Source entity | Notes |
|------|----------------|------------------|------------|---------------|--------|
| **A) Owner App** |
| /home | Welcome header | welcome text ("Welcome back, David"), role badge ("Owner") | string, enum | User, Profile | name from user/profile; role from user |
| /home | Stats cards | Animals Registered, Active Health Cases, Upcoming Appointments, Recent Orders | number | derived | counts; link paths |
| /home | Quick Actions | Start Health Scan, Find a Vet, Browse Marketplace (title, description, path) | string, string, string | static | config only |
| /home | Recent Activity | type (scan/vet/order), title, description, time, href | string, string, string, string, string | ScanRecord, Appointment, Order | list; latest scan + next appointment + empty fallback |
| /scan | Wizard steps | step key, step name, progress % | string, number | local | 4 steps |
| /scan | StepSelectAnimal | animal id, name, type, age, image | number, string, string, string, string | Animal | list from owner's animals |
| /scan | StepSymptoms | symptoms[], severity, duration, notes | list, enum, enum, string | ScanInput | severity: mild/moderate/severe; duration: <1d/1-3d/3-7d/>1w |
| /scan | StepPhotos | files, previewUrls | file[], string[] | — | upload; sent to API |
| /scan | StepResults | summary, confidence, conditions[], recommendedActions[], urgency; Save to records, Book vet, product recommendations | string, enum, list, list, enum | ScanResult | AI result; conditions: name, description, confidence, confidenceLabel |
| /records | Page header | title, subtitle, Add Animal button | — | — | |
| /records | My Animals list | animal id, name, breed/species, image, selected state | number, string, string, string | Animal | filter status != Archived |
| /records | Animal profile header | name, breed/species, image, ageOrDob, status badge, Edit Profile button | string, string, string, string, enum | Animal | status: Healthy/Sick/Under Treatment/Recovered/Archived |
| /records | Animal stats | Scans count, Vet Visits count, Treatments count | number | derived | from timeline records for selected animal |
| /records | Health Timeline tabs | All, Scans, Vet Visits, Treatments, Orders | — | TimelineRecord | filter by type |
| /records | Timeline item | type, title, description, date, View Details | enum, string, string, date | TimelineRecord | type: scan/vet/treatment/order/note |
| /records | Add Animal sheet | name, species, breed, tagId, sex, ageOrDob, status, notes, image | string, enum, string, string, string, string, enum, string, string | Animal | species: Livestock/Poultry/Pets |
| /records | Add Treatment/Note/Vaccine | title, description, date, details, animalId | string, string, date, string, number | TimelineRecord | type treatment/note |
| /vets | Page header | title, subtitle | — | — | |
| /vets | Search + filters | searchQuery; Farm Visits, 24/7, Livestock, Poultry, Pets | string, boolean filters | Vet | filter by specialties/services |
| /vets | Vet list | count ("X vets found"), Map View link | number | Vet | |
| /vets | VetCard | clinic, vet, rating, reviews, distance, specialties[], hours, phone, availability, Book Appointment, View Details | string, string, number, number, string, string[], string, string, string | Vet | farmVisits, twentyFourSeven, services[] |
| /vets/:id | Vet details | clinic, vet (name), rating, reviews, availability, services[], Farm visits, 24/7, hours, Contact (Call, WhatsApp, Message), address, Get directions, map embed (lat, lng) | as above + address, lat, lng | Vet | |
| /appointments | Tabs | Upcoming, Pending, Past, Cancelled | — | Appointment | status mapping |
| /appointments | Filters | Farm visit, Clinic visit, Emergency; Search; Sort (Soonest/Latest) | enum[], string, enum | Appointment | type: clinic/farm/emergency |
| /appointments | AppointmentCard | id, status, dateTime, type, vetName, clinicName, location, animalName, animalTag, species, reason, cost; View details, Reschedule, Cancel, (vet) Accept/Decline/Message/Mark completed | string, enum, datetime, enum, string, string, string, string, string, string, string, string | Appointment | status: pending/upcoming/completed/cancelled/rejected |
| /appointments | Book sheet | vetId, type, animalId, date, time, location (required if farm), reason | string, enum, string, date, time, string, string | — | creates Appointment |
| /marketplace | Header | title, Cart button + badge count | — | Cart | |
| /marketplace | Search + categories | searchQuery; All, Medicines, Feeds & Supplements, Supplies & Equipment, Vaccines | string, category id | Product | |
| /marketplace | Recommended | "Recommended Based on Last Scan" section, product cards (only if recommended) | list | Product | recommended flag |
| /marketplace | Product card | name, description, price (UGX), category, inStock, vetApproved, recommended; Add to cart / Added | string, string, string, string, boolean, boolean, boolean | Product | |
| /marketplace/products/:id | Product detail | title, description, price, Add to cart | string, string, number | MarketplaceProductDto | |
| /cart | Cart page | items (name, priceDisplay, quantity, image), subtotal, delivery, total, Proceed to checkout | list, number, number, number | CartItem | delivery from config/API |
| /checkout | Checkout | subtotal, item count, delivery, total, Place order | number, number, number, number | — | creates Order |
| /orders | Orders list | (empty state) "No orders yet", link to marketplace | — | Order | list orders |
| /orders/:id | Order detail | (placeholder) Full order information, Contact seller, Cancel order | — | Order | |
| /notifications | Notifications | title, message, isRead, createdAt, href; Mark all read, Mark read | string, string, boolean, datetime, string | Notification | |
| /profile | Profile card | name, role badge, AniLink badge, email, phone, location, Edit Profile | string, enum, string, string, string | User, Profile | |
| /profile | Personal info | fullName, farmName, preferredAnimals | string, string, list | Profile | |
| **B) Seller App** |
| /seller/dashboard | Stats cards | Products, Orders, Inventory, Payouts | number | derived | |
| /seller/dashboard | CTA | "Get started by adding your first product", Add product link | — | — | |
| /seller/products | Page | title, subtitle, Add product, list products (empty state) | — | Product (seller's) | |
| /seller/orders | Page | title, list orders (empty state) | — | Order (seller's) | order items, status: confirmed/packed/dispatched/delivered |
| /seller/profile | Vendor details | Store/Business name, Contact email, Save changes | string, string | SellerProfile | |
| **C) Vet App** |
| /vet/home | Stats cards | Appointments today, Pending requests, Active cases, Patients seen | number | derived | |
| /vet/home | CTA | "No appointments today", Update availability link | — | — | |
| /vet/appointments | Page | View and manage booking requests; accept/reject/status | — | Appointment (vet's) | same AppointmentCard mode=vet |
| /vet/cases | Page | Cases from scans; review scans, symptoms, images; write notes; mark resolved/request info | — | Case (scan-linked) | |
| /vet/patients | Page | Animals linked to appointments/cases | — | Animal (via appointments) | |
| **D) Admin App** |
| /admin/dashboard | Stats cards | Users, Vets/Clinics, Products, Reports | number/— | derived | |
| /admin/users | Page | List and manage users | — | User | |
| /admin/vets | Page | Approve and manage vets/clinics | — | Vet, Clinic | |
| /admin/products | Page | Moderate and manage marketplace products | — | Product | |
| /admin/reports | Page | Reports (placeholder) | — | — | |
| /admin/settings | Page | (placeholder) | — | — | |

---

## 2. PostgreSQL Schema

### 2.1 Enumerations

```sql
CREATE TYPE user_role AS ENUM ('OWNER', 'VET', 'SELLER', 'ADMIN');
CREATE TYPE animal_species AS ENUM ('Livestock', 'Poultry', 'Pets');
CREATE TYPE animal_status AS ENUM ('Healthy', 'Sick', 'Under Treatment', 'Recovered', 'Archived');
CREATE TYPE timeline_record_type AS ENUM ('scan', 'vet', 'treatment', 'order', 'note');
CREATE TYPE appointment_status AS ENUM ('pending', 'upcoming', 'completed', 'cancelled', 'rejected');
CREATE TYPE appointment_type AS ENUM ('clinic', 'farm', 'emergency');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled');
CREATE TYPE case_status AS ENUM ('open', 'resolved', 'awaiting_info');
```

### 2.2 ERD (Tables + Relationships)

- **users** — id (PK), email (unique), password_hash, name, phone, role (enum), profile_image_url, created_at, updated_at.
- **profiles** — id (PK), user_id (FK users), full_name, email, phone, location, farm_name, preferred_animals (text[] or JSONB), profile_photo_url, created_at, updated_at. 1:1 with users (owner profile).
- **seller_profiles** — id (PK), user_id (FK users unique), store_name, contact_email, created_at, updated_at. 1:1 with users (seller).
- **vet_profiles** — id (PK), user_id (FK users unique), clinic_name, vet_display_name, phone, whatsapp, address, lat, lng, rating (numeric), reviews_count, distance_display (e.g. "5 km"), hours, availability (e.g. "Mon–Fri 8–6"), farm_visits (bool), twenty_four_seven (bool), services (text[]), specialties (text[]), created_at, updated_at. 1:1 with users (vet).
- **animals** — id (PK), owner_id (FK users), name, species (enum), breed, tag_id, sex, age_or_dob, status (enum), notes, image (emoji or URL), created_at, updated_at.
- **timeline_records** — id (PK), animal_id (FK animals), type (enum), title, description, date (date or timestamptz), details (text), created_at, updated_at. Optional: scan_id (FK scan_records), appointment_id (FK appointments), order_id (FK orders) for linkage.
- **scan_records** — id (PK), animal_id (FK animals), owner_id (FK users), summary, confidence (enum: High/Medium/Low), urgency (enum), raw_result (JSONB), photo_urls (text[]), symptoms (text[]), severity, duration, notes, created_at, updated_at. raw_result stores full AI output (conditions, recommendedActions, etc.).
- **scan_conditions** — id (PK), scan_id (FK scan_records), name, description, confidence, confidence_label. Optional normalized table; else keep in scan_records.raw_result.
- **appointments** — id (PK), owner_id (FK users), vet_id (FK users or vet_profiles), animal_id (FK animals), status (enum), type (enum), scheduled_at (timestamptz), location (for farm), reason, cost_display, created_at, updated_at. Denormalized for list: vet_name, clinic_name, animal_name, animal_tag, species, owner_name, owner_phone (or join when needed).
- **vets** (or use vet_profiles) — If vets are separate entities: id (PK), user_id (FK nullable), clinic_name, vet_name, ... (same as vet_profiles). Frontend uses a single Vet shape; backend can be users + vet_profiles.
- **products** — id (PK), seller_id (FK users), title/name, description, category (string), price (integer, UGX), image_urls (text[]), stock (int), **is_active** (bool, default true), **is_verified** (bool, default false; approval/verification), recommended (bool), created_at, updated_at. **MUST** have is_active and is_verified for visibility rules.
- **orders** — id (PK), buyer_id (FK users), status (enum), **total_amount** (integer, UGX), delivery_fee (integer), **delivery_address** (text), created_at, updated_at.
- **order_items** — id (PK), order_id (FK orders), product_id (FK products), **seller_id** (FK users; recommended for fast seller-order filtering), product_name, **unit_price** (UGX), quantity, **subtotal** (UGX), image_url.
- **cart_items** — user_id (FK users), product_id (FK products), quantity. PK (user_id, product_id). Or session-based cart; frontend currently persists in localStorage.
- **notifications** — id (PK), user_id (FK users), title, message, is_read (bool), href, created_at.
- **cases** (vet) — id (PK), scan_id (FK scan_records), vet_id (FK users), owner_id (FK users), animal_id (FK animals), status (enum), vet_notes (text), created_at, updated_at. For vet “Cases” page: review scan, add notes, mark resolved.

**Relationships summary:**  
User has one profile (owner), one seller_profile (if seller), one vet_profile (if vet). User (owner) has many animals, many scan_records, many appointments, many orders, many notifications. Animal has many timeline_records. Scan_record can have one case (vet view). Appointment links owner, vet, animal. Order links buyer and order_items; order_items link to products. Products belong to seller.

### 2.3 DDL (CREATE TABLE)

```sql
-- Enums (as above)
CREATE TYPE user_role AS ENUM ('OWNER', 'VET', 'SELLER', 'ADMIN');
CREATE TYPE animal_species AS ENUM ('Livestock', 'Poultry', 'Pets');
CREATE TYPE animal_status AS ENUM ('Healthy', 'Sick', 'Under Treatment', 'Recovered', 'Archived');
CREATE TYPE timeline_record_type AS ENUM ('scan', 'vet', 'treatment', 'order', 'note');
CREATE TYPE appointment_status AS ENUM ('pending', 'upcoming', 'completed', 'cancelled', 'rejected');
CREATE TYPE appointment_type AS ENUM ('clinic', 'farm', 'emergency');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled');
CREATE TYPE case_status AS ENUM ('open', 'resolved', 'awaiting_info');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role user_role NOT NULL,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  location VARCHAR(255),
  farm_name VARCHAR(255),
  preferred_animals TEXT[],
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(255),
  contact_email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vet_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  clinic_name VARCHAR(255) NOT NULL,
  vet_display_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50),
  address TEXT,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  rating NUMERIC(3,2) DEFAULT 0,
  reviews_count INT DEFAULT 0,
  distance_display VARCHAR(50),
  hours VARCHAR(255),
  availability VARCHAR(255),
  farm_visits BOOLEAN DEFAULT false,
  twenty_four_seven BOOLEAN DEFAULT false,
  services TEXT[],
  specialties TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  species animal_species NOT NULL,
  breed VARCHAR(255),
  tag_id VARCHAR(100),
  sex VARCHAR(50),
  age_or_dob VARCHAR(100),
  status animal_status NOT NULL DEFAULT 'Healthy',
  notes TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_animals_owner ON animals(owner_id);
CREATE INDEX idx_animals_status ON animals(owner_id, status);

CREATE TABLE scan_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  confidence VARCHAR(20),
  urgency VARCHAR(20),
  raw_result JSONB,
  photo_urls TEXT[],
  symptoms TEXT[],
  severity VARCHAR(20),
  duration VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scan_records_owner ON scan_records(owner_id);
CREATE INDEX idx_scan_records_animal ON scan_records(animal_id);
CREATE INDEX idx_scan_records_created ON scan_records(created_at DESC);

CREATE TABLE timeline_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  type timeline_record_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  details TEXT,
  scan_id UUID REFERENCES scan_records(id),
  appointment_id UUID,
  order_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timeline_animal ON timeline_records(animal_id);
CREATE INDEX idx_timeline_date ON timeline_records(animal_id, date DESC);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vet_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  status appointment_status NOT NULL DEFAULT 'pending',
  type appointment_type NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  reason TEXT NOT NULL,
  cost_display VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_owner ON appointments(owner_id);
CREATE INDEX idx_appointments_vet ON appointments(vet_id);
CREATE INDEX idx_appointments_scheduled ON appointments(vet_id, scheduled_at);

ALTER TABLE timeline_records ADD CONSTRAINT fk_appointment
  FOREIGN KEY (appointment_id) REFERENCES appointments(id);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price INT NOT NULL,
  image_urls TEXT[],
  stock INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_visibility ON products(is_active, is_verified) WHERE is_active = true AND is_verified = true;
CREATE INDEX idx_products_recommended ON products(recommended) WHERE recommended = true;

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'pending',
  delivery_fee INT DEFAULT 0,
  total_amount INT NOT NULL,
  delivery_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);

ALTER TABLE timeline_records ADD CONSTRAINT fk_order
  FOREIGN KEY (order_id) REFERENCES orders(id);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  unit_price INT NOT NULL,
  quantity INT NOT NULL,
  subtotal INT NOT NULL,
  image_url TEXT
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_seller ON order_items(seller_id);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  href TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES scan_records(id) ON DELETE CASCADE,
  vet_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  status case_status NOT NULL DEFAULT 'open',
  vet_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cases_vet ON cases(vet_id);
CREATE INDEX idx_cases_status ON cases(vet_id, status);
```

---

## 3. REST API Endpoints

### 3.1 Auth

| Method | Route | Request | Response | Auth | Roles |
|--------|--------|--------|----------|------|--------|
| POST | /auth/login | `{ email, password }` | `{ accessToken, refreshToken?, user: UserDto }` | No | — |
| POST | /auth/register | RegisterRequestDto (name, email, password, phone, role) | AuthResponseDto | No | — |
| GET | /auth/me | — | UserDto (+ profile if owner) | Yes | All |
| POST | /auth/logout | — | 204 | Yes | All |

**UserDto:** id, name, email, role, phone?, profileImageUrl?

### 3.2 Owner: Animals

| Method | Route | Request | Response | Auth | Roles |
|--------|--------|--------|----------|------|--------|
| GET | /animals | — | Animal[] (owner's, status != Archived optional filter) | Yes | OWNER |
| GET | /animals/:id | — | Animal | Yes | OWNER (own) |
| POST | /animals | { name, species, breed?, tagId?, sex?, ageOrDob?, status?, notes?, image? } | Animal | Yes | OWNER |
| PATCH | /animals/:id | partial Animal | Animal | Yes | OWNER (own) |
| DELETE | /animals/:id | — | 204 | Yes | OWNER (own) |

### 3.3 Owner: Records (Timeline + Scans)

| Method | Route | Request | Response | Auth | Roles |
|--------|--------|--------|----------|------|--------|
| GET | /records/timeline | ?animalId= | TimelineRecord[] (merged scan + manual; sorted by date) | Yes | OWNER |
| GET | /records/scans | ?animalId= | ScanRecord[] | Yes | OWNER |
| POST | /records/scans | (multipart: animalId, symptoms[], severity?, duration?, notes?, photos[]) | ScanRecord (after AI); optionally create timeline entry | Yes | OWNER |
| POST | /records/timeline | { animalId, type, title, description, date, details? } | TimelineRecord | Yes | OWNER |

**TimelineRecord:** id, type, title, description, date, details?, animalId.  
**ScanRecord:** id, animalId, summary, confidence, urgency, raw_result (JSONB), photo_urls, symptoms, created_at.

### 3.4 Owner: Appointments

| Method | Route | Request | Response | Auth | Roles |
|--------|--------|--------|----------|------|--------|
| GET | /appointments | ?status=upcoming\|pending\|past\|cancelled | Appointment[] | Yes | OWNER |
| GET | /appointments/:id | — | Appointment | Yes | OWNER (own) |
| POST | /appointments | { vetId, animalId, type, date, time, location?, reason } | Appointment | Yes | OWNER |
| PATCH | /appointments/:id | { scheduledAt } (reschedule) or { status } (cancel) | Appointment | Yes | OWNER (own) |

**Appointment (response):** id, status, dateTime (scheduled_at), type, vetName, clinicName, location, animalName, animalTag?, species, reason, cost?, ownerName?, ownerPhone? (for vet).

### 3.5 Owner: Vets

| Method | Route | Request | Response | Auth | Roles |
|--------|--------|--------|----------|------|--------|
| GET | /vets | ?search=&farmVisits=&twentyFourSeven=&livestock=&poultry=&pets= | Vet[] | Yes | OWNER |
| GET | /vets/:id | — | Vet | Yes | OWNER |

**Vet:** id, clinic, vet, rating, reviews, distance, specialties[], availability, phone, hours, address?, lat?, lng?, farmVisits?, twentyFourSeven?, services?, whatsapp?

### 3.6 Owner: Marketplace & Cart & Orders

**Backend MUST enforce:** Owner marketplace returns ONLY approved/verified and active products. Never return draft, pending, or unverified products to owners.

| Method | Route | Request | Response | Auth | Roles |
|--------|--------|--------|----------|------|--------|
| GET | /marketplace/products | ?category=&search=&recommended= | Product[] (MarketplaceProductDto) **only rows where is_verified = true AND is_active = true** | Yes | OWNER only |
| GET | /marketplace/products/:id | — | MarketplaceProductDto **only if is_verified = true AND is_active = true**; else 404 | Yes | OWNER only |
| GET | /cart | — | CartItem[] (productId, name, price, priceDisplay, quantity, image) | Yes | OWNER |
| POST | /cart | { productId, quantity } | CartItem[] or updated cart | Yes | OWNER |
| PATCH | /cart/items/:productId | { quantity } | — | Yes | OWNER |
| DELETE | /cart/items/:productId | — | 204 | Yes | OWNER |
| POST | /checkout | { items: [{ productId, quantity }], deliveryOption? } | Order (id, status, total, created_at) | Yes | OWNER |
| GET | /orders | — | Order[] (list for owner) | Yes | OWNER |
| GET | /orders/:id | — | Order + order_items | Yes | OWNER (own) |
| PATCH | /orders/:id | { status: cancelled } (owner cancel) | Order | Yes | OWNER (own) |

### 3.7 Owner: Activity & Home

| Method | Route | Request | Response | Auth | Roles |
|--------|--------|--------|----------|------|--------|
| GET | /home/summary | — | { animalCount, activeCasesCount, upcomingAppointmentsCount, recentOrdersCount } | Yes | OWNER |
| GET | /home/activity | — | ActivityItem[] (type, title, description, time, href) from latest scan + next appointment | Yes | OWNER |
| GET | /notifications | — | Notification[] (id, title, message, isRead, createdAt, href) | Yes | All |
| PATCH | /notifications/:id/read | — | 204 | Yes | All |
| POST | /notifications/read-all | — | 204 | Yes | All |

### 3.8 Vet: Appointments & Cases & Patients

| Method | Route | Request | Response | Auth | Roles |
|--------|--------|--------|----------|------|--------|
| GET | /vet/appointments | ?status= | Appointment[] (assigned to vet) | Yes | VET |
| PATCH | /vet/appointments/:id | { status: upcoming\|rejected } (accept/decline) or { status: completed } | Appointment | Yes | VET (assigned) |
| GET | /vet/cases | ?status= | Case[] (scan + vet_notes, status) | Yes | VET |
| PATCH | /vet/cases/:id | { status: resolved\|awaiting_info, vetNotes? } | Case | Yes | VET (assigned) |
| GET | /vet/patients | — | Animal[] (animals that have appointments/cases with this vet) | Yes | VET |

### 3.9 Vet: Dashboard

| Method | Route | Request | Response | Auth | Roles |
|--------|--------|--------|----------|------|--------|
| GET | /vet/dashboard/summary | — | { appointmentsToday, pendingRequests, activeCases, patientsSeen } | Yes | VET |

### 3.10 Seller: Products & Orders & Profile

**Backend MUST enforce:** (1) GET /seller/products returns ONLY current seller’s products (by seller_id), **including** draft/pending/unverified. (2) GET /seller/orders returns ONLY orders that contain at least one order_item whose product belongs to this seller; response includes order header plus **only this seller’s order_items** (do not leak other sellers’ items). Owner role **cannot** call any /seller/* endpoint.

| Method | Route | Request | Response | Auth | Roles |
|--------|--------|--------|----------|------|--------|
| GET | /seller/products | — | Product[] **WHERE seller_id = currentUser.id** (no is_verified/is_active filter); include is_active, is_verified for UI badges | Yes | SELLER only |
| POST | /seller/products | { title, description, category, price, imageUrls?, stock?, isVerified?, recommended? } | Product (seller_id = currentUser.id) | Yes | SELLER only |
| PATCH | /seller/products/:id | partial Product | Product **only if product.seller_id = currentUser.id** | Yes | SELLER only |
| GET | /seller/orders | — | SellerOrder[]: orders where **EXISTS** order_item with product.seller_id = currentUser.id; each order includes **only order_items where seller_id = currentUser.id** (order header: id, dates, status, total_amount, delivery_address) | Yes | SELLER only |
| PATCH | /seller/orders/:id | { status: confirmed\|packed\|dispatched\|delivered } | Order **only if order has at least one order_item.seller_id = currentUser.id** | Yes | SELLER only |
| GET | /seller/profile | — | SellerProfile (store_name, contact_email) | Yes | SELLER only |
| PATCH | /seller/profile | { storeName, contactEmail } | SellerProfile | Yes | SELLER only |
| GET | /seller/dashboard/summary | — | { productsCount, ordersCount, inventoryCount?, payouts? } | Yes | SELLER only |

### 3.11 Admin: Users, Vets, Products, Reports

**Backend MUST enforce:** Only ADMIN role can call /admin/*. Admin can list all products (including draft/unverified) and set is_verified = true (or status = approved). Seller role **cannot** call any /admin/* endpoint.

| Method | Route | Request | Response | Auth | Roles |
|--------|--------|--------|----------|------|--------|
| GET | /admin/dashboard/summary | — | { usersCount, vetsCount, productsCount, reportsCount? } | Yes | ADMIN only |
| GET | /admin/users | — | User[] (paginated) | Yes | ADMIN only |
| PATCH | /admin/users/:id | { role?, suspended? } | User | Yes | ADMIN only |
| GET | /admin/vets | — | Vet[] or (User + vet_profile)[] | Yes | ADMIN only |
| PATCH | /admin/vets/:id | { approved?, ... } | VetProfile | Yes | ADMIN only |
| GET | /admin/products | — | Product[] **all products** (no is_verified/is_active filter) | Yes | ADMIN only |
| PATCH | /admin/products/:id | { is_verified?: boolean, is_active?: boolean, ... } | Product | Yes | ADMIN only |

### 3.12 Profile (Owner)

| Method | Route | Request | Response | Auth | Roles |
|--------|--------|--------|----------|------|--------|
| GET | /profile | — | Profile (fullName, email, phone, location, farmName, preferredAnimals, profilePhotoUrl) | Yes | OWNER |
| PATCH | /profile | partial Profile | Profile | Yes | OWNER |

---

## 4. Computed / Dashboard Endpoints

### 4.1 GET /home/summary (Owner)

- **animalCount:** `SELECT COUNT(*) FROM animals WHERE owner_id = :userId AND status != 'Archived'`.
- **activeCasesCount:** Count of scan_records + timeline_records (type in ('scan','treatment')) for owner’s animals (e.g. last 30 days or “open” cases). Optionally use `cases` table for vet-linked cases.
- **upcomingAppointmentsCount:** `SELECT COUNT(*) FROM appointments WHERE owner_id = :userId AND status IN ('upcoming','pending')` (or map scheduled_at to upcoming).
- **recentOrdersCount:** `SELECT COUNT(*) FROM orders WHERE buyer_id = :userId` (or last 30 days).

### 4.2 GET /vet/dashboard/summary

- **appointmentsToday:** Count appointments where vet_id = :userId and date(scheduled_at) = today.
- **pendingRequests:** Count appointments where vet_id = :userId and status = 'pending'.
- **activeCases:** Count cases where vet_id = :userId and status = 'open'.
- **patientsSeen:** Count distinct animal_id from appointments where vet_id = :userId and status = 'completed'.

### 4.3 GET /seller/dashboard/summary

- **productsCount:** `SELECT COUNT(*) FROM products WHERE seller_id = :userId` (no is_verified/is_active filter).
- **ordersCount:** Count orders where **EXISTS** an order_item with seller_id = :userId (same visibility as GET /seller/orders).
- **inventoryCount:** Sum of stock for seller’s products, or count of low-stock items.
- **payouts:** Placeholder or from payouts table if added later.

---

## 5. Role-Based Access Control

| Role | Scope |
|------|--------|
| **OWNER** | Own animals, own timeline/scan records, own appointments, own cart, own orders, own notifications, own profile. Can list vets; can list **only verified/active** marketplace products (GET /marketplace/products). **Cannot** call any /seller/* or /admin/* endpoint. |
| **VET** | Appointments where vet_id = me; cases assigned to me; patients = animals from those appointments/cases. Cannot call /seller/* or /admin/*. |
| **SELLER** | Own products (all states including draft/unverified via GET /seller/products), own seller_profile; **only** orders that contain at least one of their products (GET /seller/orders); only **their** order_items in response. **Cannot** call /admin/* or owner-only endpoints; **cannot** see other sellers’ products or unrelated orders. |
| **ADMIN** | Read/write users, vets, **all** products (list and set is_verified/is_active). No access to owner-specific data except for support/reports if added. |

**RBAC enforcement (MUST):**

- **Owner** cannot call /seller/* or see unverified products (enforced in backend query for /marketplace/products).
- **Seller** cannot call /admin/*; cannot see other sellers’ products or order_items that do not belong to them.
- **Admin** can see and manage all products (approve/verify).

---

## 6. UI Element → Endpoint Mapping

| UI element | Endpoint(s) |
|------------|-------------|
| /home welcome name, role | GET /auth/me |
| /home stats (Animals, Active Cases, Upcoming Appointments, Recent Orders) | GET /home/summary |
| /home Recent Activity list | GET /home/activity |
| /scan animal list | GET /animals |
| /scan submit (symptoms, photos) → AI result | POST /records/scans |
| /scan Save to records | POST /records/timeline (type=scan) or implied by POST /records/scans |
| /records My Animals list | GET /animals |
| /records Add Animal | POST /animals |
| /records Edit/Archive/Delete animal | PATCH /animals/:id, DELETE /animals/:id |
| /records timeline (merged) | GET /records/timeline?animalId= |
| /records Add Treatment/Note/Vaccine | POST /records/timeline |
| /vets list + filters | GET /vets?search=&... |
| /vets/:id detail | GET /vets/:id |
| /vets map | GET /vets (same; map uses lat/lng from response) |
| /appointments list (tabs) | GET /appointments?status= |
| Book appointment | POST /appointments |
| Reschedule | PATCH /appointments/:id (scheduledAt) |
| Cancel appointment | PATCH /appointments/:id (status=cancelled) |
| /marketplace product list + recommended | GET /marketplace/products?category=&recommended= |
| /marketplace/products/:id | GET /marketplace/products/:id |
| Cart badge, Cart page | GET /cart |
| Add to cart | POST /cart |
| Checkout, Place order | POST /checkout |
| /orders list | GET /orders |
| /orders/:id | GET /orders/:id |
| /notifications list, mark read | GET /notifications, PATCH /notifications/:id/read, POST /notifications/read-all |
| /profile view/edit | GET /profile, PATCH /profile |
| /seller/dashboard stats | GET /seller/dashboard/summary |
| /seller/products list, add/edit | GET /seller/products, POST /seller/products, PATCH /seller/products/:id |
| /seller/orders list, update status | GET /seller/orders, PATCH /seller/orders/:id |
| /seller/profile | GET /seller/profile, PATCH /seller/profile |
| /vet/home stats | GET /vet/dashboard/summary |
| /vet/appointments list, accept/decline/complete | GET /vet/appointments, PATCH /vet/appointments/:id |
| /vet/cases list, notes, resolve | GET /vet/cases, PATCH /vet/cases/:id |
| /vet/patients list | GET /vet/patients |
| /admin/dashboard stats | GET /admin/dashboard/summary |
| /admin/users | GET /admin/users, PATCH /admin/users/:id |
| /admin/vets | GET /admin/vets, PATCH /admin/vets/:id |
| /admin/products | GET /admin/products, PATCH /admin/products/:id |

---

## 7. Flows Supported

- **Start scan → results → save to records → book vet → marketplace recommendations**  
  - Scan: POST /records/scans → returns ScanRecord; frontend can POST /records/timeline with type=scan and same summary/date/animalId.  
  - Book vet: POST /appointments with vetId, animalId, type, date, time, location?, reason.  
  - Marketplace recommendations: GET /marketplace/products?recommended=true (backend can set `recommended` from last scan result or species).

- **Owner orders:** Cart (GET/POST /cart) → Checkout (POST /checkout) → Order created → GET /orders, GET /orders/:id.

- **Vet:** Pending appointments (GET /vet/appointments) → Accept/Decline (PATCH) → Cases from scans (GET /vet/cases) → Update notes/status (PATCH /vet/cases/:id).

- **Seller:** Orders (GET /seller/orders) → Update status (PATCH /seller/orders/:id).

No hardcoded UI sample data is required: all list and card data comes from the above APIs with empty states when counts are zero or lists empty.

---

## 8. Final Check

- **Every card/page** — Home stats, Recent Activity, Scan wizard (animals + submit scan), Records (animals, timeline, add treatment/note), Vets list and detail, Appointments (list, book, reschedule, cancel), Marketplace (products, recommended, cart, checkout, orders), Notifications, Profile; Seller dashboard/products/orders/profile; Vet dashboard/appointments/cases/patients; Admin dashboard/users/vets/products: all have corresponding GET/POST/PATCH endpoints and RBAC.
- **Navigation flows** — Scan → save to records (POST /records/scans + POST /records/timeline); Book vet (POST /appointments); Marketplace recommendations (GET /marketplace/products?recommended=true). Cart → Checkout → Order (POST /cart, POST /checkout).
- **IDs** — Use UUID in DB and API; frontend can use string ids. Cart/checkout can send productId as string (UUID). Numeric surrogate IDs can be added for products if the frontend cart must stay numeric.
- **Validation** — Owner can only access own animals, records, appointments, orders. Vet only assigned appointments and cases. Seller only own products and orders containing their products. Admin: users, vets, products only (no owner PII beyond what’s needed for support).

---

## 9. Product & Order Visibility (Backend Enforcement)

**DO NOT implement with frontend filtering.** All rules below MUST be enforced in backend queries and RBAC.

### 9.1 Product Visibility

| Endpoint | Allowed role | Backend query / behavior |
|----------|--------------|---------------------------|
| GET /marketplace/products | OWNER only | Return **only** products where `is_verified = true AND is_active = true`. Never return draft, pending, or unverified items to owners. Example: `SELECT * FROM products WHERE is_verified = true AND is_active = true [AND category = ?] [AND ...]`. |
| GET /marketplace/products/:id | OWNER only | Return product **only if** `is_verified = true AND is_active = true`; otherwise 404. |
| GET /seller/products | SELLER only | Return **only** current seller’s products: `WHERE seller_id = :currentUser.id`. **No** filter on is_verified or is_active (include draft/pending/unverified). Response must include `is_active`, `is_verified` so UI can show pending/draft badges. |
| GET /admin/products | ADMIN only | Return **all** products (no is_verified/is_active filter). Admin can then PATCH to set is_verified = true or is_active = true. |

### 9.2 Seller Order Visibility

A seller must **only** see orders that contain at least one of **their** products. For each such order, the response must include **only** the order_items that belong to this seller (do not leak other sellers’ items in the same order).

**GET /seller/orders (SELLER only):**

- **Query:** Select orders where there exists at least one order_item whose product belongs to this seller.
  - Join: `orders` → `order_items` → `products` (or use `order_items.seller_id` if present).
  - Filter: `WHERE order_items.seller_id = :currentUser.id` (or `WHERE products.seller_id = :currentUser.id`).
- **Response shape:** For each order return:
  - **Order header:** id, status, total_amount, delivery_address, created_at, updated_at (and any other order-level fields needed for UI).
  - **Order items:** **only** rows from order_items where `order_items.seller_id = :currentUser.id` (or where the linked product.seller_id = currentUser.id). Do **not** include order_items from other sellers in the same order.

**Example SQL (conceptual):**

```sql
-- Orders that contain at least one item from this seller
SELECT DISTINCT o.* FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE oi.seller_id = :currentSellerId;

-- For a given order, only this seller's items
SELECT oi.* FROM order_items oi
WHERE oi.order_id = :orderId AND oi.seller_id = :currentSellerId;
```

**PATCH /seller/orders/:id:** Allow status update **only if** the order has at least one order_item with seller_id = currentUser.id (same filter as above).

**Order creation (POST /checkout):** When creating order_items, set **order_items.seller_id** from the product’s seller_id so that seller-order visibility and filtering work without joining to products every time.

### 9.3 Data Model (Minimum for Visibility)

- **products:** id, seller_id, name (or title), price, stock, **is_active**, **is_verified**, created_at, updated_at.
- **orders:** id, buyer_id, status, **total_amount**, **delivery_address**, created_at, updated_at.
- **order_items:** id, order_id, product_id, **seller_id** (recommended for fast filtering), qty, **unit_price**, **subtotal**.

### 9.4 RBAC Summary

- **Owner:** Cannot call /seller/*. Can only receive verified+active products from /marketplace/products.
- **Seller:** Cannot call /admin/*. Can only see own products (all states) and orders that contain their items; within an order, only their own order_items.
- **Admin:** Can list all products and set is_verified / is_active (approve/verify).
