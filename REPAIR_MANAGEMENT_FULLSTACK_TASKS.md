# Full-Stack Task List: Unblocking Epic B1 (Technician Assignment)

This document maps out our full-stack execution plan to unblock **Ticket B1: Technician Assignment**. 
By modifying both the .NET API and the React Client, we will build a complete end-to-end business flow.

---

## 🏗️ Epic: Technician Assignment Architecture

```mermaid
graph TD
    subgraph 1. Database & Domain (Models)
        JobModel[Models/RepairJob.cs<br/>- Add AssignedTechnicianId<br/>- Add AssignedTechnician Navigation]
    end
    subgraph 2. DTOs & Contracts
        JobDTOs[RepairJobDtos.cs<br/>- UpdateRequestDto<br/>- ResponseDto]
        UserDTOs[AuthDtos.cs<br/>- AuthUserDto]
    end
    subgraph 3. Controllers & Endpoints
        AuthController[AuthController.cs<br/>- GET api/auth/users?role=Technician]
        JobController[RepairJobsController.cs<br/>- Persist Technician ID on PUT]
    end
    subgraph 4. Frontend Client
        Types[types/repairJob.ts<br/>- Match backend DTOs]
        Hook[useRepairJobs.ts<br/>- Query hook for technicians]
        UI[UpdateRepairJobFields.tsx<br/>- Dropdown select selector]
    end

    JobModel --> JobDTOs
    JobDTOs --> JobController
    AuthController --> Hook
    JobController --> UI
    Hook --> UI
```

---

## 🎫 The Full-Stack Tickets

### **Ticket FS1: Backend Database & Entity Relationship**
* **Goal:** Link `RepairJob` with the `User` (Technician) entity in the database schema.
* **Acceptance Criteria:**
  - `Models/RepairJob.cs` modified to add `public Guid? AssignedTechnicianId { get; set; }` and `public User? AssignedTechnician { get; set; }`.
  - Entity Framework Core migration generated: `AddAssignedTechnicianToRepairJob`.
  - Database updated successfully (`dotnet ef database update`).
  - Unit tests or database context builds successfully.
* **Status:** TODO
* **Branch name:** `ticket-fs1-db-technician-link`
* **Commit template:** `feat(backend): link repair job to user entity with database foreign key`

---

### **Ticket FS2: User Query & List API Endpoint**
* **Goal:** Implement a secure endpoint to list users, allowing the frontend to retrieve available technicians.
* **Acceptance Criteria:**
  - Create a new endpoint `GET /api/auth/users` in `AuthController.cs`.
  - Supports an optional query parameter `role` (e.g. `GET /api/auth/users?role=Technician`).
  - Returns a list of `AuthUserDto` records (ID, Full Name, Email, Role, Branch ID).
  - Endpoint is protected with `[Authorize]`.
  - Verified with an automated xUnit test or integration endpoint check.
* **Status:** TODO
* **Branch name:** `ticket-fs2-list-users-endpoint`
* **Commit template:** `feat(backend): add list users endpoint with role filtering`

---

### **Ticket FS3: Repair Job DTO & Controller Extension**
* **Goal:** Expose and support updating the `AssignedTechnicianId` on a repair job.
* **Acceptance Criteria:**
  - Update `RepairJobResponseDto` to return `AssignedTechnicianId` and `AssignedTechnicianName`.
  - Update `UpdateRepairJobRequestDto` to optionally accept `AssignedTechnicianId`.
  - Update `RepairJobsController` and backend service update handlers to parse and persist the `AssignedTechnicianId` into the database when editing a job.
  - Return the updated technician details in the API response.
* **Status:** TODO
* **Branch name:** `ticket-fs3-repair-job-dto-extension`
* **Commit template:** `feat(backend): extend repair job DTOs and controller for technician assignment`

---

### **Ticket FS4: Frontend User Query & API Client Alignment**
* **Goal:** Bind the React client to the new backend endpoints and update schema validations.
* **Acceptance Criteria:**
  - Update typescript interfaces in `src/types/repairJob.ts` to include `assignedTechnicianId` and `assignedTechnicianName`.
  - Implement a new React Query hook `useGetTechnicians()` hitting `/auth/users?role=Technician`.
  - Update `updateRepairSchema.ts` Zod validation to allow `assignedTechnicianId` as a nullable/optional UUID string.
* **Status:** TODO
* **Branch name:** `ticket-fs4-frontend-api-alignment`
* **Commit template:** `feat(frontend): add technicians query and update form schema validations`

---

### **Ticket FS5: Frontend Technician Selector UI**
* **Goal:** Integrate the technician dropdown select in the job details form.
* **Acceptance Criteria:**
  - Add `<select>` dropdown inside `<UpdateRepairJobFields />` populated by `useGetTechnicians()`.
  - Handled defaults cleanly (render "Unassigned" if ID is null).
  - Form submission successfully updates the assigned technician, invalidates cache, and renders the updated technician details on the detail page.
* **Status:** TODO
* **Branch name:** `ticket-fs5-technician-dropdown-ui`
* **Commit template:** `feat(frontend): implement technician assignment select dropdown UI`

---

## 🚦 Recommended Build Order

We build strictly from the **database layer up**:
1. **FS1** (Database / Entity link)
2. **FS2** (User List Endpoint)
3. **FS3** (Repair Job DTO / Controller persistence)
4. **FS4** (Frontend Query / Types alignment)
5. **FS5** (Frontend Dropdown selector UI)
