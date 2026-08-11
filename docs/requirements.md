# Software Requirements Specification (SRS)
## Order Management & Settlement System

---

## 1. Executive Overview

The **Order Management & Settlement System** provides a secure, reliable platform for managing customer orders, processing partial and full payment settlements, tracking payment histories, and maintaining automated order status lifecycles with user-level data isolation.

---

## 2. Core Functional Requirements

### 2.1 User Authentication & Data Isolation
- **Authentication Credentials**: Users must register and log in using an email address and a secure password hash.
- **JWT Tokens**: Authentication is managed via JSON Web Tokens (JWT) passed in the `Authorization: Bearer <token>` header.
- **User-Level Data Isolation**: Each authenticated user can access only their own orders, items, and payments. API endpoints enforce user boundaries so users cannot view, edit, or delete another user's data under any circumstances.

### 2.2 Order Lifecycle & Management
- **Order Creation**:
  - Must include **Customer Name**, **Due Date**, and at least **one Line Item** (with title, quantity, and unit price).
  - Calculated `totalAmount` is derived automatically from the sum of item subtotals (`quantity * price`).
- **CRUD Operations**:
  - **Create**: Create new orders with validation for customer details and line items.
  - **Read**: Fetch a paginated list of orders or single order details (including attached items, payment history, and calculated balances).
  - **Update**: Modify order details (e.g. customer name, due date, items) subject to immutability rules.
  - **Delete**: Delete an order and its associated line items. Orders with recorded payments cannot be deleted.

### 2.3 Payments & Settlements
- **Payment Processing Timestamp**: `paymentDate` is generated server-side using the current timestamp when the payment is recorded. Clients cannot provide or override payment processing timestamps.
- **Settlement Types**:
  - Supports **Full Settlement** (paying remaining balance in full) and **Partial Settlement** (paying any valid amount less than remaining balance).
- **Overpayment Prevention**:
  - Strict validation prevents recording payments where `payment.amount > remainingBalance`.
  - Attempts to overpay return a `400 Bad Request` validation error with a descriptive error message indicating the exact maximum allowable payment amount.
- **Concurrency & Race Condition Handling**:
  - Concurrent payment requests against the same order are handled using database transactions with row-level locks (`SELECT ... FOR UPDATE`).
  - Prevents race conditions from causing overpayments or corrupted status states during simultaneous requests.

