# Repair Management Backend v1 Task List

This file is the approved backend implementation plan for the full repair management system.
Use it as the source of truth before coding.

## Product Scope (v1)

The system supports:

- Customer management
- Device intake and tracking
- Repair job workflow management
- Inventory and waitlist management
- Multi-shop readiness
- Printable job order support

## Core Decisions

- Architecture: ASP.NET Core Web API + EF Core + PostgreSQL
- Auth: Existing JWT auth (Admin, Technician)
- Branch strategy: one ticket per branch
- PR strategy: one PR per completed ticket
- Migrations: include migration in same ticket that introduces schema changes
- Testing: add/extend tests per ticket when behavior changes
- Printing output: first version returns structured printable data from API, frontend handles print layout

## Domain Modules

### Module A: Branch and Shop Context

- Shop branch metadata
- Branch-aware data ownership
- User-to-branch assignment

### Module B: Customer Management

- Customer profile and contact details
- Customer-to-device relationship

### Module C: Device Management

- Device intake details
- Device identification and issue details
- Device-to-customer relationship

### Module D: Repair Job Workflow

- Job creation and lifecycle tracking
- Technician assignment
- Status timeline and audit notes
- Final costing fields (repair cost, service charge)

### Module E: Inventory and Waitlist

- Existing implemented module (continue enhancements only)

### Module F: Printable Job Order Data

- Endpoint that returns job order payload for print-friendly rendering

## Ticket Workflow Rules

For each ticket:

1. Create branch from main using ticket name
2. Implement code + migration (if needed)
3. Build and run tests
4. Update this task file status
5. Commit with conventional message
6. Push branch and open PR
7. Merge PR only after review and green checks

## Status Legend

- TODO: not started
- IN_PROGRESS: actively implementing
- BLOCKED: waiting on decision/dependency
- DONE: merged to main

## Epic 1: Branch and Tenant Foundation

### Ticket B1: Add Branch Entity and Mapping

Goal:

- Add Branch model and relationships needed for multi-shop support

Acceptance criteria:

- Branch table exists with unique branch code/name rules
- CreatedAtUtc and UpdatedAtUtc are tracked
- Migration applies successfully

Status: IN_PROGRESS
Branch name: ticket-b1-branch-entity
Commit template: feat(branch): add branch entity and mapping

### Ticket B2: Assign Users to Branches

Goal:

- Link users to branch context for access scoping

Acceptance criteria:

- User has BranchId mapping
- Existing auth user queries include branch context
- Migration applies cleanly

Status: TODO
Branch name: ticket-b2-user-branch-mapping
Commit template: feat(auth): add user branch mapping

### Ticket B3: Branch Access Policy

Goal:

- Enforce branch-level data access in services/controllers

Acceptance criteria:

- Users can only access data within allowed branch scope
- Admin override policy is explicit and tested
- Unauthorized cross-branch access returns 403/404 as appropriate

Status: TODO
Branch name: ticket-b3-branch-access-policy
Commit template: feat(authz): enforce branch scoped access

## Epic 2: Customer Management

### Ticket C1: Define Customer Model and Mapping

Goal:

- Add Customer entity with required profile fields

Fields:

- FullName
- Phone
- Email (optional)
- Address (optional)
- BranchId
- CreatedAtUtc
- UpdatedAtUtc

Acceptance criteria:

- Customer table created with constraints
- Name and phone required
- Branch relationship configured
- Migration applies successfully

Status: TODO
Branch name: ticket-c1-customer-model
Commit template: feat(customer): add customer model and mapping

### Ticket C2: Customer DTOs and Validation

Goal:

- Create request/response DTOs and validation rules

Acceptance criteria:

- Create and update DTOs validated
- Standard validation error response format is preserved
- DTOs cover list and detail scenarios

Status: TODO
Branch name: ticket-c2-customer-dtos
Commit template: feat(customer): add customer dtos and validation

### Ticket C3: Customer Service Layer

Goal:

- Implement customer business logic

