# 📊 Dashboard Monitoring Real-Time — Arsitektur & Tech Spec

**Status:** Draft v1.0  
**Task ID:** task-1783811808131-step-2  
**Author:** CTO  
**Date:** 2026-07-12

---

## 1. Executive Summary

Sistem dashboard monitoring real-time untuk memantau:

| Kategori | Metrik |
|---|---|
| 🖥️ **System** | CPU, Memory, Disk I/O, Network, Uptime |
| 🚀 **Application** | Requests/sec, Error rate, Latency (p50/p95/p99), Active connections |
| 💰 **Business** | Orders/min, Revenue, Active users, Conversion rate |
| 🗄️ **Database** | Connection pool, Query latency, Cache hit ratio, Deadlocks |

**Target:** Update interval ≤2 detik, latency between collection → display <1 detik.

---

## 2. Arsitektur Sistem

```
┌──────────────────────────────────────────────────────────────┐
│                     📡 COLLECTION LAYER                       │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ System  │  │   App    │  │ Database │  │   Business   │  │
│  │ Agent   │  │  Agent   │  │  Agent   │  │    Agent     │  │
│  │(os-utils│  │(req hook)│  │(pg stats)│  │(event hook)  │  │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │            │             │               │           │
│       └────────────┴──────┬──────┴───────────────┘           │
│                           │                                   │
│                     Collectors (poll 2s)                      │
└───────────────────────────┬───────────────────────────────────┘
                            │ emit metrics
┌───────────────────────────▼───────────────────────────────────┐
│                     ⚡ STREAMING LAYER                         │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Redis Pub/Sub + Streams                   │    │
│  │   • metrics:system → {cpu, mem, disk}                 │    │
│  │   • metrics:app   → {rps, errors, latency}           │    │
│  │   • metrics:db    → {pool, queries, cache}           │    │
│  │   • metrics:biz   → {orders, revenue, users}         │    │
│  │   • alerts:*      → threshold alerts                 │    │
│  └──────────────────────┬───────────────────────────────┘    │
└───────────────────────────┬───────────────────────────────────┘
                            │ subscribe
┌───────────────────────────▼───────────────────────────────────┐
│                     ⚙️ PROCESSING LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  Aggregator  │  │  Alert       │  │  Persistence     │    │
│  │ (window avg) │  │  Engine      │  │  Writer          │    │
│  │  10s/1m/5m  │  │ (threshold)  │  │  → TimescaleDB   │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘    │
└─────────┼─────────────────┼─────────────────┼─────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │ push
┌───────────────────────────▼───────────────────────────────────┐
│                     🌐 API LAYER (Node.js)                     │
│  ┌──────────────────┐  ┌──────────────────────────────────┐  │
│  │   REST API       │  │   WebSocket Server               │  │
│  │ GET /metrics     │  │   Socket.IO namespace:           │  │
│  │ GET /alerts      │  │   • /live    → real-time stream  │  │
│  │ GET /history     │  │   • /alerts  → alert push        │  │
│  └────────┬─────────┘  └────────────┬─────────────────────┘  │
└───────────┼─────────────────────────┼─────────────────────────┘
            │                         │
┌───────────▼─────────────────────────▼─────────────────────────┐
│                    🎨 PRESENTATION LAYER                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Dashboard SPA (React + Chart.js)            │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────────────┐ │ │
│  │  │ System  │ │   App   │ │   Biz   │ │     Alerts     │ │ │
│  │  │ Panel   │ │  Panel  │ │  Panel  │ │     Panel      │ │ │
│  │  │ CPU ████ │ │ RPS ███ │ │Rev ████ │ │ 🔴 CPU > 90%  │ │ │
│  │  │ MEM ███  │ │ Lat ██  │ │Ord ██   │ │ 🟡 Disk > 80% │ │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └────────────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow (end-to-end)

```
Agent poll (2s) → Redis Pub/Sub → Aggregator (window) →
→ TimescaleDB (persist) + WebSocket push (live) →
→ Dashboard render (<1s latency)
```

---

## 3. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Runtime** | Node.js 20+ | Monorepo dengan backend existing |
| **WebSocket** | Socket.IO 4.x | Auto-reconnect, rooms, namespaces, battle-tested |
| **Message Broker** | Redis 7+ | Pub/Sub + Streams untuk buffering & replay |
| **Time-series DB** | TimescaleDB (PostgreSQL ext) | Hypertable auto-partition, continuous aggregates |
| **Metric Agents** | `systeminformation` npm, custom middleware | Ringan, no external binary |
| **Frontend** | React 18 + Vite | Fast dev, component ecosystem |
| **Charts** | Chart.js 4 + `react-chartjs-2` | Performant, animation, real-time update friendly |
| **Alerting** | In-app + webhook (Slack/Discord) | Rules engine di processing layer |
| **Container** | Docker Compose | Redis + TimescaleDB + App |

### Why NOT these alternatives?

| Rejected | Why |
|---|---|
| Grafana + Prometheus | Heavy setup, overkill untuk custom business metrics |
| Server-Sent Events | Unidirectional; butuh bidirectional untuk command/ack |
| InfluxDB | Another DB to manage; TimescaleDB pakai PostgreSQL yang sudah ada |
| WebSocket raw (ws) | No reconnection, rooms, or multiplexing built-in |
| Kafka | Overkill untuk skala ini; Redis Streams cukup |

---

## 4. Data Model (TimescaleDB)

### 4.1 Hypertable: `metrics`

```sql
CREATE TABLE metrics (
  time        TIMESTAMPTZ NOT NULL,
  category    VARCHAR(20) NOT NULL,  -- system | app | db | business
  name        VARCHAR(100) NOT NULL, -- cpu_usage | memory_used | rps | orders_count
  value       DOUBLE PRECISION NOT NULL,
  tags        JSONB,                 -- {host: "web-1", region: "ap-southeast"}
  unit        VARCHAR(20)            -- percent | bytes | count | ms | rps
);

