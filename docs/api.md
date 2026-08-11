# Order & Settlements API Documentation

Welcome to the **Order & Settlements API** documentation. This document provides technical specifications, endpoint descriptions, request/response schemas, validation rules, and integration examples for the backend service.

> 💡 **Data Models & Database Schema**: For detailed Entity-Relationship (ER) diagrams, database tables, and entity definitions, please refer to [docs/data-model.md](file:///home/neautrino/Code/projects/order-and-settlements/docs/data-model.md).

---

## 📋 Table of Contents
- [Architecture & Overview](#-architecture--overview)
- [Authentication](#-authentication)
- [Rate Limiting](#-rate-limiting)
- [Error Handling](#-error-handling)
- [API Endpoints](#-api-endpoints)
  - [Authentication API (`/api/auth`)](#1-authentication-api-apiauth)
    - [`POST /api/auth/register`](#post-apiauthregister)
    - [`POST /api/auth/login`](#post-apiauthlogin)
    - [`GET /api/auth/me`](#get-apiauthme)
  - [Order Management API (`/api/orders`)](#2-order-management-api-apiorders)
    - [`POST /api/orders`](#post-apiorders)
    - [`GET /api/orders`](#get-apiorders)
    - [`GET /api/orders/:id`](#get-apiordersid)
    - [`PATCH /api/orders/:id`](#patch-apiordersid)
    - [`DELETE /api/orders/:id`](#delete-apiordersid)
  - [Payments & Settlements API (`/api/payments`)](#3-payments--settlements-api-apipayments)
    - [`GET /api/payments/calculate/:orderId`](#get-apipaymentscalculateorderid)
    - [`POST /api/payments`](#post-apipayments)
- [Business Rules & Validation Constraints](#-business-rules--validation-constraints)

---

## 🏗 Architecture & Overview

- **Base URL**: `http://localhost:3000`
- **Data Format**: `application/json`
- **Monetary Values**: Stored and returned as **Integers** representing minor currency units (**cents** in USD; `1000` = $10.00) to prevent floating-point inaccuracies.
- **Timestamps**: Standard ISO 8601 formatted strings in UTC (e.g., `2026-08-15T00:00:00.000Z`).
- **Data Schema Reference**: See [docs/data-model.md](file:///home/neautrino/Code/projects/order-and-settlements/docs/data-model.md) for full ER diagrams and table structures.

---

## 🔑 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication.

- Protected endpoints require an HTTP `Authorization` header with a Bearer token:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
- **Token Expiry**: `24 hours`
- **User-Level Data Isolation**: User ownership is strictly enforced across all order and payment resources. Users cannot view, edit, or delete data belonging to other accounts.

---

## ⏱ Rate Limiting

The API implements dynamic rate limiting using `@fastify/rate-limit` to prevent brute force attacks, resource abuse, and service degradation.

### Limit Tracking Strategies
- **Authenticated Requests**: Rate limits are keyed by **User ID** (`user:<userId>`). Each user receives an independent request quota regardless of their IP or network setup.
- **Unauthenticated Requests**: Rate limits are keyed by **IP Address** (`ip:<clientIp>`).

### Endpoint Limit Summary

| Category | Endpoint(s) | Limit | Window | Keying Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `POST /api/auth/login`, `POST /api/auth/register` | `5` | 15 minutes | IP Address |
| **Payment Processing** | `POST /api/payments` | `10` | 1 minute | User ID |
| **Order Mutations** | `POST /api/orders`, `PATCH /api/orders/:id`, `DELETE /api/orders/:id` | `30` | 1 minute | User ID |
| **Read Queries** | `GET /api/orders`, `GET /api/orders/:id`, `GET /api/payments/calculate/:orderId` | `60` | 1 minute | User ID |
| **Global Fallback** | All API routes | `500` | 15 minutes | User ID / IP Address |

### Rate Limit Response Headers
Every response includes headers detailing the current rate limit status:
- `x-ratelimit-limit`: Maximum number of requests allowed in the current window.
- `x-ratelimit-remaining`: Remaining request quota in the current window.
- `x-ratelimit-reset`: Unix timestamp (in seconds) when the limit resets.

### Exceeded Quota Response (`429 Too Many Requests`)
When request limits are exceeded, the API responds with HTTP Status `429`:
```json
{
  "success": false,
  "message": "Rate limit exceeded. Try again in 15 minutes",
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "details": {
      "expiresIn": 900
    }
  }
}
```

---

## ⚠️ Error Handling

The API returns standard HTTP status codes along with descriptive, unified JSON error payloads:

```json
{
  "success": false,
  "message": "Detailed description of the error",
  "error": {
    "code": "ERROR_CODE_NAME",
    "details": null
  }
}
```

| HTTP Status Code | Description | Typical Cause |
| :--- | :--- | :--- |
| **`200 OK`** | Request succeeded | Successful GET, PATCH, or DELETE operation |
| **`201 Created`** | Resource created | Successful registration, order creation, or payment submission |
| **`400 Bad Request`** | Validation failure or business logic violation | Invalid body, past due date, attempting overpayment, updating order with payments |
| **`401 Unauthorized`** | Authentication missing or invalid | Missing/expired JWT token or invalid login credentials |
| **`404 Not Found`** | Resource not found | Requesting an order that does not exist or does not belong to the user |
| **`429 Too Many Requests`** | Rate limit exceeded | Sending too many requests within a specified time window |
| **`500 Internal Server Error`** | Unhandled server error | Internal server crash or unhandled database issue |

---

## 🚀 API Endpoints

### 1. Authentication API (`/api/auth`)

#### `POST /api/auth/register`
Creates a new user account and generates an initial JWT authentication token.

- **Authentication**: None
- **Headers**: `Content-Type: application/json`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Validation Constraints**:
- `email`: Valid email format (required)
- `password`: String, minimum 6 characters (required)

**Response `201 Created`**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "b3c9f28a-7a54-4a2e-9d21-4f27110e53a2",
      "email": "user@example.com",
      "createdAt": "2026-08-11T08:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response `400 Bad Request`**:
```json
{
  "success": false,
  "message": "User already exists with this email",
  "error": {
    "code": "USER_ALREADY_EXISTS"
  }
}
```

---

#### `POST /api/auth/login`
Authenticates existing user credentials and returns a JWT access token.

- **Authentication**: None
- **Headers**: `Content-Type: application/json`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "b3c9f28a-7a54-4a2e-9d21-4f27110e53a2",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response `401 Unauthorized`**:
```json
{
  "success": false,
  "message": "Invalid email or password",
  "error": {
    "code": "INVALID_CREDENTIALS"
  }
}
```

---

#### `GET /api/auth/me`
Retrieves the profile of the currently authenticated user.

- **Authentication**: Required (`Authorization: Bearer <token>`)

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "user": {
      "id": "b3c9f28a-7a54-4a2e-9d21-4f27110e53a2",
      "email": "user@example.com"
    }
  }
}
```

---

### 2. Order Management API (`/api/orders`)

#### `POST /api/orders`
Creates a new order with line items. Total amount is calculated automatically on the server.

- **Authentication**: Required (`Authorization: Bearer <token>`)
- **Headers**: `Content-Type: application/json`

**Request Body**:
```json
{
  "customerName": "Acme Corporation",
  "dueDate": "2026-08-25T00:00:00.000Z",
  "items": [
    {
      "itemName": "Web Design Services",
      "quantity": 1,
      "unitPrice": 1500000
    },
    {
      "itemName": "Cloud Hosting Setup",
      "quantity": 2,
      "unitPrice": 250000
    }
  ]
}
```

**Validation Constraints**:
- `customerName`: String, non-empty (required)
- `dueDate`: ISO date string, **must be strictly in the future** (after current date)
- `items`: Array with at least 1 item
  - `itemName`: String, non-empty
  - `quantity`: Positive integer (>= 1)
  - `unitPrice`: Positive integer in lowest currency units (> 0)

**Response `201 Created`**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "a10f63b2-65f1-4770-87a3-e4d9b9c02011",
    "customerName": "Acme Corporation",
    "status": "PENDING",
    "totalAmount": 2000000,
    "dueDate": "2026-08-25T00:00:00.000Z",
    "createdAt": "2026-08-11T08:15:00.000Z"
  }
}
```

---

#### `GET /api/orders`
Fetches a paginated list of orders belonging to the authenticated user. Computes real-time status, total paid, and remaining balance dynamically.

- **Authentication**: Required (`Authorization: Bearer <token>`)
- **Query Parameters**:

| Parameter | Type | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | integer | `1` | `min: 1` | Page number for pagination |
| `limit` | integer | `10` | `min: 1, max: 100` | Number of items per page |

**Example Request**:
```http
GET /api/orders?page=1&limit=10 HTTP/1.1
Authorization: Bearer <token>
```

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": [
    {
      "id": "a10f63b2-65f1-4770-87a3-e4d9b9c02011",
      "customerName": "Acme Corporation",
      "status": "PARTIALLY_PAID",
      "totalAmount": 2000000,
      "totalPaid": 500000,
      "remainingAmount": 1500000,
      "dueDate": "2026-08-25T00:00:00.000Z",
      "items": [
        {
          "id": "c7112093-41e9-4e76-8ff4-93e1b12390af",
          "orderId": "a10f63b2-65f1-4770-87a3-e4d9b9c02011",
          "itemName": "Web Design Services",
          "quantity": 1,
          "unitPrice": 1500000,
          "createdAt": "2026-08-11T08:15:00.000Z",
          "updatedAt": "2026-08-11T08:15:00.000Z"
        }
      ],
      "payments": [
        {
          "id": "e92a40b1-1234-4567-89ab-cdef01234567",
          "amount": 500000,
          "note": "Advance payment",
          "paymentDate": "2026-08-11T08:30:00.000Z"
        }
      ],
      "createdAt": "2026-08-11T08:15:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalOrders": 1,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

#### `GET /api/orders/:id`
Retrieves detailed information for a specific order.

- **Authentication**: Required (`Authorization: Bearer <token>`)
- **Path Parameters**:
  - `id`: UUID (Order ID)

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Order fetched successfully",
  "data": {
    "id": "a10f63b2-65f1-4770-87a3-e4d9b9c02011",
    "customerName": "Acme Corporation",
    "status": "PARTIALLY_PAID",
    "totalAmount": 2000000,
    "totalPaid": 500000,
    "remainingAmount": 1500000,
    "dueDate": "2026-08-25T00:00:00.000Z",
    "items": [ ... ],
    "payments": [ ... ],
    "createdAt": "2026-08-11T08:15:00.000Z",
    "updatedAt": "2026-08-11T08:30:00.000Z"
  }
}
```

**Response `404 Not Found`**:
```json
{
  "success": false,
  "message": "Order not found",
  "error": {
    "code": "ORDER_NOT_FOUND"
  }
}
```

---

#### `PATCH /api/orders/:id`
Updates an existing order's customer name, due date, or line items.

> ⚠️ **Restriction**: An order **cannot** be updated if payments have already been recorded against it.

- **Authentication**: Required (`Authorization: Bearer <token>`)
- **Path Parameters**: `id` (UUID)
- **Headers**: `Content-Type: application/json`

**Request Body (Partial update allowed)**:
```json
{
  "customerName": "Acme Holdings Ltd",
  "dueDate": "2026-08-30T00:00:00.000Z"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "id": "a10f63b2-65f1-4770-87a3-e4d9b9c02011",
    "customerName": "Acme Holdings Ltd",
    "status": "PENDING",
    "totalAmount": 2000000,
    "dueDate": "2026-08-30T00:00:00.000Z",
    "items": [ ... ],
    "updatedAt": "2026-08-11T09:00:00.000Z"
  }
}
```

**Response `400 Bad Request`**:
```json
{
  "success": false,
  "message": "Cannot update an order that has payments recorded against it",
  "error": {
    "code": "ORDER_HAS_PAYMENTS"
  }
}
```

---

#### `DELETE /api/orders/:id`
Deletes an existing order and its associated line items.

> ⚠️ **Restriction**: An order **cannot** be deleted if payments have already been recorded against it.

- **Authentication**: Required (`Authorization: Bearer <token>`)
- **Path Parameters**: `id` (UUID)

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

**Response `400 Bad Request`**:
```json
{
  "success": false,
  "message": "Cannot delete an order that has payments recorded against it",
  "error": {
    "code": "ORDER_HAS_PAYMENTS"
  }
}
```

**Response `404 Not Found`**:
```json
{
  "success": false,
  "message": "Order not found",
  "error": {
    "code": "ORDER_NOT_FOUND"
  }
}
```

---

### 3. Payments & Settlements API (`/api/payments`)

#### `GET /api/payments/calculate/:orderId`
Calculates real-time financial balance metrics and status for an order prior to payment submission.

- **Authentication**: Required (`Authorization: Bearer <token>`)
- **Path Parameters**:
  - `orderId`: UUID (Order ID)

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Order balance calculated successfully",
  "data": {
    "orderId": "a10f63b2-65f1-4770-87a3-e4d9b9c02011",
    "status": "PARTIALLY_PAID",
    "totalAmount": 2000000,
    "totalPaid": 500000,
    "remainingAmount": 1500000
  }
}
```

**Response `404 Not Found`**:
```json
{
  "success": false,
  "message": "Order not found",
  "error": {
    "code": "ORDER_NOT_FOUND"
  }
}
```

---

#### `POST /api/payments`
Records a payment (partial or full) against an open order.

- **Authentication**: Required (`Authorization: Bearer <token>`)
- **Headers**: `Content-Type: application/json`

**Request Body**:
```json
{
  "orderId": "a10f63b2-65f1-4770-87a3-e4d9b9c02011",
  "amount": 1500000,
  "note": "Final settlement via wire transfer"
}
```

**Validation & Rules**:
- `orderId`: UUID format (required)
- `amount`: Positive integer in lowest currency units (required)
- `note`: String, optional
- Cannot submit payment for an order with status `PAID`.
- Payment amount cannot exceed the `remainingAmount` due on the order.

**Response `201 Created`**:
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "orderStatus": "PAID",
    "payment": {
      "id": "f83b1022-7711-4b2a-a92d-9876543210fe",
      "orderId": "a10f63b2-65f1-4770-87a3-e4d9b9c02011",
      "amount": 1500000,
      "note": "Final settlement via wire transfer",
      "paymentDate": "2026-08-11T09:15:00.000Z"
    }
  }
}
```

**Response `400 Bad Request` (Order fully paid)**:
```json
{
  "success": false,
  "message": "Order is already fully paid",
  "error": {
    "code": "ORDER_ALREADY_PAID"
  }
}
```

**Response `400 Bad Request` (Overpayment attempt)**:
```json
{
  "success": false,
  "message": "Payment amount (2000000) exceeds remaining balance (1500000)",
  "error": {
    "code": "PAYMENT_EXCEEDS_BALANCE"
  }
}
```

---

## 🔒 Business Rules & Validation Constraints

1. **Due Date Validation**:
   - Order creation and updates strictly require `dueDate` to be a future calendar date (`YYYY-MM-DD`).
   - Time of day is ignored to prevent timezone boundary bugs.

2. **Status Persistence & Reconciliation**:
   - Stored status is maintained as a persisted database state, while the API reconciles time-dependent status such as `OVERDUE` when evaluating an order:
     - `PAID`: `totalPaid >= totalAmount`
     - `OVERDUE`: `totalPaid < totalAmount` AND `currentDate > dueDate`
     - `PARTIALLY_PAID`: `0 < totalPaid < totalAmount` AND `currentDate <= dueDate`
     - `PENDING`: `totalPaid == 0` AND `currentDate <= dueDate`

3. **Immutability Protection & Deletion Rules**:
   - Orders with recorded payments (`totalPaid > 0`) cannot be edited (`PATCH`) or deleted (`DELETE`).
   - Only unpaid orders (`totalPaid == 0`) can be modified or deleted along with their attached line items.

4. **Payment Timestamps & Overpayment Prevention**:
   - `paymentDate` is generated server-side at execution time; client overrides are ignored.
   - Payment creation executes within a database transaction utilizing **pessimistic row locking** (`SELECT ... FOR UPDATE`) to serialize concurrent payments and prevent overpayment race conditions.
