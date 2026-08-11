# Orders & Settlements Engine

A production-oriented implementation of a multi-tenant Order Management and Payment Settlement platform engineered for financial data integrity, strict user isolation, and high-concurrency transaction processing.


---

## 🔗 Live Demo / Deployment

- **Live Application**: [https://dummypay.vercel.app/](https://dummypay.vercel.app/)

---

## 🌟 Key Highlights & Architectural Strengths

- **Financial Integrity**: Minor-unit integer calculations (cents/BigInt) preventing floating-point rounding errors.
- **Concurrency Safety**: PostgreSQL row-level locking (`FOR UPDATE`) inside DB transactions to guarantee strict overpayment prevention under race conditions.
- **Double-Submission Prevention**: Swipe-to-Pay gesture confirmation UI (`SwipeButton.tsx`) eliminating rapid double-taps/accidental resubmissions.
- **Strict User Isolation**: Multitenant authorization ensuring users can only view, mutate, or settle their own orders.
- **Deterministic Status Machine**: Dynamic state reconciliation (`PENDING` $\rightarrow$ `PARTIALLY_PAID` $\rightarrow$ `PAID` / `OVERDUE`).
- **Order Immutability**: Orders with active financial history (`totalPaid > 0`) cannot be edited or deleted.

---

## 🏗️ Architecture & Component Overview

```text
┌─────────────────────────────────────────────────────────┐
│                     React + Vite                        │
│             Tailwind CSS + TanStack Query               │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ REST API (JSON / Bearer JWT)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Fastify + Bun                        │
│          Zod Validation • JWT Auth • Rate Limits        │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ Prisma ORM (Typed Queries)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL 16                        │
│          ACID Transactions • Row Locking (FOR UPDATE)   │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript | Modern UI, responsive layout, modal workflows |
| **State Management** | TanStack Query (v5) | Cache invalidation, optimistic updates, async state handling |
| **Styling** | Tailwind CSS | Custom design tokens, responsive components |
| **Backend Runtime** | Bun, Fastify | High-performance I/O, strict schema validation |
| **Validation & Auth** | Zod, `@fastify/jwt` | Type-safe request parsing, stateless JWT bearer security |
| **Database & ORM** | PostgreSQL, Prisma | Relational constraints, atomic transactions, row locking |
| **Containerization** | Docker, Docker Compose | Single-command database bootstrapping |

---

## ⚡ Concurrency & Payment Design

Payment requests execute within an isolated database transaction to eliminate race conditions:

```text
Client                   Fastify Endpoint                 PostgreSQL
  │                             │                             │
  │── POST /api/payments ──────>│                             │
  │                             │── BEGIN TRANSACTION ───────>│
  │                             │── SELECT FOR UPDATE ────────>│ (Lock Order Row)
  │                             │   Recalculate Paid Amount   │
  │                             │   Validate (Payment <= Rem) │
  │                             │── INSERT Payment Record ───>│
  │                             │── UPDATE Order Status ─────>│
  │                             │── COMMIT ──────────────────>│ (Release Lock)
  │<── 201 Created ─────────────│                             │
```

---

## 📋 API Overview

Detailed API payloads, headers, and error contracts are documented in [`docs/api.md`](./docs/api.md).

### Endpoint Summary

| Category | Method | Endpoint | Description |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | User registration |
| | `POST` | `/api/auth/login` | User login & JWT issuance |
| | `GET` | `/api/auth/me` | Authenticated session profile |
| **Orders** | `POST` | `/api/orders` | Create order with line items |
| | `GET` | `/api/orders` | List user orders (supports pagination & status filter) |
| | `GET` | `/api/orders/:id` | Get order detail with payment history |
| | `PATCH` | `/api/orders/:id` | Update unpaid order |
| | `DELETE` | `/api/orders/:id` | Delete unpaid order |
| **Payments** | `GET` | `/api/payments/calculate/:orderId` | Informational balance calculation |
| | `POST` | `/api/payments` | Atomic payment settlement |

---

## 🚀 Quickstart & Setup

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Docker & Docker Compose](https://www.docker.com/)

### 1. Database Setup

```bash
docker compose up -d
```

### 2. Backend Setup

```bash
cd server
bun install

# Configure environment
cp .env.example .env # Set DATABASE_URL and JWT_SECRET

# Run migrations and start server
bun run generate
bun run migrate
bun run dev
```

### 3. Frontend Setup

```bash
cd client
bun install
bun run dev
```

---

## 🧪 Testing & Verification

The backend includes a focused test suite built with **Bun Test** that validates core business invariants, user isolation, state machine transitions, and database concurrency guarantees. Detailed test architecture and test case breakdowns are available in [docs/testing.md](./docs/testing.md):

```bash
cd server
bun test
```

### Highlights:
- **Unit Tests (`server/tests/unit/`)**: Validates pure business logic, UTC date boundaries, and order status precedence (`PAID` $\rightarrow$ `OVERDUE` $\rightarrow$ `PARTIALLY_PAID` $\rightarrow$ `PENDING`).
- **Integration Tests (`server/tests/integration/`)**: Runs directly against PostgreSQL to verify JWT authentication, multi-tenant isolation, order immutability after payment, and overpayment prevention.
- **🔥 Concurrency Guarantee Test (`payments.test.ts`)**: Executes simultaneous payment requests (`Promise.all`) against the same order. Confirms that PostgreSQL `FOR UPDATE` row-level locks prevent race-condition overpayments under heavy concurrent traffic.

---

## 📚 Technical Documentation

| Document | Purpose |
| :--- | :--- |
| **[Requirements & Tradeoffs](./docs/requirements.md)** | Functional specifications, scope boundaries, and architectural trade-offs |
| **[API Specification](./docs/api.md)** | Endpoint documentation, request schemas, error response formats |
| **[Data Model Specification](./docs/data-model.md)** | Database schemas, relations, indexes, and minor-unit rules |
| **[Edge Cases & Failure Scenarios](./docs/edge-cases.md)** | Edge case matrix, concurrency guarantees, and state machine transitions |
| **[Test & Concurrency Specification](./docs/testing.md)** | Unit & integration test architecture, coverage inventory, and race condition tests |

---

## 📌 Scope & Future Enhancements

### Out of Scope (Current Release)
- Multi-currency / exchange rates
- Idempotency key headers (`X-Idempotency-Key`)
- Refresh token rotation & session revocation
- Webhooks & asynchronous event messaging

### Production Roadmap
- Redis-backed distributed rate limiting & session caching
- Background cron for automated batch reconciliation
- Stripe/PayPal payment gateway integration
