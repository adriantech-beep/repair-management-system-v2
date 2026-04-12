# Development Setup Guide

Complete instructions for running this project locally.

## Prerequisites

Install if not already installed:

- **[.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)** (includes C# compiler and runtime)
- **[Node.js 18+](https://nodejs.org/)** (includes npm)
- **[PostgreSQL 16](https://www.postgresql.org/download/)** (database)
- **[Git](https://git-scm.com/download)** (version control)
- **VS Code** or **Visual Studio** (optional IDE)

## Verify Installation

Open PowerShell and run:

```powershell
# Check .NET
dotnet --version

# Check Node
node --version
npm --version

# Check PostgreSQL
psql --version

# Check Git
git --version
```

All should return version numbers. If any fail, reinstall.

## Database Setup

### Create PostgreSQL Database

1. Open PowerShell or cmd
2. Connect to PostgreSQL default account:

```powershell
psql -U postgres
```

3. Create the repair_management database:

```sql
CREATE DATABASE repair_management;
\q
```

This assumes your PostgreSQL server runs on localhost:5432 with default user `postgres`.

### Update Connection String (if different)

Edit `repair-management-api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=repair_management;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

## Backend Setup

### Navigate to Backend Directory

```powershell
cd repair-management-api
```

### Verify Jwt Configuration

Open `appsettings.json` and ensure these keys exist:

```json
{
  "Jwt": {
    "Key": "your-super-secret-jwt-key-at-least-256-bits-long-for-hs256-algorithm",
    "Issuer": "repair-management-api",
    "Audience": "repair-management-app",
    "ExpiryMinutes": 15
  }
}
```

For production, use a real 256-bit secret key. For dev, this placeholder works.

### Run Migrations

This creates the database schema:

```powershell
dotnet ef database update
```

You should see output about applying migrations. The `Users` and `RefreshTokens` tables are now in PostgreSQL.

### Build the Project

```powershell
dotnet build
```

Should complete with "Build succeeded."

### Run the API

```powershell
dotnet run
```

You should see:

```
Now listening on: http://localhost:5252
Application started. Press Ctrl+C to shut down.
```

The seeder will also show:

```
✓ Admin user seeded: admin@repairmanagement.local / AdminPassword123!
```

### Verify in Swagger

Open browser: `http://localhost:5252/swagger`

You should see all auth endpoints listed. Try the `/api/auth/login` endpoint:

1. Click **Try it out**
2. Enter request body:

```json
{
  "email": "admin@repairmanagement.local",
  "password": "AdminPassword123!"
}
```

3. Click **Execute**
4. You should get a `200` response with access and refresh tokens

### Stop Backend

Press `Ctrl+C` in PowerShell.

## Frontend Setup

### Navigate to Frontend Directory

```powershell
cd ../repair-management-app
```

### Install Dependencies

```powershell
npm install
```

This downloads ~500MB of packages (first time only). Takes 1-2 minutes.

### Run Development Server

```powershell
npm run dev
```

You should see:

```
  VITE v5.x.x  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Stop Frontend

Press `Ctrl+C`.

## Running Both Simultaneously

You need **two terminals**:

**Terminal 1** (Backend):

```powershell
cd D:\Project-For-Portfolio\repair-management-api
dotnet run
```

**Terminal 2** (Frontend):

```powershell
cd D:\Project-For-Portfolio\repair-management-app
npm run dev
```

Now:

- Backend API: `http://localhost:5252`
- Frontend app: `http://localhost:5173`
- Swagger docs: `http://localhost:5252/swagger`

## Common Issues

### "Jwt:Key is not configured"

**Cause:** Missing `appsettings.json` Jwt section.

**Fix:** Ensure `Jwt` block exists in `appsettings.json` with Key, Issuer, Audience.

### "The database file is locked" or connection timeout

**Cause:** PostgreSQL not running.

**Fix:** Start PostgreSQL service (Windows Services or `pg_ctl` command).

### "Port 5252 is already in use"

**Cause:** Another process on that port.

**Fix:** Kill the process or change port in `Properties/launchSettings.json`.

On Windows:

```powershell
# Find process on port 5252
netstat -ano | findstr :5252

# Kill by PID (replace 12345)
taskkill /PID 12345 /F
```

### "npm: command not found"

**Cause:** Node.js not installed or not in PATH.

**Fix:** Reinstall Node.js from nodejs.org and restart terminal.

### "Cannot find module" errors after npm install

**Cause:** Corrupted node_modules.

**Fix:**

```powershell
rm -r node_modules
npm install
```

### API returns 401 on protected endpoints

**Cause:** Token expired (15 min) or missing Bearer prefix.

**Fix:** Call `/api/auth/login` first, then use returned access token with `Authorization: Bearer <token>` header.

## File Structure Reference

```
repair-management-api/
├── Controllers/
│   └── AuthController.cs          # HTTP endpoints
├── Services/
│   ├── AuthService.cs             # Business logic
│   ├── JwtTokenService.cs         # Token generation
│   ├── PasswordHasher.cs          # Password hashing
│   └── RefreshTokenService.cs     # Refresh token lifecycle
├── Models/
│   ├── User.cs                    # Database entity
│   └── RefreshToken.cs
├── Enums/
│   └── Role.cs                    # Admin, Technician
├── DTOs/
│   └── AuthDtos.cs                # Request/response payloads
├── Data/
│   ├── AppDbContext.cs            # EF Core context
│   ├── DbSeeder.cs                # Seed initial data
│   └── Migrations/                # Database schema history
├── Program.cs                     # Startup + DI config
├── appsettings.json              # Configuration
└── repair-management-api.csproj   # Project file

repair-management-app/
├── src/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json                   # Dependencies
├── vite.config.ts                # Build config
└── ...
```

## Next Steps

1. **Explore the code:** Start with `repair-management-api/Program.cs` to see the full wiring.
2. **Study the auth flow:** See [DOTNET_OOP_CHEATSHEET.md](DOTNET_OOP_CHEATSHEET.md).
3. **Test endpoints:** Use Swagger UI at localhost:5252/swagger.
4. **Pick a ticket:** See [AUTH_V1_TASKS.md](AUTH_V1_TASKS.md) for remaining work.

## Resetting the Database

If you mess things up and want a fresh start:

```powershell
# Drop and recreate database
psql -U postgres -c "DROP DATABASE repair_management;"
psql -U postgres -c "CREATE DATABASE repair_management;"

# Re-apply migrations
cd repair-management-api
dotnet ef database update
```

The seeder will recreate the Admin user automatically on next `dotnet run`.

## Environment-Specific Configuration

For production setup, you would use:

- `appsettings.Production.json`
- Environment variables for secrets
- Real JWT key (256+ bits)
- Different database credentials

See [.NET Configuration Docs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration) for details.

## Git Setup (Next)

Once local dev is working, see the main README for git initialization and pushing to GitHub.
