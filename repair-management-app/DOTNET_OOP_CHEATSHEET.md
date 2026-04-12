# .NET OOP Cheat Sheet for Auth Flow

Quick reference for key concepts. Use alongside code in your project.

---

## 1. Controller

**What:** Receives HTTP requests, calls services, returns responses.

**One-liner:** HTTP endpoint wrapper.

**Your example:**

```csharp
[HttpPost("login")]
public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
{
    var result = await _authService.LoginAsync(request, ipAddress, deviceInfo);
    return Ok(result);  // Returns 200 + response body
}
```

**Key points:**

- Takes request from client
- Calls service (NOT database directly)
- Returns HTTP status code + response body
- `[Authorize]` attribute enforces JWT check

---

## 2. Interface

**What:** Contract that says "any class implementing this must have these methods."

**One-liner:** Defines what methods exist; implementation decides how.

**Your example:**

```csharp
public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request, string? ipAddress, string? deviceInfo);
    Task<AuthUserDto?> GetUserByIdAsync(Guid userId);
}
```

**Why use it:**

- Loose coupling: controller depends on interface, not concrete class
- Testability: you can swap fake services in tests
- Flexibility: multiple implementations of same interface

---

## 3. Service (Implementation of Interface)

**What:** Contains business logic. Calls database, processes data, enforces rules.

**One-liner:** Brain of the operation.

**Your example:**

```csharp
public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher _passwordHasher;

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request, ...)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null) return null;  // Rule: inactive user fails

        var passwordValid = _passwordHasher.Verify(request.Password, user.PasswordHash);
        if (!passwordValid) return null;  // Rule: bad password fails

        return new LoginResponseDto { ... };
    }
}
```

**Key points:**

- Implements interface methods
- Receives dependencies (db, hashers) through constructor
- Enforces business rules (lockout after 5 failures, password validation)
- Returns DTO, never exposes database models

---

## 4. DTO (Data Transfer Object)

**What:** Safe wrapper for data crossing the HTTP boundary.

**One-liner:** "What we send/receive over the network."

**Your examples:**

```csharp
// Request DTO
public class LoginRequestDto
{
    public string Email { get; set; }
    public string Password { get; set; }
}

// Response DTO
public class LoginResponseDto
{
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
    public AuthUserDto User { get; set; }
}
```

**Why separate from models:**

- Don't expose PasswordHash or internal fields
- Control API contract independent of database
- Client only sees safe fields

---

## 5. Model (Database Entity)

**What:** Represents a database table as a C# class.

**One-liner:** "Database row in object form."

**Your example:**

```csharp
public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }  // NEVER in response DTO
    public Role Role { get; set; }
    public int FailedLoginAttempts { get; set; }
    public DateTime? LockoutEndUtc { get; set; }
}
```

**Key points:**

- One model class = one database table
- Properties map to columns
- Contains ALL data (including secrets like PasswordHash)
- Service extracts safe fields into DTO before returning

---

## 6. Dependency Injection (DI)

**What:** Framework automatically creates and passes objects to classes that need them.

**One-liner:** "Instead of creating objects yourself, ask for them in constructor."

**Your example:**

At startup (Program.cs):

```csharp
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
```

In controller:

```csharp
public class AuthController
{
    private readonly IAuthService _authService;

    // DI: framework passes IAuthService here automatically
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }
}
```

**Why it matters:**

- Loose coupling (depends on interface, not concrete class)
- Testability (swap fake service in tests)
- Automatic lifetime management (Scoped = one per request)

---

## Request Flow: POST /api/auth/login

```
1. HTTP Request arrives
    ↓
2. AuthController.Login() receives LoginRequestDto
    ↓
3. Calls _authService.LoginAsync() (IAuthService)
    ↓
4. AuthService validates email, password, checks lockout
    ↓
5. If valid, calls JwtTokenService.CreateAccessToken()
    ↓
6. Calls RefreshTokenService to generate refresh token
    ↓
7. Saves hashed refresh token to database
    ↓
8. Returns LoginResponseDto with tokens
    ↓
9. AuthController returns 200 OK with response body
    ↓
10. Client receives tokens, stores them
```

---

## Request Flow: GET /api/auth/me with Bearer Token

```
1. HTTP Request with "Authorization: Bearer <token>"
    ↓
2. ASP.NET auth middleware runs (JwtBearer)
    - Validates signature using Jwt:Key
    - Checks issuer and audience
    - Checks expiry
    - If valid, extracts claims (sub, email, role)
    ↓
3. AuthController.Me() checks [Authorize] attribute
    - Passes (token is valid)
    ↓
4. Reads "sub" claim (user ID)
    ↓
5. Calls _authService.GetUserByIdAsync(userId)
    ↓
6. Service queries database, returns safe AuthUserDto
    ↓
7. AuthController returns 200 OK
    ↓
8. Client gets profile
```

---

## Key Principles

| Concept                           | Why It Matters                             |
| --------------------------------- | ------------------------------------------ |
| **Interface over implementation** | Easy to test, swap implementations         |
| **DTO != Model**                  | Control API contract, hide secrets         |
| **Service has business rules**    | Controller = HTTP wrapper, Service = logic |
| **DI constructs objects**         | Loose coupling, testability                |
| **Async/await**                   | Database calls don't block threads         |
| **Claims in JWT**                 | Know user identity without querying DB     |
| **Hash + salt passwords**         | BCrypt does this automatically             |
| **Revoke tokens**                 | Logout by marking refresh token as revoked |

---

## Quick Self-Test

Answer these (peek at code if stuck):

1. What does IAuthService interface do?
   _Answer: Defines methods that AuthService must implement._

2. Why is LoginResponseDto needed?
   _Answer: Safe response; never exposes PasswordHash or internal fields._

3. Where does DI wire up IAuthService → AuthService?
   _Answer: Program.cs, in `builder.Services.AddScoped<>` call._

4. What claims are in the JWT access token?
   _Answer: sub (user ID), email, role, jti (unique token ID)._

5. How does logout work?
   _Answer: Service hashes refresh token, finds it in DB, sets RevokedAtUtc._

6. Why async/await?
   _Answer: Database and network calls are slow; async frees up thread for other requests._

---

## Common Interview Questions Based on Your Code

**Q: How do you prevent unauthorized access to /api/auth/users?**
A: `[Authorize(Roles = "Admin")]` on the controller action. JwtBearer middleware validates token, extracts role claim, enforces it.

**Q: What happens if someone reuses a refresh token?**
A: Service checks RevokedAtUtc in database. If token was already used for rotation, it's marked revoked, so reuse returns 401.

**Q: Why hash refresh tokens in the database?**
A: If database is breached, attacker has hashes, not raw tokens. Hashes cannot be reversed to original tokens.

**Q: How does the frontend know when access token expired?**
A: Backend returns 401 on expired token. Frontend calls /refresh with stored refresh token to get new access token.

**Q: What is Scoped lifetime in DI?**
A: One instance of AuthService per HTTP request. Next request gets a fresh instance. Good for database contexts.
