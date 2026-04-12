# .NET Auth Reviewer

This reviewer summarizes the concepts we used while building the first authentication phase of the repair management app.

## 1. Big Picture

Our backend request flow is:

```text
HTTP Request
-> Controller
-> Service
-> DbContext
-> PostgreSQL
-> Response
```

Example:

```text
POST /api/auth/login
-> AuthController
-> AuthService
-> AppDbContext
-> Users / RefreshTokens tables
-> JSON response
```

## 2. Main Layers

### Controller Layer

Responsibility:

- receives HTTP requests
- validates basic request presence
- calls the correct service
- returns HTTP responses

Example in this project:

- AuthController

Controller should not contain:

- password hashing logic
- token generation logic
- database query logic

### Service Layer

Responsibility:

- contains business logic
- coordinates multiple dependencies
- implements use cases like login

Example in this project:

- AuthService
- PasswordHasher
- JwtTokenService
- RefreshTokenService

### Data Layer

Responsibility:

- maps C# models to database tables
- manages queries and saves
- enforces constraints and relationships

Example in this project:

- AppDbContext

## 3. Important .NET Concepts

### Dependency Injection (DI)

Definition:

- .NET provides objects automatically when a class asks for them in its constructor.

Example:

```csharp
public AuthController(IAuthService authService)
{
    _authService = authService;
}
```

Meaning:

- the controller does not create AuthService manually
- .NET injects it because it was registered in Program.cs

Why it matters:

- cleaner architecture
- easier testing
- easier maintenance

### Interfaces

Definition:

- contracts that define what a class must implement

Examples:

- IAuthService
- IPasswordHasher
- IJwtTokenService
- IRefreshTokenService

Why they matter:

- allow swapping implementations
- improve testability
- reduce tight coupling

### Async/Await

Definition:

- allows non-blocking database and I/O operations

Example:

```csharp
var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
```

Why it matters:

- API stays responsive
- supports multiple concurrent requests efficiently

## 4. Models We Designed

### Role

Use enum in C#:

- Admin
- Technician

Why:

- safer than free text
- avoids typos
- easier authorization checks

### User

Fields:

- Id
- FullName
- Email
- PasswordHash
- Role
- FailedLoginAttempts
- LockoutEndUtc
- IsActive
- MustChangePassword
- CreatedAtUtc
- UpdatedAtUtc

Purpose:

- store staff account information
- support login security and account management

### RefreshToken

Fields:

- Id
- UserId
- TokenHash
- ExpiresAtUtc
- CreatedAtUtc
- RevokedAtUtc
- ReplacedByTokenId
- IpAddress
- DeviceInfo

Purpose:

- support long-lived sessions securely
- track rotation and revocation

### Relationship

```text
One User -> Many RefreshTokens
```

Meaning:

- one user can have multiple sessions/devices

## 5. Why We Use DTOs

DTO = Data Transfer Object

Examples:

- LoginRequestDto
- LoginResponseDto
- AuthUserDto

Why DTOs matter:

- define API contract clearly
- avoid exposing database models directly
- prevent leaking sensitive fields
- separate transport data from domain models

## 6. AppDbContext Review

AppDbContext is the EF Core bridge between C# and PostgreSQL.

Responsibilities:

- expose DbSets
- configure indexes
- configure required fields
- configure relationships
- configure enum storage

Examples in this project:

- DbSet<User>
- DbSet<RefreshToken>
- unique index on Email
- unique index on TokenHash
- User to RefreshToken one-to-many mapping
- Role enum stored as string

## 7. Migration Review

What migration does:

- turns model configuration into real database tables

Commands used:

```powershell
dotnet ef migrations add InitialAuthSchema
dotnet ef database update
```

What was created:

- Users table
- RefreshTokens table
- \_\_EFMigrationsHistory table

## 8. Password Hashing Review

We do not store plain passwords.

Flow:

1. user provides raw password
2. PasswordHasher hashes it using BCrypt
3. only hash is stored in database
4. login checks raw password against stored hash

Why BCrypt:

- industry standard
- intentionally slow to resist brute force attacks

## 9. JWT Review

JWT = JSON Web Token

Purpose:

- short-lived access token used for authenticated API requests

Claims we used:

- sub = user id
- email = user email
- role = user role
- jti = token id

Access token lifetime:

- 15 minutes

Why short-lived:

- reduces damage if token is stolen

## 10. Refresh Token Review

Purpose:

- allow client to get a new access token without logging in again

Best practice used:

- generate raw token
- hash it before storing in DB
- store only TokenHash

Why:

- if database leaks, raw refresh tokens are not directly exposed

## 11. Login Flow Review

Current logic:

1. receive LoginRequestDto
2. normalize email with trim + lowercase
3. find user in database
4. reject if inactive or not found
5. reject if locked out
6. verify password hash
7. increment failed attempts on failure
8. lock account after 5 failed attempts for 15 minutes
9. on success:

- reset lockout counters
- generate access token
- generate refresh token
- save refresh token hash
- return LoginResponseDto

## 12. Program.cs Review

Program.cs is the startup composition root.

Responsibilities:

- register services with DI
- configure DbContext
- configure Swagger
- configure middleware pipeline
- map controllers

Important registrations:

- AppDbContext
- IPasswordHasher -> PasswordHasher
- IJwtTokenService -> JwtTokenService
- IRefreshTokenService -> RefreshTokenService
- IAuthService -> AuthService

Important line:

```csharp
app.MapControllers();
```

Without it:

- controller endpoints do not become active

## 13. Swagger Review

Purpose:

- test and inspect endpoints quickly

In development:

- run API with dotnet run
- open /swagger
- test endpoints interactively

Why useful:

- quick manual testing
- confirms routing and contracts
- easy before Postman collection is built

## 14. Validation Responsibilities

Best practice:

### Frontend

Use for:

- user experience
- immediate feedback
- formatting and normalization

Examples:

- required fields
- email format
- password rule hints
- trim and lowercase before submit

### Backend

Use for:

- real enforcement
- security
- business rule validation

Examples:

- active account check
- lockout policy
- role enforcement
- duplicate email check

### Database

Use for:

- final integrity protection

Examples:

- unique index on Email
- unique index on TokenHash
- foreign keys
- required columns

Rule to remember:

```text
Frontend = convenience
Backend = authority
Database = safety net
```

## 15. Concepts To Memorize

Memorize these first:

1. Controller handles HTTP, not business logic
2. Service handles use-case logic
3. DbContext handles persistence
4. DTOs define request/response contracts
5. DI connects classes together automatically
6. Interfaces improve flexibility and testability
7. EF Core maps C# objects to database tables
8. JWT is short-lived auth token
9. Refresh token supports session renewal
10. Hash passwords and refresh tokens before storage

## 16. Current Build Order

The flow we followed:

1. Plan requirements
2. Design models
3. Configure DbContext
4. Create migration
5. Build security services
6. Build login service
7. Add controller endpoint
8. Test with Swagger

## 17. What Comes Next

Upcoming steps after this phase:

1. seed first Admin user
2. test successful login
3. add refresh endpoint
4. add logout endpoint
5. add current-user endpoint
6. add admin-create-technician endpoint
7. add validation layer
8. add tests
9. build Postman collection

## 18. Simple Mental Model

When confused, remember this:

```text
Controller = doorway
Service = brain
DbContext = database bridge
PostgreSQL = storage
DTO = package shape
DI = invisible wiring
```