Acceptance criteria:

- Create customer
- Update customer
- Get customer by id
- List customers with search
- Duplicate phone policy is defined and enforced

Status: TODO
Branch name: ticket-c3-customer-service
Commit template: feat(customer): implement customer service

### Ticket C4: Customer Controller Endpoints

Goal:

- Expose customer APIs with role checks

Acceptance criteria:

- CRUD endpoints available
- Role permissions enforced
- Status codes consistent

Status: TODO
Branch name: ticket-c4-customer-controller
Commit template: feat(customer): add customer controller endpoints

### Ticket C5: Customer Tests and Postman Coverage

Goal:

- Add backend tests and collection updates for customer flows

Acceptance criteria:

- Service/controller tests for happy and failure paths
- Postman requests cover validation and auth boundaries

Status: TODO
Branch name: ticket-c5-customer-tests
Commit template: test(customer): add customer service and endpoint tests

## Epic 3: Device Management

### Ticket D1: Define Device Model and Mapping

Goal:

- Add Device entity linked to Customer and Branch

Fields:

- CustomerId
- BranchId
- Brand
- Model
- ImeiOrSerialNumber
- DamageDescription
- IntakeNotes
- CreatedAtUtc
- UpdatedAtUtc

Acceptance criteria:

- Device table and foreign keys created
- Customer relation configured
- Optional uniqueness policy for ImeiOrSerialNumber per branch

Status: TODO
Branch name: ticket-d1-device-model
Commit template: feat(device): add device model and mapping

### Ticket D2: Device DTOs and Validation

Goal:

- Create DTOs for create/update/list/detail

Acceptance criteria:

- Required fields validated
- Length and format checks included
- Response DTOs include customer summary fields

Status: TODO
Branch name: ticket-d2-device-dtos
Commit template: feat(device): add device dtos and validation

### Ticket D3: Device Service Layer

Goal:

- Implement device lifecycle logic

Acceptance criteria:

- Create device intake
- Update device details
- Get device by id
- List/search devices by customer, brand, model, serial

Status: TODO
Branch name: ticket-d3-device-service
Commit template: feat(device): implement device service

### Ticket D4: Device Controller Endpoints

Goal:

- Expose device APIs with auth rules

Acceptance criteria:

- Endpoints follow role access rules
- Proper status codes for not found/validation/auth

Status: TODO
Branch name: ticket-d4-device-controller
Commit template: feat(device): add device controller endpoints

### Ticket D5: Device Tests and Postman Coverage

Goal:

- Add tests and API regression scenarios for device module

Acceptance criteria:

- Key service/controller tests pass
- Postman scenarios include invalid payloads and permission checks

Status: TODO
Branch name: ticket-d5-device-tests
Commit template: test(device): add device service and endpoint tests

## Epic 4: Repair Job Workflow

### Ticket R1: Define RepairJob Model, Enums, and Mapping

Goal:

- Add RepairJob aggregate and workflow enums

Proposed status enum:

- Intake
- Diagnosis
- WaitingForApproval
- RepairInProgress
- QualityCheck
- ReadyForPickup
- Completed
- Cancelled

Fields:

- DeviceId
- CustomerId
- BranchId
- AssignedTechnicianUserId (optional)
- ProblemSummary
- DiagnosticNotes
- RepairNotes
- RepairCost
- ServiceCharge
- FinalAmount
- Status
- CreatedAtUtc
- UpdatedAtUtc

Acceptance criteria:

- Tables and relationships created
- Enum persisted consistently
- Migration applies successfully

Status: TODO
Branch name: ticket-r1-repairjob-model
Commit template: feat(repair): add repair job model and enums

### Ticket R2: Add Repair Job Timeline/Audit Entries

Goal:

- Track status transitions and critical actions

Acceptance criteria:

- Timeline entries created on status change
- Entry includes who changed and when
- Query endpoint can return timeline ordered by newest

Status: TODO
Branch name: ticket-r2-repairjob-timeline
Commit template: feat(repair): add repair job timeline tracking

