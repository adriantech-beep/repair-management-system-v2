# Repair Management App

A full-stack application for managing repair jobs and technician workflows.

**Status:** Auth feature in active development (Tickets 1-9 complete)

## Tech Stack

- **Backend:** .NET 8 ASP.NET Core Web API (C#)
- **Frontend:** React 19 + TypeScript + Vite
- **Database:** PostgreSQL 16
- **Auth:** JWT (access token + refresh token rotation)
- **Password Security:** BCrypt.Net-Next

## Project Structure

```
repair-management-app/          # Root (React frontend)
├── src/
├── index.html
├── package.json
└── ...

repair-management-api/          # .NET 8 backend
├── Controllers/
├── Services/
├── Models/
├── DTOs/
├── appsettings.json
└── ...

Documentation/
├── README.md (this file)
├── DEVELOPMENT.md
├── AUTH_V1_TASKS.md
├── AUTH_API_CONTRACT_V1.md
├── DOTNET_OOP_CHEATSHEET.md
└── DOTNET_AUTH_REVIEWER.md
```

## Features (Current)

### Authentication (v1)

- JWT access token (15 min) + refresh token (7 days) with rotation
- Secure password hashing (BCrypt)
- Account lockout after 5 failed attempts (15 min)
- Admin-only user creation
- Refresh token revocation on logout
- Role-based access control (Admin, Technician)

### Endpoints

| Method | Path              | Auth  | Purpose                             |
| ------ | ----------------- | ----- | ----------------------------------- |
| POST   | /api/auth/login   | No    | Authenticate and get token pair     |
| POST   | /api/auth/refresh | No    | Exchange refresh token for new pair |
| GET    | /api/auth/me      | Yes   | Get current user profile            |
| POST   | /api/auth/logout  | Yes   | Revoke refresh token                |
| POST   | /api/auth/users   | Admin | Create new user account             |

See [AUTH_API_CONTRACT_V1.md](AUTH_API_CONTRACT_V1.md) for detailed endpoint contract.

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js 18+
- PostgreSQL 16+
- Git

### Local Development Setup

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup instructions.

Quick start:

```bash
# Backend
cd repair-management-api
dotnet run

# Frontend (in separate terminal)
cd repair-management-app
npm install
npm run dev
```

Backend runs on `http://localhost:5252`
Frontend runs on `http://localhost:5173`
Swagger API docs at `http://localhost:5252/swagger`

## Documentation

- **[DEVELOPMENT.md](DEVELOPMENT.md)** — Local setup, running, common issues
- **[AUTH_V1_TASKS.md](AUTH_V1_TASKS.md)** — Complete auth feature requirements and tickets
- **[AUTH_API_CONTRACT_V1.md](AUTH_API_CONTRACT_V1.md)** — Frontend-backend endpoint contract
- **[DOTNET_OOP_CHEATSHEET.md](DOTNET_OOP_CHEATSHEET.md)** — OOP concepts + interview prep
- **[DOTNET_AUTH_REVIEWER.md](DOTNET_AUTH_REVIEWER.md)** — Deep dive on auth architecture

## Development Workflow

1. **Pick a ticket** from [AUTH_V1_TASKS.md](AUTH_V1_TASKS.md)
2. **Cut a feature branch:** `git checkout -b feature/ticket-9-admin-create-user`
3. **Code + test** locally
4. **Update docs** if endpoint contract changes
5. **Commit:** `git commit -m "feat: implement ticket 9 - admin create user endpoint"`
6. **Push:** `git push origin feature/ticket-9-admin-create-user`
7. **Document** changes in commit message

## Commit Message Standard

For consistency and interview readiness:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`

**Examples:**

```
feat(auth): implement POST /api/auth/users endpoint for admin user creation
fix(auth): handle expired tokens in refresh endpoint
docs(auth): add API contract for logout endpoint
refactor(auth): extract password validation into separate method
test(auth): add unit tests for login lockout behavior
```

## Current Progress

✅ Ticket 1-9: Auth domain models, DB config, password/token services, login, refresh, logout, /me, admin create user  
⏳ Ticket 10-13: Validation layer, authorization policies, backend tests, Postman collection

See [AUTH_V1_TASKS.md](AUTH_V1_TASKS.md) for full breakdown.

## Next Steps

1. Complete remaining auth tickets (10-13)
2. Build repair job domain models and services
3. Implement frontend auth flows
4. Add job assignment and status tracking
5. Write integration tests

## Troubleshooting

**"Jwt:Key is not configured"**

- Ensure `appsettings.json` has valid Jwt config. See DEVELOPMENT.md.

**Database connection error**

- Check PostgreSQL is running on localhost:5432
- Verify connection string in appsettings.json

**Port 5252 already in use**

- Kill process or change port in launchSettings.json

See [DEVELOPMENT.md](DEVELOPMENT.md) for more.

## Learning Resources

This project uses SDLC best practices for educational purposes. Key concepts documented:

- **Dependency Injection:** See Program.cs service registration
- **Entity Framework Core:** AppDbContext and migrations
- **JWT Auth:** JwtTokenService and Program.cs middleware
- **Role-based Access:** [Authorize] attributes and claims
- **Error Handling:** Consistent error response format

## License

Private portfolio project.

## Contact

Built as a learning project with focus on SDLC, architecture, and production-ready patterns.
