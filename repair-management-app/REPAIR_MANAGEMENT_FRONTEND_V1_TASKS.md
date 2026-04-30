# Repair Management Frontend v1 Task List

This file is the approved frontend implementation plan for the repair management system.
Use it as the source of truth before coding.

## Product Scope (v1)

The frontend supports:

- Staff authentication and session handling
- Branch-scoped customer and device operations
- Repair job workflow tracking
- Inventory and waitlist visibility
- Clean dashboard and task-oriented navigation
- Mobile-friendly layouts for service desk use

## Core Decisions

- Framework: React 19 + TypeScript + Vite
- Routing: React Router
- Server state: TanStack Query
- Forms: React Hook Form + Zod
- HTTP client: Axios with auth interceptor
- Styling: CSS variables + component-level styles (no heavy UI framework for v1)
- Auth strategy: access token + refresh token flow aligned to backend contract
- Branch strategy: one ticket per branch
- PR strategy: one PR per completed ticket
- Testing: add/extend UI and integration tests per ticket when behavior changes

## Frontend Modules

### Module A: App Shell and Session

- Route structure
- Protected route handling
- Navigation and role-aware menu

### Module B: Customer Management UI

- Customer list and search
- Create and update customer forms
- Branch-scoped rendering

### Module C: Device Management UI

- Device list by customer
- Device intake and update
- Device lifecycle actions

### Module D: Repair Job Workflow UI

- Repair job list with filters
- Job detail and status updates
- Timeline-ready detail layout for future backend timeline endpoint

### Module E: Inventory and Waitlist UI

- Parts list and stock views
- Waitlist request screens
- Inventory-integrated repair flow readiness

### Module F: UX, Design System, and Quality

- Reusable UI primitives
- Error/loading/empty states
- Responsive behavior and accessibility pass

## Ticket Workflow Rules

For each ticket:

1. Create branch from main using ticket name
2. Implement code in focused scope
3. Run lint/build/tests
4. Update this task file status
5. Commit with conventional message
6. Push branch and open PR
7. Merge PR only after review and green checks

## Status Legend

- TODO: not started
- IN_PROGRESS: actively implementing
- BLOCKED: waiting on decision/dependency
- DONE: merged to main

## Epic 1: Foundation and Auth

### Ticket F1: App Shell, Routing, and Layout Foundation

Goal:

- Set up route tree, shell layout, and baseline navigation

Acceptance criteria:

- App has public and protected route groups
- Layout includes header, sidebar, and content region
- Navigation reflects user role and current route
- Unknown routes resolve to a clear not-found page

Status: IN_PROGRESS
Branch name: ticket-f1-app-shell-routing
Commit template: feat(frontend): add app shell and routing foundation

### Ticket F2: Auth State and Token Lifecycle

Goal:

- Implement login, logout, and token lifecycle handling

Acceptance criteria:

- Login screen calls backend contract and stores tokens safely
- Protected routes redirect unauthenticated users to login
- Refresh flow retries one failed request after token renewal
- Invalid refresh token forces full logout and redirect

Status: TODO
Branch name: ticket-f2-auth-session-flow
Commit template: feat(frontend): implement auth session and refresh flow

### Ticket F3: API Client and Error Normalization

Goal:

- Centralize API calls and normalize backend errors for UI use

Acceptance criteria:

- Axios client supports auth headers and interceptor chain
- API errors map to a consistent UI error shape
- Validation error payloads are rendered field-by-field
- 401 and 403 handling behavior is consistent across pages

Status: TODO
Branch name: ticket-f3-api-client-layer
Commit template: feat(frontend): add api client and error handling layer

## Epic 2: Customer and Device UI

### Ticket F4: Customer List and Create Flow

Goal:

- Build customer list/search and create form experience

Acceptance criteria:

- Customer list loads with query support
- Create form validates before submission
- Success path updates list without full page reload
- API validation messages appear on relevant fields

Status: TODO
Branch name: ticket-f4-customer-list-create
Commit template: feat(frontend): add customer list and create flow

### Ticket F5: Customer Edit and Detail Experience

Goal:

- Build customer detail and update workflows

Acceptance criteria:

- Customer detail view displays safe profile fields
- Update form supports optimistic or invalidation refresh
- Not-found and forbidden states are handled gracefully
- Route-level loading and error states are present

Status: TODO
Branch name: ticket-f5-customer-edit-detail
Commit template: feat(frontend): add customer detail and update flow

### Ticket F6: Device Intake and Device List by Customer

Goal:

- Implement device creation and customer-linked device views

Acceptance criteria:

- Device create form accepts required enum and text inputs
- Device list by customer is query-driven and branch-safe
- Edit and delete actions are role-gated in UI
- Device status feedback is visible after each action

Status: TODO
Branch name: ticket-f6-device-intake-list
Commit template: feat(frontend): add device intake and customer device views

## Epic 3: Repair Workflow UI

### Ticket F7: Repair Job List, Filter, and Detail View

Goal:

- Build repair job pages for triage and ongoing tracking

Acceptance criteria:

- Repair job list supports status filtering
- Job detail page shows cost fields and notes safely
- Empty and no-match states are clearly differentiated
- Detail page is prepared for timeline data once backend exposes it

Status: TODO
Branch name: ticket-f7-repair-list-detail
Commit template: feat(frontend): add repair job list and detail views

### Ticket F8: Repair Actions (Create, Update, Status Changes)

Goal:

- Build key repair job mutation flows used by Admin and Technician

Acceptance criteria:

- Create repair job form uses customer/device context correctly
- Status change actions enforce allowed role visibility
- Update form supports diagnosis/resolution/cost fields
- Mutation success updates relevant views predictably

Status: TODO
Branch name: ticket-f8-repair-actions
Commit template: feat(frontend): add repair job create update and status actions

## Epic 4: Inventory Integration and UX Quality

### Ticket F9: Inventory and Waitlist Integration Screens

Goal:

- Integrate existing inventory/waitlist APIs into repair workflow views

Acceptance criteria:

- Parts availability can be viewed from relevant repair screens
- Waitlist creation path is available from out-of-stock context
- Basic integration points for parts usage are prepared for I11/I12 backend delivery
- Error handling matches global frontend standards

Status: TODO
Branch name: ticket-f9-inventory-waitlist-ui
Commit template: feat(frontend): integrate inventory and waitlist screens

### Ticket F10: Design System Pass, Responsiveness, and QA Hardening

Goal:

- Finalize visual consistency, accessibility basics, and production readiness

Acceptance criteria:

- Shared design tokens are used across all core screens
- Responsive behavior is verified on mobile and desktop breakpoints
- Accessibility basics pass (labels, focus, contrast, keyboard)
- Build, lint, and tests pass on CI and local

Status: TODO
Branch name: ticket-f10-ux-qa-hardening
Commit template: chore(frontend): polish ui responsiveness and quality gates

## Recommended Build Order

1. F1
2. F2
3. F3
4. F4
5. F5
6. F6
7. F7
8. F8
9. F9
10. F10

## GitHub Execution Checklist Per Ticket

- Branch created from updated main
- Ticket status changed to IN_PROGRESS
- Scope kept focused to ticket goal
- Build/lint/tests green
- Ticket status changed to DONE after merge
- PR title format:
  - [Ticket-ID] Short summary
- PR description includes:
  - Scope
  - UI/API contract impact
  - Test evidence
  - Screenshots or short recording for UI changes

## Suggested Next Ticket

Start with Ticket F1 to establish shell, route guards, and layout primitives used by all other frontend tickets.
