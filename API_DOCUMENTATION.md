# GrocX API Documentation

## Overview

Complete REST API implementation with standardized error handling, input validation, CORS support, and authentication middleware.

## Base URL

```
http://localhost:3000/api
```

## Features

- ✅ Input validation using custom validator
- ✅ Standardized error responses
- ✅ CORS configuration for mobile app
- ✅ Authentication middleware for protected routes
- ✅ Admin authorization for admin operations
- ✅ Pagination support for list endpoints
- ✅ Request/response logging capability

---

## Products API

### List Products

```http
GET /products?page=1&limit=20&categoryId=cat1&search=apple&featured=false
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page, max 100 (default: 20)
- `categoryId` (string): Filter by category
- `search` (string): Search by product name
- `featured` (boolean): Filter featured products only

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "prod-1",
      "name": "Apple",
      "description": "Fresh red apples",
      "price": 5.99,
      "stock": 100,
      "category_id": "cat-1",
      "image_url": "https://...",
      "is_featured": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

### Get Product by ID

```http
GET /products/prod-1
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "prod-1",
    "name": "Apple",
    "description": "Fresh red apples",
    "price": 5.99,
    "stock": 100,
    "category_id": "cat-1",
    "image_url": "https://...",
    "is_featured": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### Create Product (Admin Only)

```http
POST /products
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Banana",
  "description": "Fresh yellow bananas",
  "price": 3.99,
  "stock": 200,
  "category_id": "cat-1",
  "image_url": "https://...",
  "is_featured": false
}
```

**Response:** 201 Created

---

### Update Product (Admin Only)

```http
PUT /products/prod-1
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** (all fields optional)

```json
{
  "name": "Organic Apple",
  "price": 6.99,
  "stock": 150,
  "is_featured": true
}
```

**Response:** 200 OK

---

### Delete Product (Admin Only)

```http
DELETE /products/prod-1
Authorization: Bearer {token}
```

**Response:** 200 OK

---

### Get Products by Category

```http
GET /products/category/cat-1?page=1&limit=20
```

**Response:** Same as list products

---

### Get Featured Products

```http
GET /products/featured?limit=10
```

**Response:**

```json
{
  "success": true,
  "data": [...]
}
```

---

## Categories API

### List Categories

```http
GET /categories
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cat-1",
      "name": "Fruits",
      "description": "Fresh fruits",
      "icon": "🍎",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Category by ID

```http
GET /categories/cat-1
```

---

### Create Category (Admin Only)

```http
POST /categories
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Vegetables",
  "description": "Fresh vegetables",
  "icon": "🥬"
}
```

---

### Update Category (Admin Only)

```http
PUT /categories/cat-1
Authorization: Bearer {token}
```

---

### Delete Category (Admin Only)

```http
DELETE /categories/cat-1
Authorization: Bearer {token}
```

---

## Orders API

### List Orders

```http
GET /orders?page=1&limit=20&status=pending
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Filter by status (pending, confirmed, shipped, delivered, cancelled)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "order-1",
      "user_id": "user-1",
      "items": [
        {
          "product_id": "prod-1",
          "quantity": 2,
          "price": 5.99
        }
      ],
      "total_amount": 11.98,
      "status": "pending",
      "delivery_address": "123 Main St",
      "phone_number": "555-1234",
      "notes": "Leave at door",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

### Get Order by ID

```http
GET /orders/order-1
Authorization: Bearer {token}
```

---

### Create Order

```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "user_id": "user-1",
  "items": [
    {
      "product_id": "prod-1",
      "quantity": 2,
      "price": 5.99
    }
  ],
  "total_amount": 11.98,
  "delivery_address": "123 Main St",
  "phone_number": "555-1234",
  "notes": "Leave at door"
}
```

---

### Update Order Status (Admin Only)

```http
PUT /orders/order-1
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**

- `pending` - Initial order state
- `confirmed` - Order confirmed by admin
- `shipped` - Order on the way
- `delivered` - Order delivered
- `cancelled` - Order cancelled

---