-- Konversi ke hypertable: auto-partition per 1 jam
SELECT create_hypertable('metrics', 'time', chunk_time_interval => INTERVAL '1 hour');

-- Index untuk query by category + time
CREATE INDEX idx_metrics_category_time ON metrics (category, time DESC);
CREATE INDEX idx_metrics_name_time ON metrics (name, time DESC);

-- Continuous aggregate: 1 jam rollup
CREATE MATERIALIZED VIEW metrics_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', time) AS bucket,
  category,
  name,
  AVG(value) AS avg_value,
  MIN(value) AS min_value,
  MAX(value) AS max_value,
  COUNT(*)   AS sample_count
FROM metrics
GROUP BY bucket, category, name;
```

### 4.2 Alerts

```sql
CREATE TABLE alerts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  severity    VARCHAR(10) NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  category    VARCHAR(20) NOT NULL,
  name        VARCHAR(100) NOT NULL,
  message     TEXT NOT NULL,
  value       DOUBLE PRECISION,
  threshold   DOUBLE PRECISION,
  status      VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_status ON alerts (status, created_at DESC);
```

### 4.3 Alert Rules

```sql
CREATE TABLE alert_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  operator    VARCHAR(5) NOT NULL CHECK (operator IN ('>', '<', '>=', '<=', '==')),
  threshold   DOUBLE PRECISION NOT NULL,
  severity    VARCHAR(10) NOT NULL DEFAULT 'warning',
  duration    INT NOT NULL DEFAULT 60,  -- detik, metric harus di atas threshold selama ini
  cooldown    INT NOT NULL DEFAULT 300, -- detik, jeda antar alert
  enabled     BOOLEAN NOT NULL DEFAULT true
);
```

---

## 5. WebSocket Protocol

### 5.1 Namespace: `/live`

Server → Client (real-time metric push):

```json
{
  "event": "metrics:update",
  "timestamp": "2026-07-12T06:55:00.000Z",
  "payload": {
    "system": {
      "cpu_percent": 45.2,
      "memory_used_percent": 62.1,
      "memory_total_gb": 16,
      "disk_used_percent": 71.3,
      "network_rx_bytes": 1048576,
      "network_tx_bytes": 524288,
      "uptime_seconds": 864000
    },
    "app": {
      "requests_per_sec": 142.5,
      "error_rate_percent": 0.3,
      "latency_p50_ms": 12,
      "latency_p95_ms": 45,
      "latency_p99_ms": 120,
      "active_connections": 48
    },
    "database": {
      "pool_active": 8,
      "pool_idle": 12,
      "pool_waiting": 0,
      "query_latency_avg_ms": 3.2,
      "cache_hit_ratio": 0.94,
      "deadlocks_last_min": 0
    },
    "business": {
      "orders_per_min": 3.2,
      "revenue_per_min": 450000,
      "active_users": 23,
      "cart_abandon_rate": 0.35
    }
  }
}
```

Client → Server:

```json
// Subscribe to specific metric categories
{ "event": "subscribe", "categories": ["system", "business"] }

