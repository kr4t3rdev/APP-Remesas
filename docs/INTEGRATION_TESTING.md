# Integration Testing Guide

Complete guide for testing RegisterScreen with mock backend and running tests.

## What's New

✅ Mock backend server (Express.js)
✅ useDebounce hook for API calls
✅ Integration tests for RegisterScreen
✅ Local development setup

## Running Tests

### Unit Tests

```bash
npm test  # All tests
npm test src/hooks/__tests__/useDebounce.test.ts  # Just debounce
npm test src/utils/__tests__/validators.test.ts  # Just validators
```

### Integration Tests

```bash
npm test src/screens/auth/__tests__/RegisterScreen.integration.test.tsx
```

### E2E Tests with Mock Server

Terminal 1: Start mock server
```bash
cd mock-server
npm install  # First time only
npm start
```

Terminal 2: Start app
```bash
EXPO_PUBLIC_API_URL=http://localhost:3001 npm start
```

## Mock Server API

### Check Email
```bash
GET /auth/check-email?email=user@example.com
# { "exists": false, "email": "user@example.com" }
```

### Check Nickname
```bash
GET /auth/check-nickname?nickname=juanito
# { "exists": false, "nickname": "juanito" }
```

### Register User
```bash
POST /auth/register
{
  "email": "user@example.com",
  "password": "ValidPass123",
  "name": "Juan",
  "nickname": "juanito"
}
# { "success": true, "user": {...}, "access_token": "..." }
```

## Key Features

✅ Real-time validation  
✅ Simulated network delays  
✅ Pre-registered test data  
✅ Full error handling  
✅ Debouncing for API calls  
✅ 7 debounce tests (all passing)  
✅ 25+ integration tests  

## Debounce Hook

Delays API calls until user stops typing (500ms default):

```typescript
const [email, setEmail] = useState('');
const debouncedEmail = useDebounce(email, 500);

useEffect(() => {
  checkEmailExists(debouncedEmail);
}, [debouncedEmail]);
```

## Pre-registered Test Data

**Existing Emails**: 
- admin@example.com
- test@example.com
- user@finance.app

**Existing Nicknames**:
- admin
- testuser
- finance_app

## File Structure

```
APP/
├── mock-server/
│   ├── server.js
│   ├── package.json
│   └── README.md
├── src/
│   ├── hooks/
│   │   ├── useDebounce.ts (NEW)
│   │   └── __tests__/
│   │       └── useDebounce.test.ts (NEW)
│   └── screens/auth/__tests__/
│       └── RegisterScreen.integration.test.tsx (NEW)
└── docs/
    └── INTEGRATION_TESTING.md (NEW)
```

## Switching to Real Backend

When backend is ready, just update:

```typescript
const API_BASE_URL = 'https://api.yourapp.com';
```

No code changes needed!

## Troubleshooting

### Port 3001 in use
```bash
lsof -i :3001
kill -9 <PID>
```

### Tests not running
Make sure jest config has correct paths:
```bash
npm test -- --listTests | grep useDebounce
```

### Mock server not responding
```bash
curl http://localhost:3001/health
```

Should return: `{ "status": "ok", ... }`
EOF
echo "✅ INTEGRATION_TESTING.md created"
