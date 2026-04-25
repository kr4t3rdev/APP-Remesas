# Authentication API Endpoints

> **Status**: Required implementation - These endpoints must be implemented on the backend to support the new validation flow in RegisterScreen.

## POST /auth/register

Register a new user with email and password validation.

### Request

```json
{
  "email": "user@example.com",
  "password": "ValidPass123",
  "name": "Juan Pérez",
  "nickname": "juanperez"
}
```

**Field Validation:**
- `email`: Required, valid email format, max 254 characters
- `password`: Required, min 8 characters, must contain uppercase, lowercase, and number
- `name`: Required, min 2 characters
- `nickname`: Optional, alphanumeric with hyphens/underscores, min 2 chars if provided

### Response (201 Created)

Success response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Juan Pérez",
    "role": "USER",
    "primaryCurrencyId": null,
    "avatarUrl": null
  }
}
```

### Response (400 Bad Request)

Validation error response:

```json
{
  "message": "Validation failed",
  "errors": {
    "email": "Email already exists",
    "nickname": "Nickname already taken",
    "password": "Password too weak"
  }
}
```

### Backend Validations Required

✅ **Email Uniqueness**: Check if email already exists (case-insensitive)  
✅ **Email Format**: Validate RFC 5322 simplified format  
✅ **Nickname Uniqueness**: Check if nickname already exists (if provided, case-insensitive)  
✅ **Nickname Format**: Only alphanumeric, hyphens, underscores  
✅ **Password Strength**: 8+ chars, uppercase, lowercase, number  
✅ **Name Length**: Minimum 2 characters  
✅ **SQL Injection Prevention**: Sanitize all inputs  
✅ **XSS Prevention**: Encode output properly  

---

## GET /auth/check-email

Check if email already exists in the system (non-authenticated).

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | Email address to check |

### Example Request

```
GET /auth/check-email?email=user@example.com
```

### Response (200 OK)

Email doesn't exist:

```json
{
  "exists": false
}
```

Email already exists:

```json
{
  "exists": true
}
```

### Response (400 Bad Request)

```json
{
  "message": "Email parameter is required"
}
```

### Backend Implementation Notes

- **Performance**: Consider adding database index on `email` column
- **Rate Limiting**: Recommended to rate-limit this endpoint (e.g., 10 requests per minute per IP)
- **Case Sensitivity**: Queries should be case-insensitive
- **Caching**: Can be cached (e.g., Redis) for 5 minutes to reduce database load

---

## GET /auth/check-nickname

Check if nickname already exists in the system (non-authenticated).

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nickname` | string | Yes | Nickname to check |

### Example Request

```
GET /auth/check-nickname?nickname=juanperez
```

### Response (200 OK)

Nickname doesn't exist:

```json
{
  "exists": false
}
```

Nickname already exists:

```json
{
  "exists": true
}
```

### Response (400 Bad Request)

```json
{
  "message": "Nickname parameter is required"
}
```

### Backend Implementation Notes

- **Performance**: Consider adding database index on `nickname` column
- **Rate Limiting**: Recommended to rate-limit this endpoint (e.g., 10 requests per minute per IP)
- **Case Sensitivity**: Queries should be case-insensitive
- **Caching**: Can be cached (e.g., Redis) for 5 minutes to reduce database load
- **Format Validation**: Only accept alphanumeric, hyphens, underscores

---

## Error Handling

### Standard Error Response Format

```json
{
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2024-04-25T00:51:00.000Z"
}
```

### Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 201 | Created | Registration successful |
| 400 | Bad Request | Invalid email format, validation errors |
| 409 | Conflict | Email/nickname already exists |
| 422 | Unprocessable Entity | Field validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |

---

## Frontend Integration

### Email Check Flow

```
User types email
    ↓
validateEmail() (client-side regex check)
    ↓
If valid format:
  - Call checkEmailExists() via API
  - Show hourglass icon while checking
  - If exists: show error "Este correo ya está registrado"
  - If not exists: clear email error
    ↓
User can proceed to registration
```

### Nickname Check Flow

```
User types nickname
    ↓
validateNickname() (client-side format check)
    ↓
If valid format:
  - Call checkNicknameExists() via API
  - Show hourglass icon while checking
  - If exists: show error "Este nickname ya está en uso"
  - If not exists: clear nickname error
    ↓
User can proceed to registration
```

### Registration Flow

```
User submits form
    ↓
validateForm() (all client-side validations)
    ↓
If all pass:
  - Disable form and show loading state
  - POST /auth/register
  - If success: Navigate to VerificationPending
  - If error: Show Alert with server error message
    ↓
Enable form again
```

---

## Implementation Checklist

- [ ] Implement POST /auth/register endpoint
- [ ] Implement GET /auth/check-email endpoint
- [ ] Implement GET /auth/check-nickname endpoint
- [ ] Add email uniqueness validation (case-insensitive)
- [ ] Add nickname uniqueness validation (case-insensitive)
- [ ] Add database indexes on email and nickname columns
- [ ] Implement rate limiting for check endpoints
- [ ] Add input sanitization and validation
- [ ] Add error handling and logging
- [ ] Test with frontend (RegisterScreen)
- [ ] Document in backend API docs
- [ ] Set up monitoring/alerting

---

## Related Files

**Frontend:**
- `src/screens/auth/RegisterScreen.tsx` - Main registration screen
- `src/utils/validators.ts` - Client-side validators
- `src/services/authValidationApi.ts` - API service layer
- `src/hooks/useRegisterAnimations.ts` - Animation hook

**Backend:**
- Implement authentication routes
- Add User model/schema
- Set up database migrations