// Unsubscribe
{ "event": "unsubscribe", "categories": ["database"] }

// Request historical snapshot
{ "event": "history:request", "category": "system", "metric": "cpu_percent", "duration": "1h" }
```

### 5.2 Namespace: `/alerts`

Server → Client:

```json
{
  "event": "alert:new",
  "alert": {
    "id": "uuid",
    "severity": "critical",
    "category": "system",
    "name": "CPU Usage",
    "message": "CPU usage exceeded 90% for 60s",
    "value": 94.5,
    "threshold": 90,
    "timestamp": "2026-07-12T06:55:00.000Z"
  }
}
```

---

## 6. REST API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/monitor/history?category=system&metric=cpu&from=1h&to=now` | Historical metric data |
| `GET` | `/api/monitor/snapshot` | Latest snapshot semua metrik |
| `GET` | `/api/monitor/alerts?status=active` | List alerts |
| `PUT` | `/api/monitor/alerts/:id/acknowledge` | Acknowledge alert |
| `PUT` | `/api/monitor/alerts/:id/resolve` | Resolve alert |
| `GET` | `/api/monitor/rules` | List alert rules |
| `POST` | `/api/monitor/rules` | Create alert rule |
| `PUT` | `/api/monitor/rules/:id` | Update alert rule |
| `DELETE` | `/api/monitor/rules/:id` | Delete alert rule |

---

## 7. Frontend Component Architecture

```
src/
├── App.tsx                        # Root, Socket.IO provider
├── hooks/
│   ├── useSocket.ts               # Socket.IO connection manager
│   ├── useMetrics.ts              # Subscribe/unsubscribe metrics
│   ├── useAlerts.ts               # Alert subscription + acknowledge
│   └── useHistory.ts              # Fetch historical data
├── components/
│   ├── Layout.tsx                  # Header + sidebar + main area
│   ├── StatusBar.tsx               # Top bar: connection status, last update
│   ├── SystemPanel.tsx             # CPU, Memory, Disk, Network gauges
│   ├── ApplicationPanel.tsx        # RPS, Latency, Error rate charts
│   ├── BusinessPanel.tsx           # Orders, Revenue, Users counters
│   ├── DatabasePanel.tsx           # Pool, Query latency, Cache chart
│   ├── AlertsPanel.tsx             # Alert list + acknowledge
│   ├── MetricCard.tsx              # Single metric with sparkline
│   ├── GaugeChart.tsx              # Radial gauge (Chart.js)
│   ├── LineChart.tsx               # Time-series line chart (realtime)
│   ├── AlertBadge.tsx              # Severity badge component
│   └── TimeRangeSelector.tsx       # 15m | 1h | 6h | 24h selector
├── pages/
│   └── Dashboard.tsx               # Main dashboard page
└── utils/
    ├── formatters.ts               # Number/date formatting
    └── constants.ts                 # Colors, thresholds
```

### Component State Diagram

```
App
├── SocketProvider (connection state: connected | reconnecting | disconnected)
│   ├── StatusBar ← socket.connected, lastPing
│   ├── AlertsPanel ← useAlerts() → socket.on('alert:new')
│   │   ├── AlertItem (severity, message, ack button)
│   │   └── AlertBadge
│   └── Dashboard
│       ├── SystemPanel ← useMetrics(['system'])
│       │   ├── MetricCard (CPU) → GaugeChart
│       │   ├── MetricCard (Memory) → GaugeChart
│       │   └── MetricCard (Disk) → GaugeChart
│       ├── ApplicationPanel ← useMetrics(['app'])
│       │   ├── LineChart (RPS over time)
│       │   └── LineChart (Latency percentiles)
│       ├── BusinessPanel ← useMetrics(['business'])
│       │   └── MetricCard (Orders, Revenue, Users)
│       └── DatabasePanel ← useMetrics(['db'])
│           └── MetricCard (Pool, Cache ratio)
```

---

## 8. Key Design Decisions

### 8.1 Metric Collection Agent