### Track Order

```http
GET /orders/order-1/track
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "order-1",
    "status": "shipped",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-02T15:30:00Z",
    "estimatedDelivery": "2024-01-05T00:00:00Z",
    "timeline": [
      {
        "status": "pending",
        "label": "Order Placed",
        "timestamp": "2024-01-01T10:00:00Z",
        "completed": true
      },
      {
        "status": "confirmed",
        "label": "Order Confirmed",
        "timestamp": "2024-01-01T11:00:00Z",
        "completed": true
      },
      {
        "status": "shipped",
        "label": "Shipped",
        "timestamp": "2024-01-02T15:30:00Z",
        "completed": true
      },
      {
        "status": "delivered",
        "label": "Delivered",
        "timestamp": null,
        "completed": false
      }
    ]
  }
}
```

---

## Banners API

### Get Active Banners

```http
GET /banners
```

Returns only active banners within their date range.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "banner-1",
      "title": "Summer Sale",
      "description": "Get 50% off",
      "image_url": "https://...",
      "link_url": "https://...",
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-01-31T23:59:59Z",
      "position": 0,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### List All Banners (Admin Only)

```http
GET /banners?admin=true&page=1&limit=20
Authorization: Bearer {token}
```

---

### Create Banner (Admin Only)

```http
POST /banners
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "New Year Sale",
  "description": "Get 30% off on all products",
  "image_url": "https://...",
  "link_url": "https://...",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-01-31T23:59:59Z",
  "position": 1,
  "is_active": true
}
```

---

### Update Banner (Admin Only)

```http
PUT /banners/banner-1
Authorization: Bearer {token}
Content-Type: application/json
```

---

### Delete Banner (Admin Only)

```http
DELETE /banners/banner-1
Authorization: Bearer {token}
```

---

## Error Responses

All errors follow a standardized format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "field": "error message"
    }
  }
}
```

### Common Error Codes

| Code                 | Status | Description                  |
| -------------------- | ------ | ---------------------------- |
| `VALIDATION_ERROR`   | 400    | Request validation failed    |
| `INVALID_JSON`       | 400    | Invalid JSON in request body |
| `UNAUTHORIZED`       | 401    | Authentication required      |
| `NOT_FOUND`          | 404    | Resource not found           |
| `METHOD_NOT_ALLOWED` | 405    | HTTP method not supported    |
| `INTERNAL_ERROR`     | 500    | Server error                 |

---

## Authentication

Protected endpoints require:

```http
Authorization: Bearer {JWT_TOKEN}
```

Tokens are obtained through Supabase authentication.

### Admin Routes

Admin operations require user to have `admin` role in their user metadata.

---

## CORS Configuration

API supports CORS for:

- `http://localhost:3000` (local development)
- `http://localhost:3001` (local development)
- `http://localhost:8000` (local development)
- URLs in `NEXT_PUBLIC_APP_URL` env variable
- URLs in `MOBILE_APP_URL` env variable

---

## Request/Response Examples

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    /* resource data */
  }
}
```

### Paginated Response (200 OK)

```json
{
  "success": true,
  "data": [
    /* array of resources */
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Validation Error (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "name": "name is required",
      "price": "price must be a number"
    }
  }
}
```

### Not Found (404)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  }
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

---

## Environment Variables

Add these to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
MOBILE_APP_URL=http://localhost:8000
```

---

## Utility Files

### `/src/lib/api/validation.js`

Input validation utilities without external dependencies.

### `/src/lib/api/error-handler.js`

Standardized error handling and response formatting.

### `/src/lib/api/cors.js`

CORS configuration and middleware.

### `/src/lib/api/auth.js`

Authentication and authorization middleware.

### `/src/lib/api/db.js`

Database query utilities for Supabase.

---

## Next Steps

1. Configure Supabase database tables (products, categories, orders, banners)
2. Set up environment variables
3. Add authentication endpoints
4. Implement rate limiting (optional)
5. Add request logging/monitoring
6. Set up API documentation with Swagger/OpenAPI
