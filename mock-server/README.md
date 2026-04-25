# Mock Auth Backend Server

Local mock backend for testing App Finance authentication endpoints.

## Quick Start

```bash
cd mock-server
npm install
npm start
```

Server runs on `http://localhost:3001`

## API Endpoints

### GET /auth/check-email?email=...
```bash
curl "http://localhost:3001/auth/check-email?email=admin@example.com"
# Response: { "exists": true, "email": "admin@example.com" }
```

### GET /auth/check-nickname?nickname=...
```bash
curl "http://localhost:3001/auth/check-nickname?nickname=admin"
# Response: { "exists": true, "nickname": "admin" }
```

### POST /auth/register
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "ValidPass123",
    "name": "Juan",
    "nickname": "juanito"
  }'
```

## Validation Rules

- **Email**: RFC 5322 format, max 254 chars, unique
- **Password**: 8+ chars, uppercase + lowercase + numbers, no leading/trailing spaces
- **Name**: 2-100 chars, required
- **Nickname**: Alphanumeric/hyphens/underscores, 2+ chars, optional, unique

## Pre-registered Test Data

**Emails**: admin@example.com, test@example.com, user@finance.app
**Nicknames**: admin, testuser, finance_app

## Use with App Finance

```bash
EXPO_PUBLIC_API_URL=http://localhost:3001 npm start
```

See `docs/INTEGRATION_TESTING.md` for full guide.
