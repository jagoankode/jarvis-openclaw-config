# Keycloak Dev — epics-portal-gi

## Setup

```bash
docker compose up -d
```

Akses dashboard: http://localhost:8080
- User: `admin`
- Pass: `admin`

## Import Realm

Import otomatis lewat volume mount di `docker-compose.yml`.

Atau manual: Login → Create Realm → Import → pilih `realm-epics-portal-gi.json`

## Sample Users

| Username   | Password     | Roles                                            |
|------------|-------------|--------------------------------------------------|
| admin      | admin123    | admin, user, product-configurator, case-manager, approver |
| user       | user123     | user                                             |
| approver   | approver123 | user, approver                                   |

## Client

| Client ID | Redirect URI                    | Secret |
|-----------|--------------------------------|--------|
| web-gi    | http://localhost:3000/*        | (isi sendiri) |

## ⚠️ Sebelum dipake

1. Edit `realm-epics-portal-gi.json` → ganti `"secret"` di client `web-gi`
2. Jangan commit file JSON yang masih berisi secret asli!

## Port

| Service     | Host Port |
|-------------|-----------|
| Keycloak    | 8080      |
| PostgreSQL  | 5433      |
