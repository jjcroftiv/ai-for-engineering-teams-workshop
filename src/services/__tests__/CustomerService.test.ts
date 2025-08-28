/**
 * CustomerService Tests
 * 
 * Basic test suite to validate CRUD operations and error handling
 * Note: In a real project, this would use Jest/Vitest with proper test setup
 */

import { CustomerService, ValidationError, NotFoundError, DuplicateError } from '../CustomerService';

// Simple test runner (would be replaced with Jest/Vitest in production)
async function runTests() {
  const service = new CustomerService();
  let testsPassed = 0;
  let testsTotal = 0;

  function test(name: string, testFn: () => Promise<void>) {
    testsTotal++;
    return testFn()
      .then(() => {
        console.log(`✅ ${name}`);
        testsPassed++;
      })
      .catch((error) => {
        console.error(`❌ ${name}: ${error.message}`);
      });
  }

  // Reset data before tests
  service.resetData();

  // Test: Get all customers
  await test('Should get all customers', async () => {
    const result = await service.getCustomers();
    if (!result.success || !result.data || result.data.data.length !== 8) {
      throw new Error(`Expected 8 customers, got ${result.data?.data.length}`);
    }
  });

  // Test: Get customer by ID
  await test('Should get customer by ID', async () => {
    const result = await service.getCustomerById('1');
    if (!result.success || !result.data || result.data.name !== 'John Smith') {
      throw new Error('Failed to get customer by ID');
    }
  });

  // Test: Get non-existent customer
  await test('Should return error for non-existent customer', async () => {
    const result = await service.getCustomerById('999');
    if (result.success || result.code !== 'NOT_FOUND') {
      throw new Error('Expected NOT_FOUND error');
    }
  });

  // Test: Create customer
  await test('Should create new customer', async () => {
    const result = await service.createCustomer({
      name: 'Test User',
      company: 'Test Company',
      email: 'test@example.com',
      subscriptionTier: 'premium'
    });
    if (!result.success || !result.data || result.data.name !== 'Test User') {
      throw new Error('Failed to create customer');
    }
  });

  // Test: Create customer with invalid email
  await test('Should validate email format', async () => {
    const result = await service.createCustomer({
      name: 'Test User',
      company: 'Test Company',
      email: 'invalid-email'
    });
    if (result.success || result.code !== 'VALIDATION_ERROR') {
      throw new Error('Expected VALIDATION_ERROR for invalid email');
    }
  });

  // Test: Create customer with duplicate email
  await test('Should prevent duplicate email', async () => {
    const result = await service.createCustomer({
      name: 'Another User',
      company: 'Another Company',
      email: 'john.smith@acmecorp.com' // This email already exists
    });
    if (result.success || result.code !== 'DUPLICATE_ERROR') {
      throw new Error('Expected DUPLICATE_ERROR for duplicate email');
    }
  });

  // Test: Update customer
  await test('Should update customer', async () => {
    const result = await service.updateCustomer('1', {
      name: 'John Smith Updated',
      healthScore: 90
    });
    if (!result.success || !result.data || result.data.name !== 'John Smith Updated') {
      throw new Error('Failed to update customer');
    }
  });

  // Test: Update non-existent customer
  await test('Should return error when updating non-existent customer', async () => {
    const result = await service.updateCustomer('999', { name: 'Updated Name' });
    if (result.success || result.code !== 'NOT_FOUND') {
      throw new Error('Expected NOT_FOUND error');
    }
  });

  // Test: Delete customer
  await test('Should delete customer', async () => {
    // First create a customer to delete
    const createResult = await service.createCustomer({
      name: 'To Be Deleted',
      company: 'Delete Company'
    });
    if (!createResult.success || !createResult.data) {
      throw new Error('Failed to create customer for deletion test');
    }

    const deleteResult = await service.deleteCustomer(createResult.data.id);
    if (!deleteResult.success || !deleteResult.data) {
      throw new Error('Failed to delete customer');
    }

    // Verify customer is deleted
    const getResult = await service.getCustomerById(createResult.data.id);
    if (getResult.success) {
      throw new Error('Customer should have been deleted');
    }
  });

  // Test: Search customers
  await test('Should search customers by name', async () => {
    const result = await service.searchCustomers('John');
    if (!result.success || !result.data || result.data.length === 0) {
      throw new Error('Failed to search customers');
    }
  });

  // Test: Filter customers by health score
  await test('Should filter customers by health score', async () => {
    const result = await service.getCustomersByHealthScore(80, 100);
    if (!result.success || !result.data) {
      throw new Error('Failed to filter customers by health score');
    }
    // All returned customers should have health score >= 80
    const invalidCustomers = result.data.filter(c => c.healthScore < 80);
    if (invalidCustomers.length > 0) {
      throw new Error('Health score filter not working correctly');
    }
  });

  // Test: Get customer statistics
  await test('Should get customer statistics', async () => {
    const result = await service.getCustomerStats();
    if (!result.success || !result.data || typeof result.data.total !== 'number') {
      throw new Error('Failed to get customer statistics');
    }
  });

  // Test: Pagination
  await test('Should paginate customers', async () => {
    const result = await service.getCustomers({ page: 1, limit: 5 });
    if (!result.success || !result.data || result.data.data.length !== 5) {
      throw new Error('Pagination not working correctly');
    }
  });

  console.log(`\n🧪 Tests completed: ${testsPassed}/${testsTotal} passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All tests passed!');
  } else {
    console.log(`⚠️  ${testsTotal - testsPassed} tests failed`);
  }
}

// Export for potential use in other test files
export { runTests };

// Auto-run if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runTests().catch(console.error);
}