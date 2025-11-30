# AniLink API – Phase 7 (Admin Analytics & Exports)

Base URL: `http://localhost:5000/api`

All endpoints under `/api/admin/*` require Admin role.

---

## Dashboard Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/overview` | Aggregate metrics (user counts, appointment & order status breakdowns, unread notifications, latest AI insights) |
| `GET` | `/admin/recent-activity` | Latest appointments, orders, and health records for situational awareness |

Sample overview response:
```json
{
  "status": "success",
  "data": {
    "users": {
      "total": 1240,
      "farmers": 900,
      "vets": 120,
      "vendors": 50
    },
    "appointments": [
      { "_id": "confirmed", "count": 45 },
      { "_id": "pending", "count": 12 }
    ],
    "orders": [
      { "_id": "completed", "count": 30, "totalVolume": 4500000 }
    ],
    "recentAI": [
      { "_id": "...", "type": "fmd_risk", "confidence": 0.6, "createdAt": "..." }
    ],
    "unreadNotifications": 27
  }
}
```

---

## Data Exports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/exports/orders?from=2025-11-01&to=2025-11-30` | CSV download of orders (date range optional) |
| `GET` | `/admin/exports/appointments?from=...&to=...` | CSV download of appointments |

Returns `text/csv` attachments (`orders.csv`, `appointments.csv`) suitable for Excel / partners.

---

## Implementation Notes

- Aggregates leverage MongoDB pipeline/grouping for live metrics.
- CSV builder ensures fields are escaped and serialized consistently.
- Date filters (`from`, `to`) accept ISO strings; omitted filters export all records.
- Overview pulls unread notification count so admins can address pending alerts quickly.

---

## Future Enhancements

- Schedule automated email exports.
- Add trend endpoints (weekly growth, heatmaps).
- Integrate BI tools or embed charts once analytics UI is ready.

