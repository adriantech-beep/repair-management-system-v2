# 🎓 Full-Stack Developer Playbook & Senior Engineering Guidelines

Welcome to the engineering playbook for the **Repair Management System**. This document establishes our technical philosophy, architectural standards, and developer-mindset principles. 

As your **Senior Developer**, I am here to help you transition from someone who "just writes code" to an **Architect & Systems Thinker** who designs resilient, scalable, and type-safe systems.

---

## 🧠 1. The Senior Full-Stack Mindset (Thinking vs. Coding)

### 🚫 Never "Just Start Coding"
Before writing a single line of code, follow the **3-Step Rule**:
1. **Map the Data Lifecycle:** Where does this data start? (Database columns, API DTOs, React State, HTML input value).
2. **Identify the Edge Cases:** What happens if the network is offline? If the field is empty? If a Technician attempts an Admin operation? If two users click submit at the same time?
3. **Verify the API Contract:** Ensure the frontend expectations align exactly with the backend's controllers, DTOs, and validation rules. Never speculate.

### 🛡️ Defensive Engineering
* **Fail Loudly & Gracefully:** Never let an API call fail silently. Always catch errors, parse them, and present an actionable message to the user.
* **Respect Database Integrity:** Treat your database schema as sacred. For example, if a field is optional, preserve its `null` value in the database. Never default it to `0` or `""` simply because it's easier in the UI—this distorts business metrics (e.g., distinguishing an unset estimated cost from a free repair).

---

## 🏗️ 2. Core Frontend Architecture Principles

### 🧬 Component Decomposition (Container vs. Presenter)
* **Monolithic Containers are Technical Debt:** If a file exceeds 200–300 lines or manages more than 2–3 unrelated local `useState` hooks, it must be decomposed.
* **Presenter Shells:** Parent components (like `RepairJobDetail.tsx`) must be completely pure coordinates. They fetch initial data, manage no local states, and delegate UI rendering to specialized subcomponents.

### 🔄 The Three Types of State
Always choose the correct state management tool:
1. **Server State (React Query / SWR):** All network data, caching, and server-side cache invalidation.
2. **Global/Transient UI State (Zustand):** Lightweight, high-performance UI state accessed by multiple decoupled components (e.g., active modals, shared drafts, drawer toggles).
3. **Transactional Form State (React Hook Form + Zod):** Isolated, complex data validation and submission states.

### 🔒 Strict Type Safety
* **Ban `as any`:** Resorting to `as any` silences compiler warnings but introduces runtime crashes. 
* **Create Validation Boundaries:** Use Zod schemas to handle input pre-processing (converting empty HTML strings `""` back to `null` or `number`).
* **Deliberate Casting:** If type conversion is required between form state and DTO contracts after validation, document it and use a clean `as unknown as UpdateRepairJobRequest` cast.

---

## 🛠️ 3. The Backend & Database Standard

* **DTO Isolation:** Never expose raw database entities directly to the API controllers. Use Request/Response DTOs to encapsulate the contract.
* **Consistent Status Enums:** Statuses and transitions must be strictly enforced at the domain model level (e.g. state transition rules in backend domain models).
* **Automated Rollbacks:** All multi-step database mutations must run inside database transactions to prevent orphaned records.

---

## 🤝 4. Our Code Review & Mentorship Flow

In every subsequent task, we will operate like a high-performing professional team. Here is how I will guide and mentor you:

### 💬 The "Why" Before the "What"
When proposing or explaining changes, I won't just give you code. I will explain the **architectural rationale**, performance implications, and design patterns (such as why we separate form data from API requests).

### 🔍 Code Review Criteria
When reviewing your code, I will evaluate it against these four pillars:
1. **Separation of Concerns:** Are components single-responsibility?
2. **Data Integrity:** Are null values and boundary limits preserved?
3. **Type Strictness:** Is the type safety robust without fallback cheats?
4. **UX Ergonomics:** Does the user receive immediate loading indicators, disabled submit actions, and clear error responses?

---

> *"The best code is no code at all, and the second-best code is simple, decoupled, and easily testable."* Let's build something exceptional!
