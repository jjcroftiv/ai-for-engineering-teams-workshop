# Customer API Documentation

## Overview

The Customer API provides comprehensive CRUD operations for customer management with built-in security measures, input validation, and error handling. All endpoints follow RESTful principles and return consistent JSON responses.

## Base URL

```
http://localhost:3000/api/customers
```

## Authentication

Currently, the API does not require authentication. In a production environment, implement appropriate authentication mechanisms (JWT tokens, API keys, etc.).

## Response Format

All API responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2025-08-28T18:09:32.079Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-08-28T18:09:32.079Z"
}
```

## Endpoints

### 1. List Customers

**GET** `/api/customers`

Retrieve a paginated list of customers with optional filtering and sorting.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-1000) |
| `limit` | number | 10 | Items per page (1-100) |
| `sortBy` | string | - | Sort field: `id`, `name`, `company`, `healthScore`, `createdAt`, `updatedAt` |
| `sortOrder` | string | `asc` | Sort order: `asc` or `desc` |
| `subscriptionTier` | string | - | Filter by tier: `basic`, `premium`, `enterprise` |
| `healthScoreMin` | number | - | Minimum health score (0-100) |
| `healthScoreMax` | number | - | Maximum health score (0-100) |
| `company` | string | - | Filter by company name (partial match) |
| `searchTerm` | string | - | Search in name, company, or email |

#### Example Request
```bash
curl -X GET "http://localhost:3000/api/customers?page=1&limit=5&subscriptionTier=premium&sortBy=healthScore&sortOrder=desc"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "4",
        "name": "Emily Davis",
        "company": "Innovation Labs",
        "healthScore": 92,
        "email": "emily.davis@innovationlabs.tech",
        "subscriptionTier": "enterprise",
        "domains": ["innovationlabs.tech", "app.innovationlabs.tech"],
        "createdAt": "2024-01-10T16:18:00Z",
        "updatedAt": "2024-01-10T16:18:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 8,
      "totalPages": 2
    }
  },
  "timestamp": "2025-08-28T18:09:32.079Z"
}
```

---

### 2. Create Customer

**POST** `/api/customers`

Create a new customer with validation and security checks.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Customer name (max 100 chars) |
| `company` | string | Yes | Company name (max 100 chars) |
| `email` | string | No | Valid email address (max 254 chars) |
| `subscriptionTier` | string | No | Tier: `basic`, `premium`, `enterprise` (default: `basic`) |
| `domains` | string[] | No | Array of domain names (max 10 domains) |

#### Example Request
```bash
curl -X POST "http://localhost:3000/api/customers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "company": "Example Corp",
    "email": "john.doe@example.com",
    "subscriptionTier": "premium",
    "domains": ["example.com", "app.example.com"]
  }'
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": "9",
    "name": "John Doe",
    "company": "Example Corp",
    "email": "john.doe@example.com",
    "subscriptionTier": "premium",
    "domains": ["example.com", "app.example.com"],
    "healthScore": 80,
    "createdAt": "2025-08-28T18:09:44.001Z",
    "updatedAt": "2025-08-28T18:09:44.001Z"
  },
  "timestamp": "2025-08-28T18:09:44.001Z"
}
```

---

### 3. Get Customer by ID

**GET** `/api/customers/{id}`

Retrieve a specific customer by their ID.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Customer ID |

#### Example Request
```bash
curl -X GET "http://localhost:3000/api/customers/1"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "John Smith",
    "company": "Acme Corp",
    "healthScore": 85,
    "email": "john.smith@acmecorp.com",
    "subscriptionTier": "premium",
    "domains": ["acmecorp.com", "portal.acmecorp.com"],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2025-08-28T18:09:03.542Z"
}
```

---

### 4. Update Customer

**PUT** `/api/customers/{id}`

Update an existing customer. All fields are optional.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Customer ID |

#### Request Body

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Customer name (max 100 chars) |
| `company` | string | Company name (max 100 chars) |
| `email` | string | Valid email address (max 254 chars) |
| `subscriptionTier` | string | Tier: `basic`, `premium`, `enterprise` |
| `domains` | string[] | Array of domain names (max 10 domains) |
| `healthScore` | number | Health score (0-100) |

#### Example Request
```bash
curl -X PUT "http://localhost:3000/api/customers/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith Updated",
    "healthScore": 95
  }'
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "John Smith Updated",
    "company": "Acme Corp",
    "healthScore": 95,
    "email": "john.smith@acmecorp.com",
    "subscriptionTier": "premium",
    "domains": ["acmecorp.com", "portal.acmecorp.com"],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2025-08-28T18:10:15.123Z"
  },
  "timestamp": "2025-08-28T18:10:15.123Z"
}
```

---

### 5. Delete Customer

**DELETE** `/api/customers/{id}`

Delete a customer by ID.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Customer ID |

#### Example Request
```bash
curl -X DELETE "http://localhost:3000/api/customers/1"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "id": "1"
  },
  "timestamp": "2025-08-28T18:10:27.110Z"
}
```

---

### 6. Search Customers

**GET** `/api/customers/search`

Search customers by name, company, or email with security validation.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search term (min 2 chars, max 100 chars) |
| `limit` | number | No | Max results (default: 20, max: 100) |

#### Example Request
```bash
curl -X GET "http://localhost:3000/api/customers/search?q=john&limit=5"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "1",
        "name": "John Smith",
        "company": "Acme Corp",
        "healthScore": 85,
        "email": "john.smith@acmecorp.com",
        "subscriptionTier": "premium",
        "domains": ["acmecorp.com", "portal.acmecorp.com"],
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "metadata": {
      "searchTerm": "john",
      "resultCount": 1,
      "totalFound": 2,
      "limit": 5,
      "searchTime": 1
    }
  },
  "timestamp": "2025-08-28T18:09:15.606Z"
}
```

---

### 7. Get Customer Statistics

**GET** `/api/customers/stats`

Retrieve comprehensive customer analytics and statistics.

#### Example Request
```bash
curl -X GET "http://localhost:3000/api/customers/stats"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "total": 8,
    "byTier": {
      "basic": 3,
      "premium": 3,
      "enterprise": 2
    },
    "averageHealthScore": 62,
    "healthDistribution": {
      "healthy": 4,
      "warning": 3,
      "critical": 1
    },
    "metadata": {
      "generatedAt": "2025-08-28T18:09:32.079Z",
      "cacheExpiry": "2025-08-28T18:14:32.079Z",
      "version": "1.0"
    },
    "additionalMetrics": {
      "tierDistribution": {
        "basicPercentage": 38,
        "premiumPercentage": 38,
        "enterprisePercentage": 25
      },
      "healthDistributionPercentages": {
        "healthyPercentage": 50,
        "warningPercentage": 38,
        "criticalPercentage": 13
      },
      "performanceMetrics": {
        "responseTime": 2,
        "dataFreshness": "real-time"
      }
    }
  },
  "timestamp": "2025-08-28T18:09:32.079Z"
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | General validation error |
| `INVALID_JSON` | 400 | Malformed JSON in request |
| `INVALID_BODY` | 400 | Invalid request body format |
| `MISSING_NAME` | 400 | Customer name is required |
| `MISSING_COMPANY` | 400 | Company name is required |
| `NAME_TOO_LONG` | 400 | Customer name exceeds 100 characters |
| `COMPANY_TOO_LONG` | 400 | Company name exceeds 100 characters |
| `EMAIL_TOO_LONG` | 400 | Email address exceeds 254 characters |
| `TOO_MANY_DOMAINS` | 400 | More than 10 domains provided |
| `INVALID_ID` | 400 | Invalid customer ID format |
| `INVALID_EMAIL` | 400 | Invalid email format |
| `INVALID_TIER` | 400 | Invalid subscription tier |
| `INVALID_HEALTH_SCORE` | 400 | Health score must be 0-100 |
| `NO_UPDATE_FIELDS` | 400 | No fields provided for update |
| `MISSING_SEARCH_TERM` | 400 | Search term is required |
| `SEARCH_TERM_TOO_SHORT` | 400 | Search term must be at least 2 characters |
| `SUSPICIOUS_PATTERN` | 400 | Suspicious content detected |
| `INVALID_RANGE` | 400 | Invalid health score range |
| `NOT_FOUND` | 404 | Customer not found |
| `METHOD_NOT_ALLOWED` | 405 | HTTP method not allowed |
| `DUPLICATE_ERROR` | 409 | Duplicate customer email |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_ERROR` | 500 | Service layer error |

## Security Features

### Input Validation
- Comprehensive input sanitization for all parameters
- Length limits on all string fields
- Format validation for emails and domains
- Numeric range validation for health scores and pagination

### Security Headers
All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Attack Prevention
- HTML/script tag removal from inputs
- Template injection protection
- Suspicious pattern detection in search terms
- Control character removal
- Domain validation with security checks

### Rate Limiting
- Request logging for monitoring
- Client IP tracking
- Structured for future rate limiting implementation

### Caching
- Statistics endpoint includes ETag support
- Appropriate Cache-Control headers
- 5-minute default cache for statistics

## TypeScript Integration

The API includes comprehensive TypeScript definitions in `/src/types/api.ts`:

```typescript
import { ApiResponse, CustomerResponse, CustomerListResponse } from '@/types/api';

// Use typed responses in your client code
const response: CustomerListResponse = await fetch('/api/customers').then(r => r.json());
```

## Error Handling

Always check the `success` field in responses:

```typescript
if (response.success) {
  // Handle successful response
  console.log(response.data);
} else {
  // Handle error
  console.error(`Error ${response.code}: ${response.error}`);
}
```

## Best Practices

1. **Always validate responses** - Check the `success` field before using data
2. **Handle errors gracefully** - Implement proper error handling for all error codes
3. **Use pagination** - Don't request all customers at once in production
4. **Sanitize inputs** - Client-side validation doesn't replace server-side validation
5. **Monitor requests** - Check server logs for suspicious activity
6. **Use TypeScript** - Leverage the provided type definitions for better development experience

## Development Testing

Use the provided curl examples to test all endpoints during development. The API server logs all requests and security events for monitoring and debugging.

## Future Enhancements

- JWT authentication implementation
- Redis-based rate limiting
- Advanced search with Elasticsearch
- Real-time health score updates via WebSockets
- Bulk operations for multiple customers
- API versioning strategy