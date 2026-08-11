# Test Suite & Concurrency Verification Specification

This document details the backend test suite architecture, business invariant coverage, and concurrency verification strategy implemented for the Order Management and Payment Settlement platform.

---

## 🏗️ Test Architecture & Philosophy

The backend test suite is built using **Bun Test** (`bun test`), Bun's native, lightweight test runner. The test suite is purposely structured to prioritize **business invariants, financial calculations, user isolation, and database concurrency protection** rather than trivial assertions.

```text
server/
├── src/
└── tests/
    ├── unit/
    │   ├── status-calc.test.ts      # Pure business rules & status precedence
    │   └── date-utils.test.ts       # UTC midnight & calendar boundary rules
    │
    └── integration/
        ├── helper.ts                # Fastify test app builder & DB cleanup
        ├── auth.test.ts             # Authentication & route authorization
        ├── orders.test.ts           # Order CRUD, isolation & immutability
        └── payments.test.ts         # Payment settlement & concurrency locking
```

---

## 🧪 Test Coverage Breakdown

### 1. Unit Tests (`server/tests/unit/`)

#### Order Status Calculation (`status-calc.test.ts`)
Validates the status precedence resolution rules (`PAID` $\rightarrow$ `OVERDUE` $\rightarrow$ `PARTIALLY_PAID` $\rightarrow$ `PENDING`):
- **New order**: `total = $100`, `paid = $0`, due in future $\rightarrow$ `PENDING`
- **Partial payment**: `total = $100`, `paid = $40`, due in future $\rightarrow$ `PARTIALLY_PAID`
- **Fully paid**: `total = $100`, `paid = $100`, due in future $\rightarrow$ `PAID`
- **Unpaid overdue**: `total = $100`, `paid = $0`, due yesterday $\rightarrow$ `OVERDUE`
- **Partially paid overdue**: `total = $100`, `paid = $40`, due yesterday $\rightarrow$ `OVERDUE`
- **Fully paid overdue**: `total = $100`, `paid = $100`, due yesterday $\rightarrow$ `PAID`

#### Date & Boundary Utilities (`date-utils.test.ts`)
Validates calendar-date UTC midnight normalization rules:
- **Due today**: `dueDate = today` $\rightarrow$ Not overdue (`false`)
- **Due yesterday**: `dueDate = yesterday` $\rightarrow$ Overdue (`true`)
- **Due tomorrow**: `dueDate = tomorrow` $\rightarrow$ Not overdue (`false`)

---

### 2. Integration Tests (`server/tests/integration/`)

Integration tests run directly against PostgreSQL to verify real Fastify endpoint responses, database state transitions, and ACID transaction rollbacks.

#### Authentication & Authorization (`auth.test.ts`)
- **User Registration**: `POST /api/auth/register` creates user and returns JWT token (`201 CREATED`).
- **Duplicate Email Prevention**: Registering an existing email returns `400 BAD REQUEST` with `USER_ALREADY_EXISTS`.
- **User Login**: `POST /api/auth/login` verifies credentials and issues valid JWT token (`200 OK`).
- **Invalid Password**: Returns `401 UNAUTHORIZED` with `INVALID_CREDENTIALS`.
- **Protected Endpoint Security**: Requesting protected endpoints (e.g., `GET /api/orders`) without a valid Bearer JWT header returns `401 UNAUTHORIZED`.

#### Order Management & Multi-Tenancy (`orders.test.ts`)
- **Server-Side Price Calculation**: Creates orders using line items (`sum(quantity * unitPrice)`), verifying total amount is calculated server-side rather than accepted from client input.
- **Zod Request Validation**: Rejects empty item lists or non-positive quantities/unit prices (`400 BAD REQUEST`).
- **Strict User Isolation**: User B attempting to fetch (`GET`), update (`PATCH`), or delete (`DELETE`) User A's order receives `404 NOT_FOUND`.
- **Order Immutability (Update Rejection)**: `PATCH /api/orders/:id` on an order with recorded payments is rejected (`400 ORDER_HAS_PAYMENTS`).
- **Order Immutability (Delete Rejection)**: `DELETE /api/orders/:id` on an order with recorded payments is rejected (`400 ORDER_HAS_PAYMENTS`).
- **Pagination & Metadata**: `GET /api/orders?page=1&limit=2` properly formats response metadata (`totalPages`, `hasMore`).
- **Dynamic Status Filtering**: `GET /api/orders?status=PARTIALLY_PAID` reconciles overdue items before applying exact status filters.

#### Payment Settlement & Concurrency (`payments.test.ts`)
- **Partial & Full Settlement Flow**: Partial payment updates order status to `PARTIALLY_PAID`; subsequent balance payment transitions status to `PAID`.
- **Multiple Payment Accumulation**: Sequentially recording $30, $20, and $50 payments against a $100 order accurately aggregates `totalPaid` to $100 and updates status to `PAID`.
- **Overpayment Rejection & Rollback**: Payment exceeding remaining balance returns `400 PAYMENT_EXCEEDS_BALANCE`. Assertions confirm database `totalPaid` and payment counts remain completely unchanged.
- **Overdue Partial Payment Rule**: Recording a partial payment against an overdue order updates `totalPaid` but retains `OVERDUE` status (never reverting to `PARTIALLY_PAID`).
- **Overdue Final Payment Rule**: Recording a full remaining balance payment against an overdue order transitions status to `PAID`.

---

## 🔥 Concurrency Verification (`FOR UPDATE` Locking)

### Race Condition Prevention Test

The system uses PostgreSQL row-level locking (`SELECT ... FOR UPDATE`) inside an explicit database transaction to prevent concurrent overpayments:

```ts
const [resA, resB] = await Promise.all([
  app.inject({
    method: "POST",
    url: "/api/payments",
    headers: { authorization: `Bearer ${token}` },
    payload: { orderId, amount: 70000 }, // Request A: $700
  }),
  app.inject({
    method: "POST",
    url: "/api/payments",
    headers: { authorization: `Bearer ${token}` },
    payload: { orderId, amount: 50000 }, // Request B: $500
  }),
]);
```

#### Test Verification:
1. **Simultaneous Execution**: Requests A ($700) and B ($500) are dispatched concurrently (`Promise.all`) against a $1,000 order.
2. **Lock Acquisition**: PostgreSQL grants the `FOR UPDATE` lock to one request while forcing the second request to wait.
3. **Transaction Execution**: The winning transaction records the payment and releases the lock. The second transaction reads the updated remaining balance ($300) and rejects with `400 PAYMENT_EXCEEDS_BALANCE`.
4. **Invariant Assertion**:
   - Exactly **one** HTTP request succeeds (`201 CREATED`) and **one** fails (`400 BAD REQUEST`).
   - Database payment records count equals **1**.
   - `totalPaid` is strictly $\le \$1,000$ ($700 or $500, never $1,200).

---

## 🚀 Running the Tests

Execute all unit and integration tests from the `server/` directory:

```bash
cd server
bun test
```

To run a specific test suite:

```bash
# Run unit tests only
bun test tests/unit

# Run payment concurrency tests only
bun test tests/integration/payments.test.ts
```
