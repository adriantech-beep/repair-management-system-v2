# Auth API Contract v1

Last updated: 2026-04-10
Status: Active (aligned to implemented endpoints)

## Purpose

This document is the frontend/backend integration contract for authentication and user management.
Use it together with Swagger for exact request/response payloads.

Base URL (dev): `http://localhost:5252`

## Security Model

- Access token: JWT, 15 minutes
- Refresh token: 7 days
- Refresh tokens are rotated on refresh
- Reused/expired/revoked refresh tokens are rejected
- Roles: `Admin`, `Technician`

## Required Configuration (Backend)

The API requires these settings in `appsettings.json`:

- `ConnectionStrings:DefaultConnection`
- `Jwt:Key`
- `Jwt:Issuer`
- `Jwt:Audience`
- `Jwt:ExpiryMinutes`

## Authorization Header

For protected endpoints:

`Authorization: Bearer <accessToken>`

## Validation Error Format

For request payload validation failures, API returns `400 Bad Request` with:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "One or more validation errors occurred.",
  "errors": {
    "FieldName": ["Validation message 1", "Validation message 2"]
  }
}
```

## Endpoint Contract

## 1) POST /api/auth/login

Purpose: Authenticate credentials and issue token pair.

Auth required: No

Request body:

```json
{
  "email": "admin@repairmanagement.local",
  "password": "AdminPassword123!"
}
```

Success:

- `200 OK`
- Returns `accessToken`, `refreshToken`, expiry fields, and safe `user` profile

Failure:

- `400 Bad Request` when required fields are missing
- `401 Unauthorized` with:

```json
{
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "Invalid email or password."
}
```

- `429 Too Many Requests` when login rate limit is exceeded:

```json
{
  "code": "AUTH_RATE_LIMITED",
  "message": "Too many login attempts. Please try again later."
}
```

## 2) POST /api/auth/refresh

Purpose: Exchange valid refresh token for a new token pair (rotation).

Auth required: No

Request body:

```json
{
  "refreshToken": "<raw_refresh_token>"
}
```

Success:

- `200 OK`
- Returns new `accessToken` and new `refreshToken`

Failure:

- `400 Bad Request` for missing refresh token
- `401 Unauthorized` for invalid/expired/revoked/reused token with:

```json
{
  "code": "AUTH_INVALID_REFRESH_TOKEN",
  "message": "Refresh token is invalid, expired, or already used."
}
```

## 3) POST /api/auth/logout

Purpose: Revoke submitted refresh token.

Auth required: Yes (valid access token)

Request body:

```json
{
  "refreshToken": "<raw_refresh_token>"
}
```

Success:

- `204 No Content`

Failure:

- `400 Bad Request` for missing refresh token
- `401 Unauthorized` if access token missing/invalid

## 4) GET /api/auth/me

Purpose: Return current authenticated user profile.

Auth required: Yes

Request body: none

Success:

- `200 OK`
- Returns safe profile:

```json
{
  "id": "<guid>",
  "fullName": "Admin User",
  "email": "admin@repairmanagement.local",
  "role": "Admin"
}
```

Failure:

- `401 Unauthorized` if access token missing/invalid
- `404 Not Found` if user no longer exists or inactive

## 5) POST /api/auth/users

Purpose: Admin creates a user account (Admin or Technician).

Auth required: Yes (`Admin` role)

Request body:

```json
{
  "fullName": "John Technician",
  "email": "john@repairmanagement.local",
  "password": "TechPassword123!",
  "role": "Technician"
}
```

Success:

- `201 Created`
- Returns created safe profile (`id`, `fullName`, `email`, `role`)

Failure:

- `400 Bad Request` for missing required fields
- `401 Unauthorized` if token missing/invalid
- `403 Forbidden` if authenticated user is not Admin
- `409 Conflict` when email already exists or role invalid

## Defaults Applied On Admin-Created User

- `IsActive = true`
- `MustChangePassword = true`
- `FailedLoginAttempts = 0`
- `LockoutEndUtc = null`
- `Email` normalized to lowercase + trimmed
- Password is stored hashed (never plain text)

## Frontend Integration Notes

- Persist `accessToken` and `refreshToken` after login
- Send access token on protected routes (`/me`, `/logout`, `/users`)
- On `401` due to expired access token, call `/refresh` once and retry original request
- If `/refresh` fails with `AUTH_INVALID_REFRESH_TOKEN`, force re-login
- Replace stored refresh token after every successful `/refresh`

## Manual Test Sequence (Regression)

1. Login as Admin -> expect `200`
2. Call `/me` with Bearer token -> expect `200`
3. Create Technician via `/users` -> expect `201`
4. Call `/refresh` with refresh token -> expect `200` and new token pair
5. Reuse previous refresh token -> expect `401 AUTH_INVALID_REFRESH_TOKEN`
6. Call `/logout` with latest refresh token + Bearer access token -> expect `204`
7. Try `/refresh` with logged-out token -> expect `401`

## Change Policy

When endpoint behavior changes, update this document in the same PR as code changes.
