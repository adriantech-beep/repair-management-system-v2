# Repair Management SaaS - Development Checklist & Learning Roadmap

This document serves as your guide and checklist for future feature development, system architecture design, and DevOps implementation. Use it to align plans before writing code.

---

## 1. Feature Pre-Implementation Checklist
Before starting work on *any* new feature, walk through these four stages to prevent design conflicts and technical debt.

### [ ] Phase 1: Requirements & Scope Definition
- [ ] What is the exact problem this feature solves for the user?
- [ ] What roles can access this feature (Admin only, Technician, or both)?
- [ ] What are the success criteria? (e.g. "Admin can successfully register a user and list them in a table.")

### [ ] Phase 2: Database & Model Design
- [ ] Do we need new tables or new fields in existing tables?
- [ ] How does it relate to the `TenantId`? (Does it need the multi-tenant query filter in `AppDataContext.cs`?)
- [ ] What constraints/foreign keys are required to preserve data integrity?
- [ ] **Action**: Create the Entity Framework Migration (`dotnet ef migrations add <Name>` and `dotnet ef database update`).

### [ ] Phase 3: API Design (Backend authority)
- [ ] Define the Request DTO and Response DTO.
- [ ] Create the Controller endpoints and restrict them with appropriate authentication (`[Authorize]`, `[Authorize(Roles = "Admin")]`).
- [ ] Write logic in the Service layer (never put business logic directly in the Controller).
- [ ] **Action**: Test the API endpoint using the interactive Swagger UI (`/swagger`).

### [ ] Phase 4: Frontend Implementation (Convenience & UX)
- [ ] Add the API function in the corresponding helper (e.g., `src/api/authApi.ts`).
- [ ] Create React Query hooks (Queries for fetching, Mutations for writing/editing) and configure cache invalidation.
- [ ] Build UI components with strong TypeScript types and responsive styles.
- [ ] Implement schema validation using `zod` and `react-hook-form` to capture client-side errors early.

### [ ] Phase 5: Verification & Testing
- [ ] Run compiler check: `npx tsc -b`
- [ ] Run test suite: `npm run test`
- [ ] Test edge cases: What happens if network is offline? What if duplicate fields are submitted?

---

## 2. DevOps & Infrastructure Learning Roadmap
Use this step-by-step roadmap to layer in advanced DevOps and System Architecture skills directly onto this project.

### [ ] Step 1: Local Containerization (Docker)
- **Goal**: Run the whole stack using a single command.
- [ ] Create a `Dockerfile` for the .NET API.
- [ ] Create a `Dockerfile` for the React App.
- [ ] Create a `docker-compose.yml` that wires up:
  - `database` (PostgreSQL image)
  - `api` (from backend Dockerfile, environment variables linked to db)
  - `app` (from frontend Dockerfile)
- [ ] Verify that running `docker compose up` starts the entire system locally.

### [ ] Step 2: Continuous Integration (CI)
- **Goal**: Automate testing and verification.
- [ ] Create a GitHub repository and push this project.
- [ ] Create a GitHub Actions workflow: `.github/workflows/ci.yml`.
- [ ] Configure it to trigger on pushes or pull requests to `main`.
- [ ] Set up steps to:
  - Checkout code.
  - Set up Node.js & run `npm ci` and `npm run test`.
  - Set up .NET SDK & run `dotnet build` and `dotnet test`.

### [ ] Step 3: Cloud Deployment (CD)
- **Goal**: Make the app accessible globally.
- [ ] Select a hosting provider (Railway, Render, or Fly.io are best for starters).
- [ ] Provision a managed PostgreSQL instance in the cloud.
- [ ] Deploy the backend container API, injecting the cloud database connection string securely as an environment variable (never hardcode it).
- [ ] Deploy the frontend app and configure it to point to the live cloud API.

### [ ] Step 4: System Architecture Upgrades
- **Goal**: Learn advanced engineering patterns.
- [ ] **Background Jobs**: Add a background job runner (like Hangfire in .NET) to process notifications (e.g. email reminders) out-of-band.
- [ ] **Caching**: Introduce a Redis cache layer to speed up high-frequency DB queries (like dashboard statistics).
- [ ] **Logging & Observability**: Implement structured logging (e.g., Serilog in .NET) and send logs to a central dashboard (like Seq or Grafana) to monitor application health.