### Ticket R3: Repair Job DTOs and Validation

Goal:

- Add DTOs for job create/update/status change/cost update

Acceptance criteria:

- Status transition payload validated
- Cost fields validated as non-negative
- Business rules for required notes on transitions are enforced where applicable

Status: TODO
Branch name: ticket-r3-repairjob-dtos
Commit template: feat(repair): add repair job dtos and validation

### Ticket R4: Repair Job Service Layer

Goal:

- Implement repair workflow business logic

Acceptance criteria:

- Create job from device
- Change status with transition guards
- Assign technician
- Update costs (repair cost, service charge, final amount)
- Get job details with timeline

Status: TODO
Branch name: ticket-r4-repairjob-service
Commit template: feat(repair): implement repair workflow service

### Ticket R5: Repair Job Controller Endpoints

Goal:

- Expose repair job APIs and workflow actions

Acceptance criteria:

- Create/update/status endpoints available
- Permissions enforced by role
- Branch scope checks applied

Status: TODO
Branch name: ticket-r5-repairjob-controller
Commit template: feat(repair): add repair job controller endpoints

### Ticket R6: Repair Job Tests and Postman Coverage

Goal:

- Validate workflow and state transitions

Acceptance criteria:

- Tests cover valid and invalid transitions
- Assignment and costing rules tested
- Postman includes full intake to completion flow

Status: TODO
Branch name: ticket-r6-repairjob-tests
Commit template: test(repair): add repair job workflow tests

## Epic 5: Inventory Integration Enhancements

### Ticket I11: Link Parts Usage to Repair Jobs

Goal:

- Record consumed parts per repair job

Acceptance criteria:

- RepairJobPartUsage entity exists
- Quantity and pricing tracked
- Stock decremented safely with validation

Status: TODO
Branch name: ticket-i11-repair-parts-usage
Commit template: feat(inventory): track parts usage per repair job

### Ticket I12: Auto-Cost Rollup from Parts Usage

Goal:

- Compute part subtotal and contribute to final amount

Acceptance criteria:

- Parts subtotal calculated reliably
- Final amount logic documented and tested

Status: TODO
Branch name: ticket-i12-cost-rollup
Commit template: feat(repair): add cost rollup from part usage

## Epic 6: Printable Job Order Support

### Ticket P1: Job Order Print DTO and Endpoint

Goal:

- Add API endpoint returning complete printable job order payload

Payload includes:

- Branch info
- Customer info
- Device info
- Repair job info
- Parts used and costs
- Terms/disclaimer text

Acceptance criteria:

- Endpoint returns complete structured data in one call
- Missing optional fields handled gracefully
- Response tested

Status: TODO
Branch name: ticket-p1-joborder-print-endpoint
Commit template: feat(print): add job order print payload endpoint

### Ticket P2: Printable Numbering Strategy

Goal:

- Add human-friendly job order number format

Acceptance criteria:

- Unique readable format per branch and date sequence
- Collision-safe and tested

Status: TODO
Branch name: ticket-p2-joborder-numbering
Commit template: feat(print): add job order numbering strategy

## Recommended Build Order

1. B1
2. B2
3. B3
4. C1
5. C2
6. C3
7. C4
8. C5
9. D1
10. D2
11. D3
12. D4
13. D5
14. R1
15. R2
16. R3
17. R4
18. R5
19. R6
20. I11
21. I12
22. P1
23. P2

## GitHub Execution Checklist Per Ticket

- Branch created from updated main
- Ticket status changed to IN_PROGRESS
- Code implemented with focused scope
- Migration added if schema changed
- Build and tests are green
- Ticket status changed to DONE after merge
- PR title format:
  - [Ticket-ID] Short summary
- PR description includes:
  - Scope
  - API or schema impact
  - Test evidence
  - Postman evidence (if API behavior changed)

## Suggested Next Ticket

Start with Ticket B1 to establish multi-shop foundation early, so all upcoming entities can include BranchId cleanly.