```javascript
// Agent runs in-process dengan app server, poll setiap 2 detik
class MetricAgent {
  constructor(category, interval = 2000) {
    this.category = category;
    this.interval = interval;
  }

  async collect() {
    // Category-specific collection logic
    // system → si.cpu(), si.mem()
    // app    → aggregate dari in-memory counters
    // db     → pg_stat_activity, pg_stat_database
    // biz    → query dari orders/payments table
  }

  start() {
    this.timer = setInterval(async () => {
      const metrics = await this.collect();
      await redis.publish(`metrics:${this.category}`, JSON.stringify(metrics));
    }, this.interval);
  }
}
```

### 8.2 WebSocket Fan-out dengan Redis Adapter

```javascript
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');

const io = new Server(httpServer);
io.adapter(createAdapter(redisPub, redisSub));

// Skala horizontal: multiple API server instances share socket state via Redis
```

### 8.3 Alert Engine

```
redis.subscribe('metrics:*') → check against alert_rules →
→ evaluate threshold + duration window →
→ if triggered & not in cooldown →
→ insert alert + publish redis 'alert:new' →
→ io.of('/alerts').emit('alert:new', {...})
```

### 8.4 Historical Data Retention

| Resolution | Retention |
|---|---|
| Raw (2s) | 2 hours |
| 1-minute rollup | 24 hours |
| 1-hour rollup (continuous aggregate) | 30 days |
| 1-day rollup | 1 year |

TimescaleDB auto-compression & retention policies:
```sql
SELECT add_retention_policy('metrics', INTERVAL '2 hours');
SELECT add_compression_policy('metrics', INTERVAL '1 hour');
```

---

## 9. Deployment Architecture

```
docker-compose.yml
─────────────────────
services:
  app:           # Node.js API server (2 instances for HA)
  redis:         # Redis 7 (single instance, cukup untuk skala ini)
  timescaledb:   # TimescaleDB (PostgreSQL 15 extension)
  dashboard:     # Nginx serving React SPA + reverse proxy to API
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
  
  timescaledb:
    image: timescale/timescaledb:latest-pg15
    environment:
      POSTGRES_DB: monitoring
      POSTGRES_USER: monitor
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data
  
  api:
    build: ./api
    environment:
      REDIS_URL: redis://redis:6379
      DATABASE_URL: postgresql://monitor:${DB_PASSWORD}@timescaledb:5432/monitoring
    deploy:
      replicas: 2
    depends_on: [redis, timescaledb]
  
  dashboard:
    build: ./dashboard
    ports:
      - "80:80"
    depends_on: [api]
```

---

## 10. Implementation Milestones

| # | Milestone | Estimasi | Deliverable |
|---|---|---|---|
| 1 | **Data Pipeline** — Agent + Redis Pub/Sub + TimescaleDB schema | 2 hari | Metric collection & persistence |
| 2 | **WebSocket API** — Socket.IO server + Redis adapter + namespaces | 1 hari | Real-time streaming endpoint |
| 3 | **Alert Engine** — Rules evaluation + cooldown + notification | 1 hari | Alert creation & delivery |
| 4 | **Dashboard UI** — React panels + real-time charts + alert management | 2 hari | Full dashboard SPA |
| 5 | **Integration Test** — Load test + alert scenario test + edge cases | 1 hari | Test report |
| **Total** | | **7 hari** | |

---

## 11. Risk & Mitigation

| Risk | Severity | Mitigation |
|---|---|---|
| Redis memory overflow | 🔴 High | Stream MAXLEN ~10000; TTL pada key pub/sub |
| TimescaleDB write pressure | 🟡 Medium | Batch insert (1 detik buffer); compression |
| Socket.IO reconnection storm | 🟡 Medium | Exponential backoff; connection limits |
| Browser memory from chart data | 🟡 Medium | Ring buffer max 500 data points per chart |
| Alert storm (flapping) | 🔴 High | Cooldown duration; deduplication on insert |

---

## 12. Open Questions for CEO

1. **Scope:** System metrics perlu di semua server atau cukup API server saja?
2. **Auth:** Dashboard monitoring publik atau butuh login admin?
3. **Notification:** Alert perlu Slack/Discord/Telegram integration?
4. **Retention:** 30 hari cukup atau butuh lebih panjang untuk compliance?
5. **Multi-tenant:** Dashboard akan melayani multiple projects atau single project?
