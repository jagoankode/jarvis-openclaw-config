# Ecommerce API — Deployment Checklist

## 1. Environment
- [ ] Copy `.env.example` → `.env`
- [ ] Generate strong `JWT_SECRET`: `openssl rand -hex 64`
- [ ] Set `DATABASE_URL`: `postgresql://user:pass@host:5432/ecommerce`
- [ ] Set `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY`
- [ ] Set `NODE_ENV=production`
- [ ] Set `CORS_ORIGIN` ke domain frontend

## 2. Database
- [ ] PostgreSQL 14+ terinstall
- [ ] Database `ecommerce` sudah dibuat
- [ ] `npm run db:migrate` sukses
- [ ] (Optional) `npm run db:seed` untuk data test

## 3. Deployment
- [ ] `npm ci --production` (install deps)
- [ ] PM2 atau systemd untuk process management
- [ ] Health check endpoint: `GET /api/health`
- [ ] Logging: arahkan ke file dengan PM2

## 4. Payment Gateway
- [ ] Midtrans account active
- [ ] Server key & client key valid
- [ ] Webhook URL terdaftar di Midtrans dashboard: `POST /api/payments/notification`
- [ ] Test dengan Midtrans sandbox dulu (`MIDTRANS_IS_PRODUCTION=false`)

## 5. Security
- [ ] Rate limiting sudah di-set
- [ ] HTTPS enabled (via nginx reverse proxy)
- [ ] Firewall: hanya port 80/443 terbuka
- [ ] JWT_EXPIRES_IN sesuai kebutuhan

## 6. Monitoring
- [ ] `/api/health` dicek oleh uptime monitor
- [ ] Log rotation di-set
- [ ] Alert jika ada error spike
