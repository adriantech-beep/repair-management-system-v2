# Inventory + Waitlist v1 Task List

This file is the approved implementation plan for the inventory and part-arrival notification feature.
Use it as the source of truth before coding.

## Current Decisions

- Inventory domain is built first (Option A)
- A part can be compatible with multiple device models
- Device identity for compatibility: Brand + ModelName
- Waitlist captures customer contact when part is out of stock
- Notification channel for v1: Email only
- Notification trigger: stock transitions from 0 to greater than 0
- Role permissions:
  - Admin: full inventory management
  - Technician: create waitlist requests, read inventory, mark requests resolved
- Duplicate waitlist policy:
  - Do not create duplicate active request for same contact + part
- v1 messaging strategy:
  - Log email intent if SMTP is not configured
  - Keep notification interface abstraction for later SMTP integration

## Approved Domain Models (v1)

### Part

- Id: Guid
- PartNumber: string
- Name: string
- Category: string
- StockQuantity: int
- SupplierPrice: decimal
- SellingPrice: decimal
- IsActive: bool
- CreatedAtUtc: DateTime
- UpdatedAtUtc: DateTime

Constraints:

- Primary key: Id
- PartNumber required, unique
- Name required, 2-120 chars
- Category required, 2-60 chars
- StockQuantity >= 0
- SupplierPrice >= 0
- SellingPrice >= 0
- SellingPrice should not be less than SupplierPrice (business rule)

### PartCompatibility

- Id: Guid
- PartId: Guid
- Brand: string
- ModelName: string
- CreatedAtUtc: DateTime

Constraints:

- Primary key: Id
- PartId required, foreign key to Part.Id
- Brand required, 2-60 chars
- ModelName required, 2-80 chars
- Unique index on (PartId, Brand, ModelName)

Relationship:

- One Part has many PartCompatibility entries
- One PartCompatibility belongs to one Part

### PartWaitlistRequest

- Id: Guid
- PartId: Guid
- CustomerName: string
- CustomerEmail: string?
- CustomerPhone: string?
- PreferredContactMethod: Email | Phone
- Notes: string?
- Status: Pending | Notified | Resolved | Cancelled
- CreatedAtUtc: DateTime
- NotifiedAtUtc: DateTime?
- ResolvedAtUtc: DateTime?

Constraints:

- Primary key: Id
- PartId required, foreign key to Part.Id
- CustomerName required, 2-100 chars
- At least one of CustomerEmail or CustomerPhone is required
- PreferredContactMethod required
- Status required
- Active duplicate protection for same PartId + same contact (Email or Phone)

Relationship:

- One Part has many PartWaitlistRequest entries
- One PartWaitlistRequest belongs to one Part

## Implementation Tickets

### Ticket I1: Define Inventory and Waitlist Domain Models

Goal:

- Create Part, PartCompatibility, and PartWaitlistRequest models plus enums

Acceptance criteria:

- Models match approved spec
- One-to-many relationships are represented in models
- Enum values are explicit and constrained

### Ticket I2: Configure DbContext and Entity Mapping

Goal:

- Persist inventory and waitlist models correctly in PostgreSQL

Acceptance criteria:

- Relationships and indexes are configured
- Unique index for Part.PartNumber exists
- Unique index for compatibility tuple exists
- Validation-related lengths/required fields are aligned

### Ticket I3: Create and Apply Migration

Goal:

- Materialize inventory and waitlist schema

Acceptance criteria:

- New tables are created successfully
- Foreign keys and indexes exist
- Migration applies without errors

### Ticket I4: Build DTOs and Validation

Goal:

- Add request/response DTOs with DataAnnotations

Acceptance criteria:

- Create/Update Part DTOs are validated
- Compatibility add/remove DTOs are validated
- Waitlist create DTO enforces contact rule
- Validation errors follow existing API validation format

### Ticket I5: Implement Inventory Service Layer

Goal:

- Centralize business logic for parts and stock updates

Acceptance criteria:

- Create, update, get, list parts implemented
- Add/remove compatibility implemented
- Stock update logic prevents negative stock
- Stock transition detector (0 -> >0) is implemented

### Ticket I6: Implement Waitlist Service Layer

Goal:

- Handle customer waitlist lifecycle

Acceptance criteria:

- Create waitlist request implemented
- Duplicate active request is rejected consistently
- List pending requests by part implemented
- Mark resolved/cancelled implemented

### Ticket I7: Implement Notification Abstraction and Trigger

Goal:

- Notify pending waitlist requests when stock arrives

Acceptance criteria:

- INotificationService abstraction exists
- Stock transition to available triggers notification flow
- Pending waitlist requests are marked Notified with timestamp
- If email provider unavailable, log notification intent with details

### Ticket I8: Add Inventory and Waitlist Controllers

Goal:

- Expose API endpoints for parts, compatibility, waitlist, and stock operations

Acceptance criteria:

- Endpoints follow role permissions
- Status codes and response shapes are consistent
- Admin-only mutating inventory endpoints are protected
- Technician can create waitlist requests

### Ticket I9: Add Postman Collection for Inventory Waitlist Flow

Goal:

- Provide regression coverage for end-to-end flow

Acceptance criteria:

- Covers out-of-stock -> waitlist -> restock -> notify path
- Covers duplicate waitlist rejection
- Covers role permission failures

### Ticket I10: Add Backend Tests

Goal:

- Verify key business rules and notification trigger behavior

Acceptance criteria:

- Stock transition trigger tested
- Duplicate waitlist prevention tested
- Contact validation tested
- Authorization behavior tested for critical endpoints

## Recommended Build Order

1. Ticket I1: Define Inventory and Waitlist Domain Models
2. Ticket I2: Configure DbContext and Entity Mapping
3. Ticket I3: Create and Apply Migration
4. Ticket I4: Build DTOs and Validation
5. Ticket I5: Implement Inventory Service Layer
6. Ticket I6: Implement Waitlist Service Layer
7. Ticket I7: Implement Notification Abstraction and Trigger
8. Ticket I8: Add Inventory and Waitlist Controllers
9. Ticket I9: Add Postman Collection for Inventory Waitlist Flow
10. Ticket I10: Add Backend Tests
