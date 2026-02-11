# Case Notifications QA Checklist

Backend case notifications (owner and vet) with deep-link support.

## Endpoints

| Action | Endpoint | Who | Notification |
|--------|----------|-----|--------------|
| Create case | `POST /v1/cases` (multipart) | Owner | Owner: "New case created" → `/records?focusCase=<id>` |
| Assign vet | `POST /v1/cases/{id}/assign` body `{"vet_user_id": "..."}` | Vet/Admin | Vet: "New case assigned" → `/vet/cases?focus=<id>` |
| Close case | `POST /v1/cases/{id}/close` | Owner | Owner: "Case closed" → `/records?focusCase=<id>` |

## Manual QA Checklist

### 1. Create case as Owner → Owner sees notification

1. Log in as Owner (owner@example.com / password123).
2. Create a case via `POST /v1/cases` (multipart: animal_type, symptoms, notes, etc.).
3. **Check:** Owner GET /v1/notifications returns a notification with:
   - type: "CASE"
   - title: "New case created"
   - message: "A case was created for your animal."
   - payload.action_url: `/records?focusCase=<case_id>`
   - payload.entity_type: "case", payload.entity_id: `<case_id>`
4. In the app, Notifications → "View details" → lands on `/records?focusCase=<id>`, RecordDetailsSheet opens.

### 2. Assign vet → Vet sees notification

1. Log in as Vet or Admin.
2. Call `POST /v1/cases/{case_id}/assign` with body `{"vet_user_id": "<vet_user_uuid>"}`.
3. **Check:** Vet GET /v1/notifications returns a notification with:
   - type: "CASE"
   - title: "New case assigned"
   - message: "A case has been assigned to you for review."
   - payload.action_url: `/vet/cases?focus=<case_id>`
4. In the app, Vet Notifications → "View details" → lands on `/vet/cases?focus=<id>`.
5. **Idempotency:** Call assign again with same vet_user_id → no duplicate notification.

### 3. Close case → Owner sees notification

1. Log in as Owner.
2. Call `POST /v1/cases/{case_id}/close`.
3. **Check:** Owner GET /v1/notifications returns a notification with:
   - type: "CASE"
   - title: "Case closed"
   - message: "Your case has been closed."
   - payload.action_url: `/records?focusCase=<case_id>`
4. **Idempotency:** Call close again → no duplicate notification (case already CLOSED).

### 4. Seed data

After `python scripts/seed_data.py` (with existing_cases == 0):

- Owner has "New case created" notification for the seed case.
- Vet has "New case assigned" notification for the seed case.
