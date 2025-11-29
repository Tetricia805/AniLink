# AniLink API – Phase 8 (Real-Time Push)

## Socket.io Endpoint

- URL: same host/port as API (e.g., `http://localhost:5000`)
- Client connects with:
  ```js
  const socket = io('http://localhost:5000', {
    auth: { token: '<JWT access token>' }
  });
  ```

### Events Emitted by Server
| Event | Payload | Description |
|-------|---------|-------------|
| `dashboard:unread` | `{ notifications, messages }` | Sent on connect and whenever unread counts change |
| `notification:new` | Notification document | Fired when admin broadcasts or system generates a notification |
| `conversation:new-message` | `{ conversationId, message }` | Fired to participants (except sender) when a chat message arrives |
| `order:new` / `order:update` / `order:paid` | `{ orderId, status, paymentStatus, total, updatedAt }` | Keeps farmers & vendors in sync on order lifecycle |
| `appointment:new` / `appointment:update` / `appointment:completed` | `{ appointmentId, status, scheduledFor, updatedAt }` | Alerts farmers about appointment changes |

### Server-Side Changes
- `sockets/socketManager.js` authenticates sockets, tracks connections per user, and exposes helpers `emitToUser`, `emitToUsers`, `sendUnreadCounts`.
- `services/pushService.js` wraps common events (notifications/messages/orders/appointments) so controllers remain clean.
- Controllers now emit push events:
  - Notifications broadcast to recipients + refresh unread counters.
  - Conversations dispatch `conversation:new-message` and refresh unread counts.
  - Orders/appointments push lifecycle updates automatically.
- Initial unread counts (notifications + message count) are sent on connect and whenever a read status changes.

### Integration Notes
- Frontend should listen for the events above and update UI badges, chat threads, etc.
- When a socket disconnects, no extra cleanup is required—counts resync on next connect.
- Future enhancements can piggyback on the push service (e.g., health alerts, payment confirmations).

