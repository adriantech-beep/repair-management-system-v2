# Auth v1 Task List

This file is the approved implementation plan for the authentication feature.
Use it as the source of truth before coding.

## Current Decisions

- Roles: Admin, Technician
- User creation: Admin only
- Self-registration: No
- Auth strategy: JWT access token + refresh token
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Lockout policy: 5 failed attempts, 15 minutes
- Email verification: Not included in v1
- Password policy: Minimum 10 characters, uppercase, lowercase, number, special character
- Frontend validation: Yes, for UX
- Backend validation: Yes, mandatory
- Database constraints: Yes, mandatory

## Approved Auth Models

### User

- Id: Guid
- FullName: string
- Email: string
- PasswordHash: string
- Role: Admin | Technician
- FailedLoginAttempts: int
- LockoutEndUtc: DateTime?
- IsActive: bool
- MustChangePassword: bool
- CreatedAtUtc: DateTime
- UpdatedAtUtc: DateTime

Constraints:

- Primary key: Id
- FullName required, 2-100 chars
- Email required, unique, lowercase-normalized
- PasswordHash required
- Role required, only Admin or Technician
- FailedLoginAttempts >= 0
- IsActive default true
- MustChangePassword default true for admin-created users
- CreatedAtUtc required
- UpdatedAtUtc required

### RefreshToken

- Id: Guid
- UserId: Guid
- TokenHash: string
- ExpiresAtUtc: DateTime
- CreatedAtUtc: DateTime
- RevokedAtUtc: DateTime?
- ReplacedByTokenId: Guid?
- IpAddress: string?
- DeviceInfo: string?

Constraints:

- Primary key: Id
- UserId required, foreign key to User.Id
- TokenHash required and unique
- ExpiresAtUtc required
- CreatedAtUtc required
- RevokedAtUtc nullable
- ReplacedByTokenId nullable
- Revoked or expired tokens are invalid

Relationship:

- One User has many RefreshTokens
- One RefreshToken belongs to one User

## Implementation Tickets

### Ticket 1: Define Auth Domain Models

Goal:

- Create User, RefreshToken, and Role

Acceptance criteria:

- Models match approved spec
- User -> RefreshTokens is one-to-many
- Email uniqueness is enforced
- Role is constrained to Admin or Technician

### Ticket 2: Configure DbContext and Entity Mapping

Goal:

- Persist auth models correctly in PostgreSQL

Acceptance criteria:

- DbContext builds successfully
- Relationships and indexes are configured
- Role storage strategy is defined
- Foreign key mapping works

### Ticket 3: Create Initial Migration

Goal:

- Materialize the auth schema in the database

Acceptance criteria:

- Tables are created successfully
- Unique email constraint exists
- Unique token hash constraint exists
- Nullable fields are correct

### Ticket 4: Build Password Hashing and Token Services

Goal:

- Create reusable security services

Acceptance criteria:

- Passwords are hashed only
- Access tokens contain required claims
- Refresh tokens are securely generated
- Stored refresh tokens are hashed

### Ticket 5: Implement Login Use Case

Goal:

- Authenticate a user securely

Acceptance criteria:

- Valid login returns 200 with token pair
- Invalid credentials return generic 401
- Failed attempts increment correctly
- Lockout triggers after 5 failures
- Successful login resets failure counter

### Ticket 6: Implement Refresh Token Use Case

Goal:

- Renew sessions securely

Acceptance criteria:

- Valid refresh returns new token pair
- Expired token is rejected
- Revoked token is rejected
- Old token cannot be reused after rotation

### Ticket 7: Implement Logout Use Case

Goal:

- Revoke session refresh token

Acceptance criteria:

- Valid logout returns 204
- Logged-out refresh token cannot be used again
- Invalid auth returns 401

### Ticket 8: Implement Current User Endpoint

Goal:

- Return authenticated user profile

Acceptance criteria:

- Authenticated user gets 200
- Response contains safe profile fields only
- Unauthenticated request returns 401

### Ticket 9: Implement Admin Create Technician Use Case

Goal:

- Allow Admin to create staff accounts

Acceptance criteria:

- Admin can create Technician
- Technician cannot create users
- Duplicate email returns 409
- New user defaults are correct
- MustChangePassword is true on creation

### Ticket 10: Add Validation Layer

Goal:

- Centralize request validation

Acceptance criteria:

- Invalid payloads return 400
- Validation errors are consistent
- Frontend contract is clear

### Ticket 11: Add Authorization and Security Policies

Goal:

- Enforce access boundaries cleanly

Acceptance criteria:

- Protected endpoints require token
- Admin-only endpoints reject Technician with 403
- Login route is rate limited
- Auth responses do not leak sensitive details

### Ticket 12: Add Backend Tests

Goal:

- Verify auth behavior safely

Acceptance criteria:

- Happy path tests pass
- Failure path tests pass
- Lockout is tested
- Token rotation is tested

### Ticket 13: Build Postman Auth Collection

Goal:

- Manual and regression API verification

Acceptance criteria:

- Requests work with environment variables
- Access token is reusable across requests
- Negative auth scenarios are covered

## Recommended Build Order

1. Ticket 1: Define Auth Domain Models
2. Ticket 2: Configure DbContext and Entity Mapping
3. Ticket 3: Create Initial Migration
4. Ticket 4: Build Password Hashing and Token Services
5. Ticket 5: Implement Login Use Case
6. Ticket 6: Implement Refresh Token Use Case
7. Ticket 7: Implement Logout Use Case
8. Ticket 8: Implement Current User Endpoint
9. Ticket 9: Implement Admin Create Technician Use Case
10. Ticket 10: Add Validation Layer
11. Ticket 11: Add Authorization and Security Policies
12. Ticket 12: Add Backend Tests
13. Ticket 13: Build Postman Auth Collection

## Next Task

Start with Ticket 1 only.
Do not move to Ticket 2 until the models are reviewed and approved.
