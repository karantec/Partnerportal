# Partner Portal API Reference

Base URL (local default): `http://localhost:3000`  
Content type: `application/json` for request bodies unless noted.

---

## Table of contents

1. [Authentication](#authentication)
2. [Health & utilities](#health--utilities)
3. [Auth](#auth)
4. [Users](#users)
5. [Items (vendor)](#items-vendor)
6. [Contacts](#contacts)
7. [Purchase orders](#purchase-orders)
8. [Sales orders](#sales-orders)
9. [Invoices](#invoices)
10. [Purchase invoices](#purchase-invoices)
11. [Purchase receipts](#purchase-receipts)
12. [Partner location links](#partner-location-links)

> **Request payloads:** Each resource section includes **example JSON bodies** (create, update, and patch) aligned with `models/*.model.js` and `PartnerPortal.postman_collection.json`.

---

## Authentication

### Bearer token (most protected routes)

```
Authorization: Bearer <JWT>
```

Alternatively, the server accepts a JWT in cookie `token`.

### Registration flow

1. `POST /api/auth/get-register-token` — obtain a short-lived registration token.
2. `POST /api/users/register` with header:
   - `x-register-token: <token>`  
   or `Authorization: Bearer <same token>`.

### Roles

Common roles: `customer`, `vendor`, `customer_admin`, `vendor_admin`, `super_admin`.

Each endpoint enforces role access via middleware; see route files under `routes/`.

### Business Central–style create routes

These **`POST …/businesscentral`** endpoints use **`protectRegister`** (not the login JWT). Call **`POST /api/auth/get-register-token`** first, then send the registration token as:

- `x-register-token: <registerToken>`  
  or `Authorization: Bearer <registerToken>`

The **JSON body** is the same as the corresponding **`POST /`** create on that resource (items, purchase orders, sales orders, invoices, purchase invoices, purchase receipts, partner location links).

| Method | Path |
|--------|------|
| `POST` | `/api/vendor/item/businesscentral` |
| `POST` | `/api/purchase-orders/businesscentral` |
| `POST` | `/api/sales-orders/businesscentral` |
| `POST` | `/api/invoices/businesscentral` |
| `POST` | `/api/purchase-invoices/businesscentral` |
| `POST` | `/api/purchase-receipts/businesscentral` |
| `POST` | `/api/partner-location-links/businesscentral` |

---

## Health & utilities

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | No | Plain text health message |
| `GET` | `/api/routes` | No | **Dev only** (`NODE_ENV !== "production"`). JSON list of registered routes |

---

## Auth

Prefix: `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/get-register-token` | No | Returns `registerToken` (15m), used for user registration |
| `POST` | `/login` | No | Login; body: `email`, `password`. Returns JWT + user |
| `POST` | `/create-super-admin` | No | One-time bootstrap; body: `name`, `email`, `password`, `superAdminSecret` (must match `SUPER_ADMIN_SECRET_KEY`) |
| `POST` | `/verify-token` | Bearer | Validates JWT; returns user info |
| `POST` | `/change-password` | Bearer | Body: `oldPassword`, `newPassword` |

### `POST /api/auth/login`

**Body**

```json
{
  "email": "user@example.com",
  "password": "yourPassword"
}
```

### `POST /api/auth/create-super-admin`

**Body**

```json
{
  "name": "Super Admin",
  "email": "admin@example.com",
  "password": "securePassword",
  "superAdminSecret": "<SUPER_ADMIN_SECRET_KEY>"
}
```

### `POST /api/auth/get-register-token`

No request body.

**Example response** (shape)

```json
{
  "success": true,
  "message": "Register token generated. Valid for 60 minutes.",
  "registerToken": "<jwt>",
  "expiresAt": "2026-03-22T12:00:00.000Z"
}
```

### `POST /api/auth/verify-token`

No body required; send `Authorization: Bearer <JWT>`.

### `POST /api/auth/change-password`

**Payload**

```json
{
  "oldPassword": "CurrentPassword@123",
  "newPassword": "NewPassword@456"
}
```

---

## Users

Prefix: `/api/users`

| Method | Path | Auth | Roles / notes |
|--------|------|------|----------------|
| `POST` | `/register` | Register token | `x-register-token` or Bearer registration JWT |
| `GET` | `/` | Bearer | Scoped by caller role (see `Customer.controller`) |
| `GET` | `/me` | Bearer | Current user profile |
| `GET` | `/:id` | Bearer | By ID; access rules by role |
| `PUT` | `/:id` | Bearer | Update user |
| `DELETE` | `/:id` | Bearer | **super_admin** only |

### `POST /api/users/register`

**Headers:** `x-register-token: <token>`

**Body** (required: `role`, `name`, `password`; optional profile fields)

| Field | Type | Notes |
|-------|------|--------|
| `role` | string | `customer`, `vendor`, `customer_admin`, `vendor_admin` (not `super_admin`) |
| `name` | string | Required |
| `password` | string | Required |
| `email` | string | Optional but typical |
| `partnerno` | string | Stored as `ref_no` in DB |
| `customerNo` / `vendorNo` | string | Used for duplicate `ref_no` check |
| `name2`, `address`, `address2`, `city`, `postCode`, `countryRegionCode`, `phoneNo`, `vatRegistrationNo`, `currencyCode`, `paymentTermsCode` | various | Optional profile |

**Example payload — `POST /api/users/register`**

```json
{
  "partnerno": "CUS000001",
  "name": "Test Customer",
  "name2": "Branch 1",
  "address": "Street 1",
  "address2": "Area",
  "city": "Bengaluru",
  "postCode": "560001",
  "countryRegionCode": "IN",
  "phoneNo": "+919999999999",
  "email": "customer@example.com",
  "vatRegistrationNo": "VAT123",
  "currencyCode": "INR",
  "paymentTermsCode": "NET30",
  "password": "Password@123",
  "role": "customer",
  "customerNo": "CUS000001",
  "vendorNo": null
}
```

For a **vendor**, use e.g. `"role": "vendor"`, `"vendorNo": "VNR000001"`, and set `customerNo` to `null` if unused.

### `PUT /api/users/:id`

**Body** (all optional except what you send; `name` required by model update if present)

| Field | Type |
|-------|------|
| `name` | string |
| `name2`, `address`, `address2`, `city`, `postCode`, `countryRegionCode`, `phoneNo`, `email`, `vatRegistrationNo`, `currencyCode`, `paymentTermsCode` | string / null |

**Example payload**

```json
{
  "name": "Updated Name",
  "name2": "Updated Branch",
  "address": "Updated Street",
  "address2": "Updated Area",
  "city": "Mumbai",
  "postCode": "400001",
  "countryRegionCode": "IN",
  "phoneNo": "+919888888888",
  "email": "updated@example.com",
  "vatRegistrationNo": "VAT999",
  "currencyCode": "INR",
  "paymentTermsCode": "NET45"
}
```

---

## Items (vendor)

Prefix: `/api/vendor/item`

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `POST` | `/` | Bearer | `vendor`, `vendor_admin`, `super_admin` |
| `POST` | `/businesscentral` | Register token | Same body as `POST /`; see [Business Central–style create routes](#business-centralstyle-create-routes) |
| `GET` | `/` | Bearer | `vendor`, `vendor_admin`, `super_admin` |
| `GET` | `/partner/:partnerNo` | Bearer | Same roles |
| `GET` | `/:id` | Bearer | Same roles |
| `PUT` | `/:id` | Bearer | Same; only when item `status` is `Created` |
| `PATCH` | `/:id/status` | Bearer | Body: `status`, optional `rejectionReason` if `Rejected` |
| `PATCH` | `/:id/block` | Bearer | Body: `block` (boolean) |
| `DELETE` | `/:id` | Bearer | **super_admin**; only when status `Created` |

### Query (`GET /`)

| Query | Description |
|-------|-------------|
| `status` | Filter by status |
| `partnerNo` | Filter by partner |

### Status values (`PATCH .../status`)

`Created`, `Pending`, `Approved`, `Rejected` — if `Rejected`, `rejectionReason` is required.

### Create / update body (camelCase → DB)

| Field | Type | Notes |
|-------|------|--------|
| `itemName` | string | **Required** on create |
| `batchNo` | string | Optional; must be unique if provided |
| `description`, `itemCategoryCode`, `baseUnitOfMeasure`, `specifications`, `ingredients`, `allergenDeclaration`, `gtin`, `eanCode`, `priceCurrencyCode`, `partnerNo` | string / null | Optional |
| `netWeight`, `grossWeight`, `shelfLifeDays`, `unitPrice` | number / null | Optional |
| `block` | boolean | Default false |
| `status` | string | Default `Created` on create |
| `rejectionReason` | string / null | Optional |

**Example payload — `POST /api/vendor/item` (create)**

```json
{
  "batchNo": "BATCH-1001",
  "itemName": "Organic Rice",
  "description": "Premium grade",
  "itemCategoryCode": "FOOD",
  "baseUnitOfMeasure": "KG",
  "netWeight": 25,
  "grossWeight": 26,
  "specifications": "Long grain",
  "ingredients": "Rice",
  "allergenDeclaration": "None",
  "shelfLifeDays": 365,
  "gtin": "12345678901234",
  "eanCode": "8901234567890",
  "unitPrice": 120.5,
  "priceCurrencyCode": "INR",
  "partnerNo": "VNR000001",
  "block": false,
  "status": "Created",
  "rejectionReason": null
}
```

**Example payload — `PUT /api/vendor/item/:id` (update)**

Same fields as create; only allowed while `status` is `Created`.

**Example payload — `PATCH /api/vendor/item/:id/status`**

Approved:

```json
{
  "status": "Approved",
  "rejectionReason": null
}
```

Rejected (reason required):

```json
{
  "status": "Rejected",
  "rejectionReason": "Does not meet specification"
}
```

**Example payload — `PATCH /api/vendor/item/:id/block`**

```json
{
  "block": false
}
```

---

## Contacts

Prefix: `/api/contact`

| Method | Path | Auth | Roles |
|--------|------|------|--------|
| `POST` | `/` | Bearer | `customer`, `customer_admin`, `vendor`, `vendor_admin`, `super_admin` |
| `GET` | `/` | Bearer | Same |
| `GET` | `/partner/:partnerNo` | Bearer | `customer`, `vendor` |
| `GET` | `/:id` | Bearer | Same as POST list |
| `PUT` | `/:id` | Bearer | Same |
| `PATCH` | `/:id/sync` | Bearer | `syncStatus` body |
| `PATCH` | `/:id/portal` | Bearer | `portalUser`, `portalAdmin` booleans |
| `DELETE` | `/:id` | Bearer | Broad role list (see `contact.routes.js`) |

### Query (`GET /`)

| Query | Description |
|-------|-------------|
| `syncStatus` | Filter |
| `partnerNo` | Filter |
| `companyNo` | Filter |

### Create / update body

| Field | Type | Notes |
|-------|------|--------|
| `contactName` | string | **Required** on create |
| `contactNo` | string | Optional; unique if set |
| `eMail` | string | Maps to `email` column |
| `phoneNo`, `mobilePhoneNo`, `companyNo`, `companyName`, `partnerType`, `partnerNo`, `shipToCode`, `vendorLocationCode`, `locationCode`, `address`, `address2`, `city`, `postCode`, `countryRegionCode`, `jobTitle`, `languageCode` | string / null | Optional |
| `portalUser`, `portalAdmin` | boolean | Default false |
| `syncStatus` | string | Default `Pending`; allowed on patch: `Pending`, `Synced`, `Failed` |
| `lastSyncedDateTime` | string / null | Optional |

**Example payload — `POST /api/contact` (create)**

```json
{
  "contactNo": "CONT0001",
  "contactName": "John Doe",
  "eMail": "john@example.com",
  "phoneNo": "+911234567890",
  "mobilePhoneNo": "+919876543210",
  "companyNo": "COMP0001",
  "companyName": "Nova Soft",
  "portalUser": true,
  "portalAdmin": false,
  "partnerType": "customer",
  "partnerNo": "CUS000001",
  "shipToCode": "SHIP001",
  "vendorLocationCode": "VLOC001",
  "locationCode": "LOC001",
  "address": "Address line 1",
  "address2": "Address line 2",
  "city": "Bengaluru",
  "postCode": "560001",
  "countryRegionCode": "IN",
  "jobTitle": "Manager",
  "languageCode": "EN",
  "syncStatus": "Pending",
  "lastSyncedDateTime": null
}
```

**Example payload — `PUT /api/contact/:id` (update)**

Same shape as create; adjust fields as needed.

### `PATCH /:id/sync`

```json
{ "syncStatus": "Synced" }
```

### `PATCH /:id/portal`

```json
{ "portalUser": true, "portalAdmin": false }
```

---

## Purchase orders

Prefix: `/api/purchase-orders`

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `POST` | `/` | Bearer | `vendor`, `vendor_admin`, `super_admin` |
| `POST` | `/businesscentral` | Register token | Same body as `POST /`; see [Business Central–style create routes](#business-centralstyle-create-routes) |
| `GET` | `/` | Bearer | `vendor`, `vendor_admin`, `super_admin` |
| `GET` | `/partner/:partnerNo` | Bearer | Same |
| `GET` | `/:id` | Bearer | Same |
| `PUT` | `/:id` | Bearer | Same |
| `PATCH` | `/:id/status` | Bearer | `vendor_admin`, `super_admin` |
| `DELETE` | `/:id` | Bearer | `vendor_admin`, `super_admin` |

### Query (`GET /`)

| Query | Description |
|-------|-------------|
| `status` | Filter |
| `partnerNo` | Filter |

### Create / update body

**Required:** `partnerNo`, `orderStagingLines` (non-empty array).

**Header fields**

| Field | Type |
|-------|------|
| `orderType`, `partnerNo`, `partnerType`, `shipToCode`, `locationCode`, `currencyCode`, `externalDocumentNo`, `status`, `direction` | string / null |
| `orderDate`, `requestedDeliveryDate`, `submittedDate` | string (date) / null |

**Line object (`orderStagingLines[]`)**

| Field | Type |
|-------|------|
| `lineNo`, `itemNo`, `description`, `unitOfMeasureCode`, `locationCode`, `deliveryDate`, `variantCode` | string / null |
| `quantity`, `unitPrice`, `lineDiscountPercent`, `lineDiscountAmount`, `lineAmount` | number |

### `PATCH /:id/status`

Allowed `status`: `Processed`, `Pending`, `Approved`, `Rejected`, `Cancelled`.

```json
{ "status": "Approved" }
```

**Example payload — `POST /api/purchase-orders` & `PUT /api/purchase-orders/:id`**

```json
{
  "orderType": "PO",
  "partnerNo": "VNR000001",
  "partnerType": "vendor",
  "shipToCode": "SHIP001",
  "locationCode": "LOC001",
  "orderDate": "2026-03-22",
  "requestedDeliveryDate": "2026-03-30",
  "currencyCode": "INR",
  "externalDocumentNo": "EXT-PO-1001",
  "status": "Processed",
  "direction": "Inbound",
  "submittedDate": "2026-03-22",
  "orderStagingLines": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM001",
      "description": "Item 1",
      "quantity": 10,
      "unitOfMeasureCode": "PCS",
      "unitPrice": 100,
      "lineDiscountPercent": 5,
      "lineDiscountAmount": 50,
      "lineAmount": 950,
      "locationCode": "LOC001",
      "deliveryDate": "2026-03-30",
      "variantCode": "BLUE"
    }
  ]
}
```

---

## Sales orders

Prefix: `/api/sales-orders`

| Method | Path | Auth | Roles |
|--------|------|------|--------|
| `POST` | `/` | Bearer | `customer`, `customer_admin`, `super_admin` |
| `POST` | `/businesscentral` | Register token | Same body as `POST /`; see [Business Central–style create routes](#business-centralstyle-create-routes) |
| `GET` | `/` | Bearer | Same |
| `GET` | `/partner/:partnerNo` | Bearer | Same |
| `GET` | `/:id` | Bearer | Same |
| `PUT` | `/:id` | Bearer | Same |
| `PATCH` | `/:id/status` | Bearer | `customer_admin`, `super_admin` |
| `DELETE` | `/:id` | Bearer | `customer_admin`, `super_admin` |

Body shape is the same as **Purchase orders** (header + `orderStagingLines[]`).  
Status values for patch: same as purchase orders.

**Example payload — `POST /api/sales-orders` & `PUT /api/sales-orders/:id`**

```json
{
  "orderType": "SO",
  "partnerNo": "CUS000001",
  "partnerType": "customer",
  "shipToCode": "SHIP001",
  "locationCode": "LOC001",
  "orderDate": "2026-03-22",
  "requestedDeliveryDate": "2026-03-29",
  "currencyCode": "INR",
  "externalDocumentNo": "EXT-SO-1001",
  "status": "Processed",
  "direction": "Outbound",
  "submittedDate": "2026-03-22",
  "orderStagingLines": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM001",
      "description": "Sales Item",
      "quantity": 5,
      "unitOfMeasureCode": "PCS",
      "unitPrice": 150,
      "lineDiscountPercent": 0,
      "lineDiscountAmount": 0,
      "lineAmount": 750,
      "locationCode": "LOC001",
      "deliveryDate": "2026-03-29",
      "variantCode": "STD"
    }
  ]
}
```

**Example payload — `PATCH /api/sales-orders/:id/status`**

```json
{ "status": "Approved" }
```

---

## Invoices

Prefix: `/api/invoices`

| Method | Path | Auth | Roles |
|--------|------|------|--------|
| `POST` | `/` | Bearer | `vendor`, `vendor_admin`, `customer`, `customer_admin`, `super_admin` |
| `POST` | `/businesscentral` | Register token | Same body as `POST /`; see [Business Central–style create routes](#business-centralstyle-create-routes) |
| `GET` | `/` | Bearer | Same |
| `GET` | `/partner/:partnerNo` | Bearer | Same |
| `GET` | `/no/:invoiceNo` | Bearer | Same |
| `GET` | `/:id` | Bearer | Same |
| `PUT` | `/:id` | Bearer | Same |
| `PATCH` | `/:id/status` | Bearer | `vendor_admin`, `customer_admin`, `super_admin` |
| `DELETE` | `/:id` | Bearer | Same as status patch |

### Query (`GET /`)

| Query | Description |
|-------|-------------|
| `status` | Filter |
| `partnerNo` | Filter |

### Create / update body

**Required:** `partnerNo`, `portalInvoiceLine` (non-empty).

**Header**

| Field | Type |
|-------|------|
| `invoiceType`, `invoiceNo`, `invoiceDate`, `dueDate`, `partnerNo`, `partnerType`, `currencyCode`, `status`, `bcInvoiceNo`, `linkedOrderNo` | string / null |
| `totalAmount`, `outstandingAmount` | number |

**Line (`portalInvoiceLine[]`)**

| Field | Type |
|-------|------|
| `lineNo`, `itemNo`, `description`, `unitOfMeasureCode`, `variantCode` | string / null |
| `lineAmount`, `lineDiscount`, `lineDiscountAmount`, `quantity`, `unitPrice`, `vat`, `vatAmount` | number |

`invoiceNo` must be unique if provided.

### `PATCH /:id/status`

Allowed: `Pending`, `Paid`, `Overdue`, `Cancelled`, `Partial`.

**Example payload**

```json
{ "status": "Paid" }
```

**Example payload — `POST /api/invoices` & `PUT /api/invoices/:id`**

```json
{
  "invoiceType": "Sales",
  "invoiceNo": "INV-1001",
  "invoiceDate": "2026-03-22",
  "dueDate": "2026-04-21",
  "partnerNo": "CUS000001",
  "partnerType": "customer",
  "totalAmount": 1000,
  "currencyCode": "INR",
  "outstandingAmount": 1000,
  "status": "Pending",
  "bcInvoiceNo": "BC-INV-1001",
  "linkedOrderNo": "SO-1001",
  "portalInvoiceLine": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM001",
      "description": "Invoice line",
      "lineAmount": 1000,
      "lineDiscount": 0,
      "lineDiscountAmount": 0,
      "quantity": 10,
      "unitPrice": 100,
      "unitOfMeasureCode": "PCS",
      "vat": 18,
      "vatAmount": 180,
      "variantCode": "STD"
    }
  ]
}
```

---

## Purchase invoices

Prefix: `/api/purchase-invoices`

Same structure as **Invoices** (header + `portalInvoiceLine[]`), but routes restrict roles to **vendor-side**: `vendor`, `vendor_admin`, `super_admin` (see `purchaseInvoice.routes.js`).

Paths: `/`, `/businesscentral`, `/partner/:partnerNo`, `/no/:invoiceNo`, `/:id`, `PATCH /:id/status`, `DELETE /:id`.

**Example payload — `POST /api/purchase-invoices` & `PUT /api/purchase-invoices/:id`**

(Same JSON shape as sales invoices; typically `partnerType` is `vendor`.)

```json
{
  "invoiceType": "Purchase",
  "invoiceNo": "PINV-1001",
  "invoiceDate": "2026-03-22",
  "dueDate": "2026-04-21",
  "partnerNo": "VNR000001",
  "partnerType": "vendor",
  "totalAmount": 2000,
  "currencyCode": "INR",
  "outstandingAmount": 2000,
  "status": "Pending",
  "bcInvoiceNo": "BC-PINV-1001",
  "linkedOrderNo": "PO-1001",
  "portalInvoiceLine": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM002",
      "description": "Purchase line",
      "lineAmount": 2000,
      "lineDiscount": 0,
      "lineDiscountAmount": 0,
      "quantity": 20,
      "unitPrice": 100,
      "unitOfMeasureCode": "PCS",
      "vat": 18,
      "vatAmount": 360,
      "variantCode": "STD"
    }
  ]
}
```

**Example payload — `PATCH /api/purchase-invoices/:id/status`**

```json
{ "status": "Paid" }
```

---

## Purchase receipts

Prefix: `/api/purchase-receipts`

| Method | Path | Auth | Roles |
|--------|------|------|--------|
| `POST` | `/` | Bearer | `vendor`, `vendor_admin`, `super_admin` |
| `POST` | `/businesscentral` | Register token | Same body as `POST /`; see [Business Central–style create routes](#business-centralstyle-create-routes) |
| `GET` | `/` | Bearer | Same |
| `GET` | `/partner/:partnerNo` | Bearer | Same |
| `GET` | `/shipment/:shipmentNo` | Bearer | Same |
| `GET` | `/:id` | Bearer | Same |
| `PUT` | `/:id` | Bearer | Same |
| `PATCH` | `/:id/status` | Bearer | `vendor_admin`, `super_admin` |
| `DELETE` | `/:id` | Bearer | Same |

### Create / update body

**Required:** `partnerNo`, `deliveryStagingsLine` (non-empty).

**Header**

| Field | Type |
|-------|------|
| `deliveryType`, `partnerNo`, `partnerType`, `linkedOrderNo`, `shipmentNo`, `trackingNo`, `carrierCode`, `locationCode`, `shipToCode`, `status`, `direction`, `bcDocumentNo` | string / null |
| `shipmentDate`, `expectedDeliveryDate` | string (date) / null |

**Line (`deliveryStagingsLine[]`)**

| Field | Type |
|-------|------|
| `lineNo`, `itemNo`, `description`, `expirationDate`, `lotNo`, `serialNo`, `unitOfMeasureCode`, `variantCode` | string / null |
| `orderedQuantity`, `remainingQuantity`, `shippedQuantity` | number |

`shipmentNo` must be unique if provided.

### `PATCH /:id/status`

Allowed: `Processed`, `Pending`, `Delivered`, `Cancelled`, `Partial`.

**Example payload**

```json
{ "status": "Delivered" }
```

**Example payload — `POST /api/purchase-receipts` & `PUT /api/purchase-receipts/:id`**

```json
{
  "deliveryType": "Receipt",
  "partnerNo": "VNR000001",
  "partnerType": "vendor",
  "linkedOrderNo": "PO-1001",
  "shipmentNo": "SHP-1001",
  "trackingNo": "TRK-1001",
  "carrierCode": "DHL",
  "shipmentDate": "2026-03-22",
  "expectedDeliveryDate": "2026-03-28",
  "locationCode": "LOC001",
  "shipToCode": "SHIP001",
  "status": "Processed",
  "direction": "Inbound",
  "bcDocumentNo": "BC-REC-1001",
  "deliveryStagingsLine": [
    {
      "lineNo": 10000,
      "itemNo": "ITEM002",
      "description": "Receipt line",
      "expirationDate": "2027-03-22",
      "lotNo": "LOT001",
      "orderedQuantity": 20,
      "remainingQuantity": 0,
      "serialNo": "SER001",
      "shippedQuantity": 20,
      "unitOfMeasureCode": "PCS",
      "variantCode": "STD"
    }
  ]
}
```

---

## Partner location links

Prefix: `/api/partner-location-links`

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `POST` | `/` | Bearer | All standard partner roles |
| `POST` | `/businesscentral` | Register token | Same body as `POST /`; see [Business Central–style create routes](#business-centralstyle-create-routes) |
| `GET` | `/` | Bearer | Query: `partnerNo`, `partnerType`, `locationCode` |
| `GET` | `/partner/:partnerNo` | Bearer | |
| `GET` | `/partner/:partnerNo/default` | Bearer | |
| `GET` | `/:id` | Bearer | |
| `PUT` | `/:id` | Bearer | |
| `PATCH` | `/:id/block` | Bearer | `customer_admin`, `vendor_admin`, `super_admin` |
| `PATCH` | `/:id/default` | Bearer | Same |
| `DELETE` | `/:id` | Bearer | Same |

### Create body

**Required:** `partnerNo`, `partnerType`.

| Field | Type |
|-------|------|
| `partnerType`, `partnerNo`, `description`, `addressCode`, `addressName`, `locationCode`, `address`, `address2`, `city`, `postCode`, `countryRegionCode`, `contact`, `phoneNo` | string / null |
| `isDefault`, `blocked` | boolean |

**Example payload — `POST /api/partner-location-links` (create)**

```json
{
  "partnerType": "vendor",
  "partnerNo": "VNR000001",
  "description": "Main Warehouse",
  "addressCode": "ADDR001",
  "addressName": "Warehouse A",
  "locationCode": "LOC001",
  "address": "Line 1",
  "address2": "Line 2",
  "city": "Bengaluru",
  "postCode": "560001",
  "countryRegionCode": "IN",
  "contact": "Warehouse Manager",
  "phoneNo": "+919999999000",
  "isDefault": true,
  "blocked": false
}
```

**Example payload — `PUT /api/partner-location-links/:id` (update)**

```json
{
  "partnerType": "vendor",
  "partnerNo": "VNR000001",
  "description": "Secondary Warehouse",
  "addressCode": "ADDR002",
  "addressName": "Warehouse B",
  "locationCode": "LOC002",
  "address": "Line 1",
  "address2": "Line 2",
  "city": "Mumbai",
  "postCode": "400001",
  "countryRegionCode": "IN",
  "contact": "Ops Manager",
  "phoneNo": "+919999999111",
  "isDefault": false,
  "blocked": false
}
```

### `PATCH /:id/block`

```json
{ "blocked": true }
```

### `PATCH /:id/default`

```json
{ "isDefault": true }
```

---

## Typical response shape

Success (varies by endpoint):

```json
{
  "success": true,
  "message": "...",
  "data": { }
}
```

List endpoints may include `count`.

Error:

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP status codes: `400` validation, `401` auth, `403` forbidden, `404` not found, `500` server error.

---

## Related files

| Area | Path |
|------|------|
| App mount | `app.js` |
| Routes | `routes/*.routes.js` |
| Controllers | `controllers/*.js` |
| Models / SQL mapping | `models/*.model.js` |
| Postman collection | `PartnerPortal.postman_collection.json` (regenerate with `npm run postman:generate`) |
| Collection generator | `scripts/generate-postman-collection.js` |

---

## Postman collection

Regenerate the collection from the current Express route graph (includes all `/businesscentral` routes and full example bodies):

```bash
npm run postman:generate
```

**Note:** `GET /api/routes` is registered in `app.js` only when `NODE_ENV !== "production"`. The generated Postman request is useful for local/dev debugging.