### 2.4 Listing, Filtering & Insights
- **Filtering**: Filter orders by status (`PENDING`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`).
- **Pagination & Search**: Paginated list queries with support for searching by customer name or order ID.
- **Summary Metrics**: Server-side calculation of `totalAmount`, `totalPaid`, `remainingAmount`, and current order status.

---

## 3. Error Handling & API Messaging

All error responses adhere to a consistent, standard JSON format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable, actionable error message",
    "details": []
  }
}
```

### Key Error Scenarios
- **Authentication Failure (`401 Unauthorized`)**: Invalid or missing JWT token.
- **Forbidden Resource Access (`403 Forbidden`)**: Attempting to access resources belonging to another user.
- **Resource Not Found (`404 Not Found`)**: Requested order or payment ID does not exist for the user.
- **Validation Failure (`400 Bad Request`)**: Missing line items, invalid due date format, negative quantities/prices.
- **Overpayment Attempt (`400 Bad Request`)**: Payment amount exceeds current `remainingAmount`.
- **Concurrent Conflict (`409 Conflict` / `422 Unprocessable`)**: Transaction lock collision or state conflict during concurrent payment execution.

---

## 4. Scope & Assumptions

### 4.1 In Scope
- User-level data isolation per authenticated user account.
- Complete Order CRUD operations.
- Multiple full and partial payment recording per order.
- Server-side calculation of `totalPaid`, `remainingAmount`, and current order status.
- PostgreSQL database transactions with row locks for payment race-condition safety.

### 4.2 Assumptions
- **Currency (USD / Cents)**: All monetary amounts operate strictly under USD currency stored in minor units (cents integers on backend, e.g., $100.50 = 10050 cents).
- **JWT Token Expiration (24 Hours)**: Authentication JWT access tokens have a fixed validity lifetime of 24 hours. Upon expiration, API calls return `401 Unauthorized`, automatically ending the active session and requiring the user to log in again.
- **Calendar Due Dates**: `dueDate` is represented as a calendar date (`YYYY-MM-DD`). Time of day is not evaluated for due date calculations to prevent time-of-day edge cases.
- **Order Immutability Post-Payment**: Once the first payment is recorded against an order (`totalPaid > 0`), modifying or deleting the order is strictly prohibited to preserve financial data integrity.
- **Multiple Payments**: An order supports multiple partial payments over time until the remaining balance reaches zero.
- **Overdue Payment Acceptance**: Overdue orders remain open for settlement; users can submit payments against overdue orders at any time.
- **No Overdue Penalties or Late Charges**: Overdue status is an informational state indicator only; no interest, penalties, or late fee charges accrue on overdue balances.
- **No Hard Deletes for Financial Data**: Hard deletion of orders with recorded payments is disabled. Only unpaid/pending orders can be deleted.

### 4.3 Out of Scope for Initial Release
The following features and architectural concepts are explicitly out of scope for the initial release:
- **Access + Refresh Token Architecture**: Complex token pair refresh mechanisms and token revocation lists.
- **Token Rotation / Revocation**: Secret key rotation and real-time session invalidation tables.
- **CI/CD Pipelines**: Continuous integration and deployment automated scripts.
- **Notifications**: Email, SMS, or push notifications for order updates or due date reminders.
- **Admin APIs & Portals**: Platform management endpoints or admin user management.
- **Payment Gateway Integration**: Third-party payment gateway integration (e.g., Stripe, Razorpay).
- **Webhooks**: Outbound HTTP callback events.
- **Background Job System / Cron Jobs**: Asynchronous task queues or scheduled workers.
- **Refunds**: Payment reversals, refund transactions, or credit processing.
- **Audit Logs**: Detailed activity tracking and security audit log tables.
- **Overdue Penalty / Late Fee**: Automatic calculation or addition of late fees to overdue orders.
- **Idempotency Keys**: Explicit `Idempotency-Key` header handling for duplicate payment client retries is outside initial scope.

---

## 5. Business Rules & Status Calculation

### 5.1 Status Calculation Rules & Reconciliation
Stored status is maintained as a persisted database state, while the API reconciles time-dependent status such as `OVERDUE` when evaluating an order.

Dynamic status reconciliation applies the following deterministic rules:

- **`PAID`**: `totalPaid >= totalAmount` (Order balance fully settled).
- **`OVERDUE`**: `currentDate > dueDate` AND `totalPaid < totalAmount` (Calendar due date past and unpaid balance remains).
- **`PARTIALLY_PAID`**: `totalPaid > 0` AND `totalPaid < totalAmount` AND `currentDate <= dueDate` (Partial payments recorded before/on due date).
- **`PENDING`**: `totalPaid == 0` AND `currentDate <= dueDate` (Zero payments recorded before/on due date).

### 5.2 Payment Rules
- `paymentAmount` must be greater than zero.
- Cumulative payments (`totalPaid + currentPaymentAmount`) cannot exceed `totalAmount`.
- Server records server-side `paymentDate` timestamp at execution time.

### 5.3 Order Immutability Rules
- Orders with zero recorded payments (`totalPaid == 0`) can be updated or deleted.
- Orders with at least one recorded payment (`totalPaid > 0`) cannot be updated or deleted.

### 5.4 Due Date Rules
- Due date comparisons utilize calendar date format (`YYYY-MM-DD`).
- Orders become `OVERDUE` at `00:00:00` local calendar date following the specified `dueDate`.

---

## 6. Architectural & Technical Tradeoffs

- **Bun Runtime vs Node.js**:
  - *Tradeoff*: Used **Bun** as the JavaScript runtime and bundler instead of Node.js.
  - *Rationale*: Delivers ultra-fast execution, native TypeScript support without build steps, built-in test runner, and unified package management.
- **Fastify Framework vs Express**:
  - *Tradeoff*: Selected **Fastify** over Express.js for HTTP server architecture.
  - *Rationale*: Higher request throughput, lower resource overhead, and native schema validation hooks.
- **PostgreSQL Relational DB vs NoSQL**:
  - *Tradeoff*: Chose **PostgreSQL** over document databases (MongoDB).
  - *Rationale*: Financial domain requires ACID compliance, foreign key constraints, and transactional row-level locks (`FOR UPDATE`) to prevent payment race conditions.
- **Backend Minor Currency Units (Cents Integers)**:
  - *Tradeoff*: Stored and processed all monetary values in minor units (cents integers) on backend.
  - *Rationale*: Completely eliminates IEEE 754 floating-point precision errors during financial sum accumulations.
- **Just-In-Time Status Reconciliation vs Scheduled Cron**:
  - *Tradeoff*: Status is reconciled at API fetch time rather than relying on background cron jobs.
  - *Rationale*: Avoids background job infrastructure while ensuring status is evaluated against the latest request time.
- **No External Cache Layer (Redis)**:
  - *Tradeoff*: Omitted Redis caching layer.
  - *Rationale*: Ensures strict consistency for transactional payment data and remaining balances without risk of stale cache hits.
- **No Complex Frontend State Management Library**:
  - *Tradeoff*: Used standard React hooks (`useState`, `useContext`) instead of Redux/Zustand.
  - *Rationale*: Keeps bundle size lightweight and codebase maintainable while handling server-state re-validation cleanly.

---

## 7. Requirement Traceability Matrix

| Requirement ID | Module | Feature | Implementation Status |
| :--- | :--- | :--- | :--- |
| **REQ-AUTH-01** | Auth | Register/Login with Email & Password | Completed |
| **REQ-AUTH-02** | Auth | JWT Token Authentication | Completed |
| **REQ-AUTH-03** | Auth / Security | User-Level Data Isolation | Completed |
| **REQ-ORD-01** | Orders | Create Order (Min 1 line item, due date, customer) | Completed |
| **REQ-ORD-02** | Orders | Full Order CRUD Operations (with post-payment immutability) | Completed |
| **REQ-ORD-03** | Orders | Status Tracking & Reconciliation (`PENDING`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`) | Completed |
| **REQ-ORD-04** | Orders | List Orders with Status Filtering | Completed |
| **REQ-PAY-01** | Payments | Record Payment with Date & Note | Completed |
| **REQ-PAY-02** | Payments | Full & Partial Payment Support | Completed |
| **REQ-PAY-03** | Payments | Strict Overpayment Prevention & Error Messages | Completed |
| **REQ-CONC-01** | Concurrency | Transactional Concurrency Handling for Payments | Completed |