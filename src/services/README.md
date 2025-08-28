# CustomerService Implementation

## Overview

This directory contains the complete implementation of the CustomerService layer for the Customer Intelligence Dashboard. The service provides a comprehensive data abstraction layer with full CRUD operations, validation, error handling, and business logic.

## Architecture

The implementation follows enterprise-grade patterns for scalability, maintainability, and future API integration:

### Core Files

- **`CustomerService.ts`** - Main service class with complete CRUD operations
- **`__tests__/CustomerService.test.ts`** - Comprehensive test suite
- **`examples/CustomerServiceUsage.ts`** - Usage examples and best practices

### Integration Files

- **`../hooks/useCustomerService.ts`** - React hooks for easy component integration

## Features

### 1. Complete CRUD Operations

- **Create**: Add new customers with validation and business logic
- **Read**: Fetch customers with filtering, pagination, and search
- **Update**: Modify existing customers with data consistency checks
- **Delete**: Remove customers with proper error handling

### 2. Advanced Query Capabilities

- **Pagination**: Page through large customer datasets
- **Filtering**: Filter by subscription tier, health score, company name
- **Search**: Full-text search across name, company, and email fields
- **Sorting**: Sort by any customer property with asc/desc ordering

### 3. Data Validation & Error Handling

- **Input Validation**: Comprehensive validation for all operations
- **Custom Error Types**: Structured error handling with specific error codes
- **Business Rules**: Email uniqueness, domain format validation
- **Type Safety**: Full TypeScript support with strict type checking

### 4. Business Logic Integration

- **Health Score Calculation**: Automatic health score computation based on:
  - Subscription tier (Enterprise = +30, Premium = +15, Basic = +5)
  - Domain count (up to +20 points)
  - Email presence (+10 points)  
  - Account age (up to +15 points)
- **Statistics**: Customer analytics and business intelligence queries
- **Risk Analysis**: Identify customers needing attention

## Usage Examples

### Basic CRUD Operations

```typescript
import { customerService } from '@/services/CustomerService';

// Create customer
const result = await customerService.createCustomer({
  name: 'John Doe',
  company: 'Example Corp',
  email: 'john@example.com',
  subscriptionTier: 'premium'
});

// Get customer
const customer = await customerService.getCustomerById('1');

// Update customer
await customerService.updateCustomer('1', {
  healthScore: 85,
  subscriptionTier: 'enterprise'
});

// Delete customer
await customerService.deleteCustomer('1');
```

### Advanced Queries

```typescript
// Paginated customers with filtering
const result = await customerService.getCustomers({
  page: 1,
  limit: 10,
  subscriptionTier: 'premium',
  healthScoreMin: 70,
  sortBy: 'healthScore',
  sortOrder: 'desc'
});

// Search customers
const searchResults = await customerService.searchCustomers('acme');

// Get statistics
const stats = await customerService.getCustomerStats();
```

### React Integration

```typescript
import { useCustomers, useCustomerOperations } from '@/hooks/useCustomerService';

function CustomerDashboard() {
  const { customers, loading, error } = useCustomers({ 
    page: 1, 
    limit: 10,
    subscriptionTier: 'premium' 
  });
  
  const { createCustomer, updateCustomer, deleteCustomer } = useCustomerOperations();

  // Use customers data in your components
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return (
    <div>
      {customers?.data.map(customer => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  );
}
```

## Error Handling

The service provides structured error handling with specific error types:

```typescript
import { ValidationError, NotFoundError, DuplicateError } from '@/services/CustomerService';

const result = await customerService.createCustomer(invalidData);

if (!result.success) {
  switch (result.code) {
    case 'VALIDATION_ERROR':
      // Handle validation errors
      break;
    case 'DUPLICATE_ERROR':
      // Handle duplicate data errors
      break;
    case 'NOT_FOUND':
      // Handle not found errors
      break;
    default:
      // Handle general errors
  }
}
```

## Data Model

The service works with the Customer interface from `/src/data/mock-customers.ts`:

```typescript
interface Customer {
  id: string;
  name: string;
  company: string;
  healthScore: number; // 0-100
  email?: string;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  domains?: string[]; // Customer websites for health monitoring
  createdAt?: string;
  updatedAt?: string;
}
```

## Future API Integration

The service is designed for easy transition from mock data to real API:

1. **Abstraction Layer**: All operations go through the service interface
2. **Async Pattern**: All methods are async-ready for API calls
3. **Error Structure**: Consistent error format matching typical API responses
4. **Type Safety**: Full TypeScript interfaces for API contract validation

To migrate to real API, simply replace the internal data operations with HTTP calls while maintaining the same interface.

## Testing

Run the test suite to validate all functionality:

```bash
# TypeScript compilation check
npm run type-check

# Run service tests (when test runner is configured)
npm test src/services/__tests__/CustomerService.test.ts
```

The test suite covers:
- All CRUD operations
- Validation scenarios
- Error handling
- Business logic
- Edge cases and boundary conditions

## Performance Considerations

- **In-Memory Operations**: Current implementation uses in-memory data for fast development
- **Pagination**: Efficient pagination to handle large datasets
- **Search Optimization**: Optimized search algorithms for responsive UI
- **Caching Ready**: Architecture supports future caching layer integration

This service layer provides a solid foundation for the Customer Intelligence Dashboard with enterprise-grade reliability, comprehensive error handling, and seamless future API integration capabilities.