# Inventory + Waitlist API Contract v1

Last updated: 2026-04-19
Status: Draft (implementation pending)

## Purpose

This document is the frontend/backend integration contract for inventory, compatibility, waitlist, and stock-arrival notification behavior.
Use it together with Swagger for exact payloads.

Base URL (dev): http://localhost:5252

## Security Model

- Access token: JWT (existing auth)
- Roles:
  - Admin: create/update inventory and stock
  - Technician: read inventory and create waitlist requests

## Authorization Header

For protected endpoints:

Authorization: Bearer <accessToken>

## Validation Error Format

For request payload validation failures, API returns 400 Bad Request with:

{
"code": "VALIDATION_ERROR",
"message": "One or more validation errors occurred.",
"errors": {
"FieldName": ["Validation message"]
}
}

## Endpoint Contract (v1)

## 1) POST /api/parts

Purpose: Create a new part.

Auth required: Yes (Admin)

Request body:

{
"partNumber": "PRT-0001",
"name": "LCD Assembly",
"category": "LCD",
"stockQuantity": 0,
"supplierPrice": 1200.00,
"sellingPrice": 1800.00
}

Success:

- 201 Created
- Returns created part with id

Failure:

- 400 validation error
- 401 unauthorized
- 403 forbidden (non-admin)
- 409 conflict (duplicate partNumber)

## 2) GET /api/parts

Purpose: List parts with optional filters.

Auth required: Yes (Admin or Technician)

Query examples:

- ?search=lcd
- ?category=Battery
- ?brand=Vivo&modelName=Y35
- ?inStockOnly=true

Success:

- 200 OK with list of parts

## 3) GET /api/parts/{partId}

Purpose: Get a part with compatibility entries.

Auth required: Yes (Admin or Technician)

Success:

- 200 OK

Failure:

- 401 unauthorized
- 404 not found

## 4) PUT /api/parts/{partId}

Purpose: Update part details except stock quantity.

Auth required: Yes (Admin)

Success:

- 200 OK

Failure:

- 400 validation error
- 401 unauthorized
- 403 forbidden
- 404 not found
- 409 conflict (duplicate partNumber)

## 5) POST /api/parts/{partId}/compatibilities

Purpose: Add compatibility row to part.

Auth required: Yes (Admin)

Request body:

{
"brand": "Vivo",
"modelName": "Y35"
}

Success:

- 201 Created

Failure:

- 400 validation error
- 401 unauthorized
- 403 forbidden
- 404 part not found
- 409 duplicate compatibility

## 6) DELETE /api/parts/{partId}/compatibilities/{compatibilityId}

Purpose: Remove a compatibility row.

Auth required: Yes (Admin)

Success:

- 204 No Content

Failure:

- 401 unauthorized
- 403 forbidden
- 404 not found

## 7) PATCH /api/parts/{partId}/stock

Purpose: Set stock quantity.

Auth required: Yes (Admin)

Request body:

{
"newQuantity": 8,
"reason": "New supplier delivery"
}

Success:

- 200 OK
- If transition is 0 -> >0, pending waitlist notifications are triggered

Failure:

- 400 validation error
- 401 unauthorized
- 403 forbidden
- 404 not found

## 8) POST /api/parts/{partId}/waitlist

Purpose: Create waitlist request for customer.

Auth required: Yes (Admin or Technician)

Request body:

{
"customerName": "Juan Dela Cruz",
"customerEmail": "juan@email.com",
"customerPhone": "09171234567",
"preferredContactMethod": "Email",
"notes": "Needs original quality"
}

Rules:

- At least one of customerEmail or customerPhone is required
- Duplicate active request for same part + same contact is rejected

Success:

- 201 Created

Failure:

- 400 validation error
- 401 unauthorized
- 404 part not found
- 409 duplicate active request

## 9) GET /api/parts/{partId}/waitlist

Purpose: List waitlist requests by part.

Auth required: Yes (Admin or Technician)

Optional query:

- ?status=Pending

Success:

- 200 OK

Failure:

- 401 unauthorized
- 404 part not found

## 10) PATCH /api/waitlist/{waitlistRequestId}/status

Purpose: Update waitlist request status.

Auth required: Yes (Admin or Technician)

Request body:

{
"status": "Resolved"
}

Success:

- 200 OK

Failure:

- 400 validation error
- 401 unauthorized
- 404 not found

## Notification Behavior Contract

When stock for a part transitions from 0 to greater than 0:

- System finds all Pending waitlist requests for that part
- System attempts notification for each request
- Success path marks request as Notified and sets NotifiedAtUtc
- If notification provider is unavailable, system logs intended notification and keeps status as Pending or sets a retriable state based on implementation decision

## Frontend Integration Notes

- Inventory screens should show stock and compatibility at a glance
- Out-of-stock parts should expose a clear add-to-waitlist action
- Waitlist form should allow email, phone, or both
- Duplicate waitlist responses should show actionable error message
- After stock update success, refresh waitlist list for that part

## Change Policy

When endpoint behavior changes, update this contract in the same PR as code changes.
