# 📊 Dashboard Monitoring — API Reference

## Base URL
```
http://localhost:3000/api/monitor
```

## Authentication
Bearer token (JWT), role: `admin`.

---

## REST Endpoints

### GET /history
Historical metric data from TimescaleDB.

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `category` | string | Yes | `system` \| `app` \| `db` \| `business` |
| `metric` | string | Yes | Metric name, e.g. `cpu_percent` |
| `from` | string | No | ISO timestamp or relative: `1h`, `6h`, `24h` |
| `to` | string | No | Default: `now` |
| `bucket` | string | No | `raw` \| `1m` \| `1h` \| `1d` |

**Response:**
```json
{
  "success": true,
  "data": {
    "category": "system",
    "metric": "cpu_percent",
    "unit": "percent",
    "points": [
      { "time": "2026-07-12T06:00:00Z", "value": 42.5 },
      { "time": "2026-07-12T06:01:00Z", "value": 45.1 }
    ],
    "stats": {
      "avg": 44.2,
      "min": 38.1,
      "max": 52.3
    }
  }
}
```

---

### GET /snapshot
Latest snapshot of all metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2026-07-12T06:55:00Z",
    "system": { "cpu_percent": 45.2, "memory_used_percent": 62.1, "disk_used_percent": 71.3 },
    "app": { "requests_per_sec": 142.5, "error_rate_percent": 0.3, "latency_p95_ms": 45 },
    "db": { "pool_active": 8, "cache_hit_ratio": 0.94 },
    "business": { "orders_per_min": 3.2, "revenue_per_min": 450000 }
  }
}
```

---

### GET /alerts

| Query | Type | Description |
|---|---|---|
| `status` | string | `active` \| `acknowledged` \| `resolved` |
| `severity` | string | `critical` \| `warning` \| `info` |
| `limit` | int | Default 50 |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "severity": "critical",
      "category": "system",
      "name": "CPU Usage",
      "message": "CPU exceeded 90% threshold for 60s",
      "value": 94.5,
      "threshold": 90,
      "status": "active",
      "created_at": "2026-07-12T06:50:00Z"
    }
  ]
}
```

---

### PUT /alerts/:id/acknowledge
Acknowledge an alert.

**Response:** `{ "success": true, "data": { "id": "uuid", "status": "acknowledged" } }`

---

### PUT /alerts/:id/resolve
Resolve an alert.

**Response:** `{ "success": true, "data": { "id": "uuid", "status": "resolved", "resolved_at": "..." } }`

---

### CRUD /rules

| Method | Path | Description |
|---|---|---|
| `GET` | `/rules` | List all alert rules |
| `POST` | `/rules` | Create new rule |
| `PUT` | `/rules/:id` | Update rule |
| `DELETE` | `/rules/:id` | Delete rule |

**Rule Object:**
```json
{
  "id": "uuid",
  "name": "High CPU",
  "metric_name": "cpu_percent",
  "operator": ">",
  "threshold": 90,
  "severity": "critical",
  "duration": 60,
  "cooldown": 300,
  "enabled": true
}
```

---

## WebSocket Protocol

### Connection

```javascript
const socket = io('http://localhost:3000/live', {
  auth: { token: 'jwt-token' },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000
});
```

### Events: Client → Server

| Event | Payload | Description |
|---|---|---|
| `subscribe` | `{ categories: ["system", "app"] }` | Subscribe to metric categories |
| `unsubscribe` | `{ categories: ["db"] }` | Unsubscribe categories |
| `history:request` | `{ category, metric, duration }` | Request historical data |

### Events: Server → Client

| Event | Payload | Description |
|---|---|---|
| `metrics:update` | `{ timestamp, payload: { system, app, db, business } }` | Real-time metric push (2s interval) |
| `history:response` | `{ category, metric, points }` | Historical data response |
| `alert:new` | `{ id, severity, message, ... }` | New alert created |
| `alert:updated` | `{ id, status }` | Alert acknowledged/resolved |
| `connection:status` | `{ status, timestamp }` | Connection health ping |

### Connection States

| State | UI Indication |
|---|---|
| `connected` | 🟢 Live — green dot + "Connected" |
| `reconnecting` | 🟡 Reconnecting... — yellow dot + spinner |
| `disconnected` | 🔴 Disconnected — red dot + "Retry" button |
