# Project Recovery Status

Recovered on: 2026-04-12
Scope: Reconstructed from local VS Code Copilot chat session files and current docs in this workspace.

## Source Files Used

- CHAT_HISTORY_RECOVERY.md
- AUTH_V1_TASKS.md
- AUTH_API_CONTRACT_V1.md
- DOTNET_AUTH_REVIEWER.md
- DOTNET_OOP_CHEATSHEET.md

## What We Recovered

- Your project direction switched from general stack planning to a .NET auth-focused backend learning workflow.
- You explicitly requested a guided, slow, best-practice approach (learn-first, not speed-first).
- Backend auth endpoints were implemented and tested in prior sessions:
  - POST /api/auth/login
  - POST /api/auth/refresh
  - POST /api/auth/logout
  - GET /api/auth/me
  - POST /api/auth/users (Admin only)
- You validated behavior in Swagger and confirmed at least these outcomes in chat:
  - /me returns valid profile when authorized
  - refresh token rotation works
  - reused refresh token is rejected with AUTH_INVALID_REFRESH_TOKEN

## Inferred Ticket Progress (from recovered prompts)

Note: This status is inferred from transcript evidence and should be treated as "likely" until verified in the backend repository.

- Ticket 1: Completed (models and constraints discussed and applied)
- Ticket 2: Completed (DbContext mapping and relationship setup discussed)
- Ticket 3: Completed (InitialAuthSchema migration created and applied)
- Ticket 4: Completed (password hashing + token services used in flow)
- Ticket 5: Completed (login use case tested)
- Ticket 6: Completed (refresh rotation and reuse rejection tested)
- Ticket 7: Completed (logout implemented in API contract)
- Ticket 8: Completed (/me endpoint tested)
- Ticket 9: Completed (you said "all of it works" before moving forward)
- Ticket 10: Pending or Partially Done (needs explicit validation framework confirmation)
- Ticket 11: Pending or Partially Done (authorization/security policy hardening needs final checklist)
- Ticket 12: Pending (automated backend tests not yet confirmed in recovered prompts)
- Ticket 13: Pending (Postman collection not yet confirmed complete)

## Confirmed Auth Decisions

- Roles: Admin, Technician
- User creation: Admin-only
- Self-registration: No
- Access token: 15 minutes
- Refresh token: 7 days
- Lockout: 5 failed attempts -> 15 minutes
- Email verification: Not in v1
- Password policy: min 10, upper/lower/number/special

## Current Frontend Reality (this workspace)

- The app is still mostly Vite starter UI.
- Frontend auth integration has not been wired to backend contract yet.
- Existing contract says frontend must:
  - store access + refresh token
  - attach bearer token to protected requests
  - refresh once on 401 expired access token
  - replace refresh token on successful refresh

## Immediate Resume Plan

1. Verify backend state in repair-management-api repo against Tickets 10-13.
2. Finish remaining backend items in order:
   - Ticket 10 validation consistency
   - Ticket 11 authz/security hardening
   - Ticket 12 tests
   - Ticket 13 Postman collection
3. Integrate frontend in this repo to consume auth contract endpoints.

## Suggested Next Session Kickoff Prompt

Use this exact message to resume with minimal context loss:

"Resume Repair Management auth work from PROJECT_RECOVERY_STATUS.md. We already finished Tickets 1-9 in the backend (verify quickly). Continue with Ticket 10 only, guide me step-by-step in learning mode, ask before making changes, and keep explanations simple."
