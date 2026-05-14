# Repair Management Frontend v1 Task List

This file is the approved frontend implementation plan for the repair management system.
Use it as the source of truth before coding.

## Product Scope (v1)

The frontend supports:

- Staff authentication and session handling
- Branch-scoped customer and device operations
- Repair job workflow tracking
- Service Order-first intake flow (device lookup first, then customer confirmation)
- Inventory and waitlist visibility
- Clean dashboard and task-oriented navigation
- Mobile-friendly layouts for service desk use

## Core Decisions

- Framework: React 19 + TypeScript + Vite
- Routing: React Router
- Server state: TanStack Query
- Forms: React Hook Form + Zod
- HTTP client: Axios with auth interceptor
- Styling: shadcn/ui (Tailwind v4 + Radix primitives) with CSS variables for design tokens
- Auth strategy: access token + refresh token flow aligned to backend contract
- Branch strategy: one ticket per branch
- PR strategy: one PR per completed ticket
- Testing: add/extend UI and integration tests per ticket when behavior changes

## Frontend Modules

### Module A: App Shell and Session

- Route structure
- Protected route handling
- Navigation and role-aware menu

### Sidebar Navigation (agreed in F1)

Primary action:

- Create SO (Service Order) — wizard entry point

Management links:

- Dashboard
- Repair Jobs
- Customers
- Devices
- Inventory
- Settings

Footer:

- Logout

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

## Operational Flow Decision (May 2026)

- Primary operational journey is Create SO (Service Order) wizard.
- Customer routes are retained as back-office maintenance tools (search, cleanup, corrections).
- SO wizard starts with device lookup (IMEI/serial); customer data is then confirmed/edited for the new service order.
- Existing customer records remain reusable across many service orders.
- Historical service order records should preserve intake context even if customer profile is edited later.

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

Status: DONE
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

Status: DONE
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

Status: DONE
Branch name: ticket-f3-api-client-layer
Commit template: feat(frontend): add api client and error handling layer

## Epic 2: Customer and Device UI

### Ticket F4: Customer List and Create Flow

Goal:

- Build customer list/search and minimal create flow for back-office maintenance

Acceptance criteria:

- Customer list loads with query support
- Create form validates before submission
- Success path updates list without full page reload
- API validation messages appear on relevant fields
- Duplicate phone conflict is surfaced clearly (field + root message)
- Scope stays focused on customer module support, not SO intake orchestration

Status: DONE
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

Status: IN_PROGRESS
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

Status: IN_PROGRESS
Branch name: ticket-f7-repair-list-detail
Commit template: feat(frontend): add repair job list and detail views

### Ticket F8: Service Order Wizard and Repair Actions

Goal:

- Build the Create SO wizard as the primary intake flow and repair job mutation flows

Acceptance criteria (summary):

- Create SO wizard enforces step order: Device Lookup (IMEI/Serial) → Customer Confirm/Edit → Repair Job Details → Confirmation
- Step 1 allows lookup by IMEI/serial and loads linked device/customer when found
- Step 2 allows customer confirmation/edit for this intake and supports inline create when no customer match exists
- Step 3 collects issue description, priority, and technician assignment
- Step 4 shows summary and redirects to the new repair job detail page
- Status change actions enforce allowed role visibility
- Update form supports diagnosis/resolution/cost fields
- Mutation success updates relevant views predictably

Status: DONE
Branch name: ticket-f8-device-lookup
Commit template: feat(frontend): add repair job create update and status actions

---

#### Detailed Acceptance Criteria for ticket-f8-device-lookup (Create SO Wizard MVP)

**Step 1: Device Lookup**

- User can enter IMEI/Serial and trigger lookup.
- If found, matched customer/device is shown and stored in wizard state.
- If not found, user can continue to new intake flow.
- All validation and API errors are clearly shown.

**Step 2: Customer/Device Confirmation**

- If matched, show summary of customer/device (read-only for MVP).
- If not matched, show “new intake” mode and explain next steps.
- User can go back to Step 1 at any time.

**Step 3: Repair Details**

- User can enter problem description (required).
- User can enter estimated cost (optional).
- Validation is enforced before submit.

**Step 4: Submit**

- If matched, submit repair job using matched customerId/deviceId.
- If new intake, create customer, then device, then repair job in order.
- On success, route to repair job detail/list with confirmation.
- On failure, show actionable error and allow retry.

**Guardrails**

- Branch scope and role constraints are enforced by backend.
- No inventory/parts reservation in MVP.
- Wizard state can be reset after completion.

---

#### Implementation Order (MVP, Small Slices)

1. Step 2: Existing Match Mode

- Show summary card (already done).
- Add “Confirm and Continue” button to proceed to Step 3.

2. Step 2: New Intake Mode

- Show new intake notice (already done).
- (Next slice) Add form for new customer/device details.

3. Step 3: Repair Details

- Scaffold form for problem description and estimated cost.
- Add validation.

4. Step 4: Submit

- Add createRepairJob API/hook.
- Wire up submit for both matched and new intake paths.
- Handle success/failure UI.

5. Final polish

- Reset wizard state on completion.
- Add navigation/UX polish as needed.

## Epic 4: Inventory Integration and UX Quality

### Ticket F9: Inventory and Waitlist Integration Screens

Goal:

- Integrate existing inventory/waitlist APIs into repair workflow views

Acceptance criteria:

- Parts availability can be viewed from relevant repair screens
- Waitlist creation path is available from out-of-stock context
- Basic integration points for parts usage are prepared for I11/I12 backend delivery
- Error handling matches global frontend standards

Status: IN_PROGRESS
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
