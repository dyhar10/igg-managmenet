# IGG Management — Backend API Documentation

Base URL (development): `http://localhost:4000`

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

JWT signed with HS256. Tokens expire based on server configuration.

---

## Standard Response Envelope

```json
{
  "message": "Human-readable status",
  "data": {}
}
```

### Error Format

```json
{ "message": "Descriptive error" }
```

| Code | Meaning               |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 404  | Not Found             |
| 409  | Conflict              |
| 500  | Internal Server Error |

---

## 🖥️ System Group

### `GET /api/health`

**Response 200:**

```json
{ "status": "ok", "timestamp": "2026-03-27T02:00:00.000Z" }
```

---

## 🔐 Auth Group

### `POST /api/auth/register`

**Request:**

```json
{
  "email": "admin@igg.id",
  "password": "secret123",
  "fullName": "Randy Hardianto",
  "roles": ["admin"]
}
```

| Field    | Type     | Required | Notes                    |
| -------- | -------- | -------- | ------------------------ |
| email    | string   | ✅       | Valid email              |
| password | string   | ✅       | Min 6 characters         |
| fullName | string   | ✅       |                          |
| roles    | string[] | —        | Defaults to `["member"]` |

**Response 201:**

```json
{
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-...",
      "email": "admin@igg.id",
      "fullName": "Randy Hardianto",
      "roles": ["admin"],
      "createdAt": "2026-03-27T02:00:00.000Z",
      "updatedAt": "2026-03-27T02:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**

```json
{ "message": "Email harus valid" }           // 400
{ "message": "Password minimal 6 karakter" } // 400
{ "message": "Email sudah terdaftar" }       // 409
```

---

### `POST /api/auth/login`

**Request:**

```json
{ "email": "admin@igg.id", "password": "secret123" }
```

**Response 200:**

```json
{
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-...",
      "email": "admin@igg.id",
      "fullName": "Randy Hardianto",
      "roles": ["admin"],
      "createdAt": "2026-03-27T02:00:00.000Z",
      "updatedAt": "2026-03-27T02:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error 401:**

```json
{ "message": "Email atau password tidak valid" }
```

---

### `POST /api/auth/reset-password`

**Request:**

```json
{ "email": "admin@igg.id", "newPassword": "newsecret456" }
```

**Response 200:**

```json
{
  "message": "Password berhasil diperbarui",
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-...",
      "email": "admin@igg.id",
      "fullName": "Randy Hardianto",
      "roles": ["admin"],
      "createdAt": "2026-03-27T02:00:00.000Z",
      "updatedAt": "2026-03-27T02:10:00.000Z"
    }
  }
}
```

**Error 404:**

```json
{ "message": "Pengguna tidak ditemukan" }
```

---

## 👥 Users Group

> Requires Bearer token.

### `GET /api/users`

**Response 200:**

```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-...",
      "email": "admin@igg.id",
      "fullName": "Randy Hardianto",
      "roles": ["admin"],
      "createdAt": "2026-03-27T02:00:00.000Z",
      "updatedAt": "2026-03-27T02:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/roles`

Returns all unique roles across users. Defaults to `["admin","manager","finance","member"]` if no users exist.

**Response 200:**

```json
{ "data": ["admin", "manager", "finance", "member"] }
```

---

### `PATCH /api/users/roles`

**Request:**

```json
{ "userId": "a1b2c3d4-e5f6-...", "roles": ["admin", "finance"] }
```

**Response 200:**

```json
{
  "message": "Roles pengguna diperbarui",
  "data": {
    "id": "a1b2c3d4-e5f6-...",
    "email": "admin@igg.id",
    "fullName": "Randy Hardianto",
    "roles": ["admin", "finance"],
    "createdAt": "2026-03-27T02:00:00.000Z",
    "updatedAt": "2026-03-27T02:05:00.000Z"
  }
}
```

**Error 400:**

```json
{ "message": "userId wajib diisi" }
```

---

## 🏠 Houses Group

> Requires Bearer token.

### `GET /api/houses`

**Response 200:**

```json
{
  "message": "Daftar rumah berhasil diambil",
  "data": [
    {
      "id": "b2c3d4e5-...",
      "code": "A-01",
      "ownerName": "Budi Santoso",
      "address": "Jl. Mawar No. 1",
      "createdAt": "2026-03-27T02:00:00.000Z",
      "updatedAt": "2026-03-27T02:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/houses`

**Request:**

```json
{ "code": "a-01", "ownerName": "Budi Santoso", "address": "Jl. Mawar No. 1" }
```

| Field     | Type   | Required | Notes                           |
| --------- | ------ | -------- | ------------------------------- |
| code      | string | ✅       | Auto-uppercased, must be unique |
| ownerName | string | —        |                                 |
| address   | string | —        |                                 |

**Response 201:**

```json
{
  "message": "Rumah berhasil ditambahkan",
  "data": {
    "id": "b2c3d4e5-...",
    "code": "A-01",
    "ownerName": "Budi Santoso",
    "address": "Jl. Mawar No. 1",
    "createdAt": "2026-03-27T02:00:00.000Z",
    "updatedAt": "2026-03-27T02:00:00.000Z"
  }
}
```

**Errors:**

```json
{ "message": "Kode rumah wajib diisi" }    // 400
{ "message": "Kode rumah sudah terdaftar" } // 409
```

---

### `PUT /api/houses/:id`

All body fields are optional (only provided fields are updated).

**Request:**

```json
{ "code": "A-02", "ownerName": "Siti Rahma", "address": "Jl. Melati No. 2" }
```

**Response 200:**

```json
{
  "message": "Rumah berhasil diperbarui",
  "data": {
    "id": "b2c3d4e5-...",
    "code": "A-02",
    "ownerName": "Siti Rahma",
    "address": "Jl. Melati No. 2",
    "createdAt": "2026-03-27T02:00:00.000Z",
    "updatedAt": "2026-03-27T02:10:00.000Z"
  }
}
```

**Errors:**

```json
{ "message": "Rumah tidak ditemukan" }      // 404
{ "message": "Kode rumah sudah terdaftar" } // 409
```

---

### `DELETE /api/houses/:id`

Deletes house and all related transactions and fees (cascade).

**Response 200:**

```json
{ "message": "Rumah berhasil dihapus" }
```

**Error 404:**

```json
{ "message": "Rumah tidak ditemukan" }
```

---

## 💵 Cash Management Group

> Requires Bearer token.

### `GET /api/cash-transactions`

**Query Parameters:**

| Param           | Type                  | Description     |
| --------------- | --------------------- | --------------- |
| houseId         | UUID                  | Filter by house |
| transactionType | `INCOME` \| `EXPENSE` | Filter by type  |
| startDate       | `YYYY-MM-DD`          | Inclusive start |
| endDate         | `YYYY-MM-DD`          | Inclusive end   |

**Response 200:**

```json
{
  "message": "Daftar transaksi kas berhasil diambil",
  "data": [
    {
      "id": "c3d4e5f6-...",
      "houseId": "b2c3d4e5-...",
      "house": {
        "id": "b2c3d4e5-...",
        "code": "A-01",
        "ownerName": "Budi Santoso",
        "address": "Jl. Mawar No. 1"
      },
      "transactionType": "INCOME",
      "paymentMethod": "TRANSFER",
      "category": "Iuran Bulanan",
      "amount": 250000,
      "description": "Iuran Maret 2026",
      "transactionDate": "2026-03-01T00:00:00.000Z",
      "createdAt": "2026-03-27T02:00:00.000Z",
      "updatedAt": "2026-03-27T02:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/cash-transactions`

**Request:**

```json
{
  "houseId": "b2c3d4e5-...",
  "transactionType": "INCOME",
  "paymentMethod": "TRANSFER",
  "category": "Iuran Bulanan",
  "amount": 250000,
  "transactionDate": "2026-03-01",
  "description": "Iuran Maret 2026"
}
```

| Field           | Type   | Required | Notes                          |
| --------------- | ------ | -------- | ------------------------------ |
| houseId         | UUID   | ✅       | Must exist                     |
| transactionType | string | ✅       | `INCOME` or `EXPENSE`          |
| paymentMethod   | string | ✅       | `CASH`, `TRANSFER`, or `OTHER` |
| category        | string | ✅       |                                |
| amount          | number | ✅       | Must be > 0                    |
| transactionDate | string | ✅       | `YYYY-MM-DD`                   |
| description     | string | —        |                                |

**Response 201:**

```json
{
  "message": "Transaksi kas berhasil dicatat",
  "data": {
    "id": "c3d4e5f6-...",
    "houseId": "b2c3d4e5-...",
    "house": {
      "id": "b2c3d4e5-...",
      "code": "A-01",
      "ownerName": "Budi Santoso",
      "address": null
    },
    "transactionType": "INCOME",
    "paymentMethod": "TRANSFER",
    "category": "Iuran Bulanan",
    "amount": 250000,
    "description": "Iuran Maret 2026",
    "transactionDate": "2026-03-01T00:00:00.000Z",
    "createdAt": "2026-03-27T02:00:00.000Z",
    "updatedAt": "2026-03-27T02:00:00.000Z"
  }
}
```

**Errors:**

```json
{ "message": "transactionType tidak valid" }   // 400
{ "message": "paymentMethod tidak valid" }      // 400
{ "message": "amount harus bernilai positif" }  // 400
{ "message": "Rumah tidak ditemukan" }          // 404
```

---

### `GET /api/cash-dashboard`

**Query Parameters:**

| Param   | Type | Description               |
| ------- | ---- | ------------------------- |
| houseId | UUID | Optional, filter by house |

**Response 200:**

```json
{
  "message": "Ringkasan kas berhasil diambil",
  "data": {
    "weekly": { "income": 500000, "expense": 100000, "balance": 400000 },
    "monthly": { "income": 2500000, "expense": 300000, "balance": 2200000 },
    "yearly": { "income": 15000000, "expense": 2000000, "balance": 13000000 },
    "overall": { "income": 30000000, "expense": 5000000, "balance": 25000000 }
  }
}
```

---

## 📅 Monthly Fees Group (Iuran Bulanan)

> Requires Bearer token.

### `POST /api/fees/generate`

Generates fee records for all (or selected) houses. Safe to re-run — uses upsert (existing records are only updated, not duplicated).

**Request:**

```json
{
  "year": 2026,
  "month": 3,
  "amount": 250000,
  "houseIds": ["b2c3d4e5-..."]
}
```

| Field    | Type    | Required | Notes                     |
| -------- | ------- | -------- | ------------------------- |
| year     | integer | ✅       | 2000–2100                 |
| month    | integer | ✅       | 1–12                      |
| amount   | number  | ✅       | Must be > 0               |
| houseIds | UUID[]  | —        | Omit to target all houses |

**Response 201:**

```json
{
  "message": "Iuran berhasil digenerate",
  "data": [
    {
      "id": "d4e5f6a7-...",
      "houseId": "b2c3d4e5-...",
      "house": {
        "id": "b2c3d4e5-...",
        "code": "A-01",
        "ownerName": "Budi Santoso"
      },
      "year": 2026,
      "month": 3,
      "amount": 250000,
      "status": "UNPAID",
      "paidAt": null,
      "notes": null,
      "createdAt": "2026-03-27T02:00:00.000Z",
      "updatedAt": "2026-03-27T02:00:00.000Z"
    }
  ]
}
```

**Errors:**

```json
{ "message": "year tidak valid" }              // 400
{ "message": "month harus antara 1 dan 12" }   // 400
{ "message": "amount harus bernilai positif" }  // 400
```

---

### `GET /api/fees`

**Query Parameters:**

| Param   | Type    | Description                   |
| ------- | ------- | ----------------------------- |
| year    | integer |                               |
| month   | integer | 1–12                          |
| houseId | UUID    |                               |
| status  | string  | `UNPAID`, `PAID`, or `WAIVED` |

**Response 200:**

```json
{
  "message": "Daftar iuran berhasil diambil",
  "data": {
    "fees": [
      {
        "id": "d4e5f6a7-...",
        "houseId": "b2c3d4e5-...",
        "house": {
          "id": "b2c3d4e5-...",
          "code": "A-01",
          "ownerName": "Budi Santoso"
        },
        "year": 2026,
        "month": 3,
        "amount": 250000,
        "status": "PAID",
        "paidAt": "2026-03-05T08:30:00.000Z",
        "notes": null,
        "createdAt": "2026-03-01T00:00:00.000Z",
        "updatedAt": "2026-03-05T08:30:00.000Z"
      }
    ],
    "summary": {
      "total": 20,
      "PAID": 15,
      "UNPAID": 4,
      "WAIVED": 1,
      "totalCollected": 3750000
    }
  }
}
```

---

### `PATCH /api/fees/:id`

Update fee status. Setting `PAID` auto-sets `paidAt`. Setting `UNPAID` clears `paidAt`.

**Request:**

```json
{ "status": "PAID", "notes": "Bayar tunai via pak RT" }
```

| Field  | Type   | Required | Notes                         |
| ------ | ------ | -------- | ----------------------------- |
| status | string | ✅       | `UNPAID`, `PAID`, or `WAIVED` |
| notes  | string | —        |                               |

**Response 200:**

```json
{
  "message": "Status iuran berhasil diperbarui",
  "data": {
    "id": "d4e5f6a7-...",
    "houseId": "b2c3d4e5-...",
    "house": {
      "id": "b2c3d4e5-...",
      "code": "A-01",
      "ownerName": "Budi Santoso"
    },
    "year": 2026,
    "month": 3,
    "amount": 250000,
    "status": "PAID",
    "paidAt": "2026-03-27T02:15:00.000Z",
    "notes": "Bayar tunai via pak RT",
    "createdAt": "2026-03-01T00:00:00.000Z",
    "updatedAt": "2026-03-27T02:15:00.000Z"
  }
}
```

**Errors:**

```json
{ "message": "status tidak valid. Gunakan PAID, UNPAID, atau WAIVED" } // 400
{ "message": "Iuran tidak ditemukan" }                                  // 404
```

---

### `GET /api/fees/map`

Returns all houses with their fee for the selected month — used by the house map UI.

**Query Parameters:**

| Param | Type    | Required |
| ----- | ------- | -------- |
| year  | integer | ✅       |
| month | integer | ✅       |

**Response 200:**

```json
{
  "message": "Data peta rumah berhasil diambil",
  "data": [
    {
      "id": "b2c3d4e5-...",
      "code": "A-01",
      "ownerName": "Budi Santoso",
      "address": "Jl. Mawar No. 1",
      "fee": {
        "id": "d4e5f6a7-...",
        "amount": 250000,
        "status": "PAID",
        "paidAt": "2026-03-05T08:30:00.000Z"
      }
    },
    {
      "id": "b2c3d4e6-...",
      "code": "A-02",
      "ownerName": "Siti Rahma",
      "address": null,
      "fee": null
    }
  ]
}
```

> `fee: null` means no fee has been generated for that house in the selected period.

---

## Data Models

### User

| Field     | Type            |
| --------- | --------------- |
| id        | UUID            |
| email     | string (unique) |
| fullName  | string          |
| roles     | string[]        |
| createdAt | ISO 8601        |
| updatedAt | ISO 8601        |

### House

| Field     | Type                       |
| --------- | -------------------------- |
| id        | UUID                       |
| code      | string (unique, uppercase) |
| ownerName | string \| null             |
| address   | string \| null             |
| createdAt | ISO 8601                   |
| updatedAt | ISO 8601                   |

### CashTransaction

| Field           | Type                            |
| --------------- | ------------------------------- |
| id              | UUID                            |
| houseId         | UUID → House                    |
| transactionType | `INCOME` \| `EXPENSE`           |
| paymentMethod   | `CASH` \| `TRANSFER` \| `OTHER` |
| category        | string                          |
| amount          | decimal                         |
| description     | string \| null                  |
| transactionDate | ISO 8601                        |
| createdAt       | ISO 8601                        |
| updatedAt       | ISO 8601                        |

### MonthlyFee

| Field     | Type                           | Notes                       |
| --------- | ------------------------------ | --------------------------- |
| id        | UUID                           |                             |
| houseId   | UUID → House                   |                             |
| year      | integer                        |                             |
| month     | integer                        | 1–12                        |
| amount    | decimal                        |                             |
| status    | `UNPAID` \| `PAID` \| `WAIVED` |                             |
| paidAt    | ISO 8601 \| null               | Auto-set when status = PAID |
| notes     | string \| null                 |                             |
| createdAt | ISO 8601                       |                             |
| updatedAt | ISO 8601                       |                             |

> Unique constraint: `(houseId, year, month)`
