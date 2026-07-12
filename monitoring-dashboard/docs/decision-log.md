# Decision Log — Dashboard Monitoring

| # | Decision | Options Considered | Chosen | Rationale |
|---|---|---|---|---|
| 1 | **Real-time protocol** | SSE, WebSocket raw, Socket.IO, gRPC stream | **Socket.IO** | Auto-reconnect, rooms, Redis adapter for horizontal scaling, mature |
| 2 | **Time-series DB** | InfluxDB, TimescaleDB, ClickHouse, raw PG | **TimescaleDB** | Leverages existing PostgreSQL; no new infra; continuous aggregates built-in |
| 3 | **Message broker** | Kafka, RabbitMQ, Redis Streams, in-process EventEmitter | **Redis Pub/Sub + Streams** | Already in stack; Streams provides buffering & replay; lightweight |
| 4 | **Frontend framework** | React, Vue, Svelte, vanilla JS | **React + Vite** | Ecosystem: `react-chartjs-2`, `socket.io-client` hooks; team familiarity |
| 5 | **Chart library** | D3, ECharts, Chart.js, Recharts | **Chart.js 4** | Best real-time perf (canvas), animation support, small bundle |
| 6 | **Agent deployment** | Sidecar container, systemd service, in-process module | **In-process module** | Simplest; low overhead; no separate lifecycle to manage |
| 7 | **Metric collection interval** | 1s, 2s, 5s, 10s | **2 seconds** | Balance between real-time feel & system overhead |
| 8 | **Alert deduplication** | In-memory Set, Redis SETNX, DB unique constraint | **DB check + cooldown** | Cooldown field prevents re-trigger; simplest with strong guarantee |
| 9 | **Historical retention** | 24h raw + 7d rollup, 2h raw + 30d rollup, all raw | **2h raw + 30d rollup** | TimescaleDB auto-compression; balances detail vs storage |
| 10 | **Auth for dashboard** | No auth, JWT admin only, separate API key | **JWT admin only** | Reuse existing auth system; consistent with ecommerce backend |
