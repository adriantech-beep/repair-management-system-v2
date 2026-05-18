# Repair Management Frontend Contract-Locked Task List

Last updated: 2026-05-18
Status: Active planning tracker

This file is the execution plan after F8 and F9 were merged.
It is intentionally limited to currently implemented backend contracts.
No speculative enhancements are included.

## Planning Rules

- Build only what is supported by existing API endpoints.
- If a required endpoint is missing, mark ticket as BLOCKED and stop implementation for that feature.
- Prefer end-to-end business flow completion over visual polish.
- Defer design-system-wide polish until core contract-backed workflows are complete.

## Backend Contract Surface (Current)

### Auth and User Session

- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/users

### Customers

- POST /api/customers
- GET /api/customers
- GET /api/customers/{customerId}
- PUT /api/customers/{customerId}

### Devices

- POST /api/devices
- GET /api/devices/customer/{customerId}
- GET /api/devices/lookup?identifier=
- GET /api/devices/{deviceId}
- PUT /api/devices/{deviceId}
- DELETE /api/devices/{deviceId}

### Repair Jobs

- POST /api/repair-jobs
- GET /api/repair-jobs
- GET /api/repair-jobs/{repairJobId}
- PUT /api/repair-jobs/{repairJobId}
- PATCH /api/repair-jobs/{repairJobId}/status

### Inventory and Waitlist

- POST /api/parts
- GET /api/parts
- GET /api/parts/{partId}
- PUT /api/parts/{partId}
- PATCH /api/parts/{partId}/stock
- POST /api/parts/{partId}/compatibilities
- DELETE /api/parts/{partId}/compatibilities/{compatibilityId}
- POST /api/parts/{partId}/waitlist
- GET /api/parts/{partId}/waitlist
- PATCH /api/waitlist/{waitlistRequestId}/status

## Status Legend

- TODO: not started
- IN_PROGRESS: actively implementing
- BLOCKED: waiting on missing backend contract or dependency
- DONE: merged to main

## Baseline Already Merged

- F8 Service Order Wizard (merged)
- F9 Inventory/Waitlist Integration slice (merged)

## Core Execution Tickets (Contract-Only)

### Ticket C1: Customer Module Completion and Error Contract Alignment

Goal:

- Finalize customer maintenance flow with backend error contract mapping consistency.

Acceptance criteria:

- List and search state behavior is stable for loading, empty, and API error cases.
- Create and update forms map backend conflict and validation errors consistently.
- Branch-scope forbidden and not-found states are user-readable and actionable.

Status: DONE
Branch name: ticket-c1-customer-contract-completion
Commit template: feat(frontend): finalize customer module with contract-aligned states

### Ticket C2: Device Module Completion (Lookup + CRUD Consistency)

Goal:

- Complete device flows on top of existing endpoints and normalize identifier behavior.

Acceptance criteria:

- Device create, list-by-customer, detail, update, and delete flows are complete.
- Device lookup by identifier has clear found/not-found/forbidden states.
- Identifier normalization across serial and IMEI fields is consistent in UI and API payloads.

Status: DONE
Branch name: ticket-c2-device-contract-completion
Commit template: feat(frontend): complete device workflows with lookup and contract consistency

### Ticket C3: Repair Job Mutation Completion

Goal:

- Complete contract-backed repair job updates and status transitions.

Acceptance criteria:

- Repair job detail supports update via PUT endpoint (problem, notes, costs).
- Status transitions use PATCH endpoint and update list/detail cache predictably.
- Role visibility in UI matches backend role constraints for update actions.

Status: DONE
Branch name: ticket-c3-repair-job-mutations
Commit template: feat(frontend): add repair job update and status transition flows

### Ticket C4: Inventory Admin Essentials

Goal:

- Implement required admin inventory operations using existing parts endpoints.

Acceptance criteria:

- Admin can create and update parts.
- Admin can update stock quantity and reason input from UI.
- Admin can add and remove compatibility entries per part.
- Technician role can view parts list and part detail but cannot access admin-only actions.

Status: DONE
Branch name: ticket-c4-inventory-admin-essentials
Commit template: feat(frontend): implement contract-backed inventory admin flows

### Ticket C5: Waitlist Operational Completion

Goal:

- Complete waitlist lifecycle flows against current waitlist endpoints.

Acceptance criteria:

- Waitlist request creation handles contact validation and duplicate request conflict.
- Waitlist-by-part view supports status filtering and readable state labels.
- Waitlist status update flow works for pending/notified/resolved/cancelled states.

Status: TODO
Branch name: ticket-c5-waitlist-operations
Commit template: feat(frontend): complete waitlist lifecycle flows

### Ticket C6: Contract-Safe RBAC and Branch Scope UX

Goal:

- Ensure UI permissions and branch-scope handling match backend behavior.

Acceptance criteria:

- Admin-only actions are not exposed to technicians.
- Forbidden responses surface clear messaging without silent failures.
- Cross-branch access attempts consistently resolve to non-destructive UX states.

Status: TODO
Branch name: ticket-c6-rbac-branch-scope-ux
Commit template: chore(frontend): align rbac and branch scope behaviors with api contract

### Ticket C7: Contract Regression QA Gate

Goal:

- Lock functional quality for all contract-backed business flows before enhancement work.

Acceptance criteria:

- Build, lint, and core tests pass locally.
- High-risk flow tests cover create/update/status/waitlist behaviors.
- Regression checklist is completed for Admin and Technician role paths.

Status: TODO
Branch name: ticket-c7-contract-regression-gate
Commit template: test(frontend): add regression coverage for contract-backed workflows

## Blocked Features (Out of Scope Until Backend Contract Exists)

### B1: Technician Assignment Per Repair Job

Reason blocked:

- Current repair job DTO/controller contract has no assigned technician fields or endpoints.

### B2: Parts Allocation or Reservation Per Repair Job

Reason blocked:

- No endpoint currently links parts inventory movement directly to a repair job.

### B3: Part Arrival Driven Service Order Notifications

Reason blocked:

- No notification/event contract currently exposed for frontend consumption.

## Recommended Build Order

1. C1
2. C2
3. C3
4. C4
5. C5
6. C6
7. C7

## Execution Checklist Per Ticket

- Branch created from updated main
- Ticket status changed to IN_PROGRESS
- Scope strictly matches contract-backed goal
- Build/lint/tests green
- Ticket status changed to DONE after merge
- PR includes scope, API contract impact, and test evidence
