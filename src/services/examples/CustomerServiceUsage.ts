/**
 * CustomerService Usage Examples
 * 
 * Demonstrates how to use the CustomerService in various scenarios.
 * This file shows best practices for error handling, type safety, and business logic.
 */

import { 
  customerService, 
  CustomerCreateInput, 
  CustomerUpdateInput, 
  CustomerFilterOptions 
} from '../CustomerService';

/**
 * Example: Basic CRUD operations
 */
export async function basicCrudExample() {
  console.log('=== Basic CRUD Operations Example ===\n');

  // 1. Get all customers with pagination
  console.log('1. Getting customers with pagination...');
  const allCustomersResult = await customerService.getCustomers({
    page: 1,
    limit: 5,
    sortBy: 'healthScore',
    sortOrder: 'desc'
  });

  if (allCustomersResult.success && allCustomersResult.data) {
    console.log(`Found ${allCustomersResult.data.pagination.total} customers total`);
    console.log(`Showing page ${allCustomersResult.data.pagination.page} of ${allCustomersResult.data.pagination.totalPages}`);
    allCustomersResult.data.data.forEach(customer => {
      console.log(`- ${customer.name} (${customer.company}) - Health: ${customer.healthScore}`);
    });
  }
  console.log('');

  // 2. Get specific customer
  console.log('2. Getting specific customer...');
  const customerResult = await customerService.getCustomerById('1');
  if (customerResult.success && customerResult.data) {
    const customer = customerResult.data;
    console.log(`Customer: ${customer.name} from ${customer.company}`);
    console.log(`Email: ${customer.email}, Tier: ${customer.subscriptionTier}`);
    console.log(`Health Score: ${customer.healthScore}, Domains: ${customer.domains?.join(', ')}`);
  }
  console.log('');

  // 3. Create new customer
  console.log('3. Creating new customer...');
  const newCustomerData: CustomerCreateInput = {
    name: 'Alice Johnson',
    company: 'Innovative Solutions Ltd',
    email: 'alice@innovative-solutions.com',
    subscriptionTier: 'enterprise',
    domains: ['innovative-solutions.com', 'portal.innovative-solutions.com']
  };

  const createResult = await customerService.createCustomer(newCustomerData);
  if (createResult.success && createResult.data) {
    console.log(`Created customer: ${createResult.data.name} (ID: ${createResult.data.id})`);
    console.log(`Initial health score: ${createResult.data.healthScore}`);
  } else {
    console.error(`Failed to create customer: ${createResult.error}`);
  }
  console.log('');

  // 4. Update customer
  if (createResult.success && createResult.data) {
    console.log('4. Updating customer...');
    const updateData: CustomerUpdateInput = {
      name: 'Alice Johnson-Smith',
      healthScore: 95
    };

    const updateResult = await customerService.updateCustomer(createResult.data.id, updateData);
    if (updateResult.success && updateResult.data) {
      console.log(`Updated customer: ${updateResult.data.name}`);
      console.log(`New health score: ${updateResult.data.healthScore}`);
    }
    console.log('');

    // 5. Delete customer
    console.log('5. Deleting customer...');
    const deleteResult = await customerService.deleteCustomer(createResult.data.id);
    if (deleteResult.success) {
      console.log('Customer deleted successfully');
    }
  }
  console.log('');
}

/**
 * Example: Advanced filtering and search
 */
export async function advancedFilteringExample() {
  console.log('=== Advanced Filtering Example ===\n');

  // 1. Filter by subscription tier
  console.log('1. Enterprise customers:');
  const enterpriseResult = await customerService.getCustomersByTier('enterprise');
  if (enterpriseResult.success && enterpriseResult.data) {
    enterpriseResult.data.forEach(customer => {
      console.log(`- ${customer.name} (${customer.company}) - Health: ${customer.healthScore}`);
    });
  }
  console.log('');

  // 2. Filter by health score range
  console.log('2. Customers with critical health (0-30):');
  const criticalResult = await customerService.getCustomersByHealthScore(0, 30);
  if (criticalResult.success && criticalResult.data) {
    criticalResult.data.forEach(customer => {
      console.log(`- ${customer.name} (${customer.company}) - Health: ${customer.healthScore}`);
    });
  }
  console.log('');

  // 3. Advanced search with multiple filters
  console.log('3. Premium customers with health score > 70:');
  const filteredResult = await customerService.getCustomers({
    subscriptionTier: 'premium',
    healthScoreMin: 70,
    sortBy: 'healthScore',
    sortOrder: 'desc'
  });
  
  if (filteredResult.success && filteredResult.data) {
    filteredResult.data.data.forEach(customer => {
      console.log(`- ${customer.name} (${customer.company}) - Health: ${customer.healthScore}`);
    });
  }
  console.log('');

  // 4. Text search
  console.log('4. Searching for "Tech":');
  const searchResult = await customerService.searchCustomers('Tech');
  if (searchResult.success && searchResult.data) {
    searchResult.data.forEach(customer => {
      console.log(`- ${customer.name} (${customer.company}) - ${customer.email}`);
    });
  }
  console.log('');
}

/**
 * Example: Error handling patterns
 */
export async function errorHandlingExample() {
  console.log('=== Error Handling Example ===\n');

  // 1. Handle validation errors
  console.log('1. Testing validation errors...');
  const invalidResult = await customerService.createCustomer({
    name: '', // Invalid: empty name
    company: 'Test Company'
  });

  if (!invalidResult.success) {
    console.log(`Validation error caught: ${invalidResult.error} (Code: ${invalidResult.code})`);
  }

  // 2. Handle not found errors
  console.log('2. Testing not found errors...');
  const notFoundResult = await customerService.getCustomerById('nonexistent-id');
  if (!notFoundResult.success) {
    console.log(`Not found error caught: ${notFoundResult.error} (Code: ${notFoundResult.code})`);
  }

  // 3. Handle duplicate errors
  console.log('3. Testing duplicate errors...');
  const duplicateResult = await customerService.createCustomer({
    name: 'Test User',
    company: 'Test Company',
    email: 'john.smith@acmecorp.com' // This email already exists
  });

  if (!duplicateResult.success) {
    console.log(`Duplicate error caught: ${duplicateResult.error} (Code: ${duplicateResult.code})`);
  }
  console.log('');
}

/**
 * Example: Business intelligence queries
 */
export async function businessIntelligenceExample() {
  console.log('=== Business Intelligence Example ===\n');

  // 1. Get overall statistics
  console.log('1. Customer Statistics:');
  const statsResult = await customerService.getCustomerStats();
  if (statsResult.success && statsResult.data) {
    const stats = statsResult.data;
    console.log(`Total Customers: ${stats.total}`);
    console.log(`Average Health Score: ${stats.averageHealthScore}`);
    console.log('Subscription Distribution:');
    console.log(`- Basic: ${stats.byTier.basic}`);
    console.log(`- Premium: ${stats.byTier.premium}`);
    console.log(`- Enterprise: ${stats.byTier.enterprise}`);
    console.log('Health Distribution:');
    console.log(`- Healthy (71-100): ${stats.healthDistribution.healthy}`);
    console.log(`- Warning (31-70): ${stats.healthDistribution.warning}`);
    console.log(`- Critical (0-30): ${stats.healthDistribution.critical}`);
  }
  console.log('');

  // 2. Risk analysis - customers needing attention
  console.log('2. Risk Analysis - Customers needing attention:');
  const riskCustomersResult = await customerService.getCustomersByHealthScore(0, 40);
  if (riskCustomersResult.success && riskCustomersResult.data) {
    console.log(`Found ${riskCustomersResult.data.length} customers at risk:`);
    riskCustomersResult.data.forEach(customer => {
      const riskLevel = customer.healthScore <= 30 ? 'CRITICAL' : 'WARNING';
      console.log(`- ${customer.name} (${customer.company}) - ${riskLevel}: ${customer.healthScore}`);
    });
  }
  console.log('');

  // 3. High-value customers
  console.log('3. High-value Enterprise customers:');
  const enterpriseResult = await customerService.getCustomers({
    subscriptionTier: 'enterprise',
    healthScoreMin: 80,
    sortBy: 'healthScore',
    sortOrder: 'desc'
  });

  if (enterpriseResult.success && enterpriseResult.data) {
    console.log(`Found ${enterpriseResult.data.data.length} high-value enterprise customers:`);
    enterpriseResult.data.data.forEach(customer => {
      console.log(`- ${customer.name} (${customer.company}) - Health: ${customer.healthScore}`);
      console.log(`  Domains: ${customer.domains?.join(', ') || 'None'}`);
    });
  }
  console.log('');
}

/**
 * Example: React integration pattern
 */
export async function reactIntegrationExample() {
  console.log('=== React Integration Pattern Example ===\n');

  // This example shows how you would use the service in React components
  console.log('Example React hook usage pattern:');
  console.log(`
// hooks/useCustomers.ts
import { useState, useEffect } from 'react';
import { customerService, Customer, PaginatedResponse } from '@/services/CustomerService';

export function useCustomers(page: number = 1, limit: number = 10) {
  const [customers, setCustomers] = useState<PaginatedResponse<Customer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      setError(null);
      
      const result = await customerService.getCustomers({ page, limit });
      
      if (result.success && result.data) {
        setCustomers(result.data);
      } else {
        setError(result.error || 'Failed to fetch customers');
      }
      
      setLoading(false);
    }

    fetchCustomers();
  }, [page, limit]);

  return { customers, loading, error };
}

// components/CustomerList.tsx
export function CustomerList() {
  const { customers, loading, error } = useCustomers(1, 10);

  if (loading) return <div>Loading customers...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!customers) return <div>No customers found</div>;

  return (
    <div>
      {customers.data.map(customer => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
      <Pagination 
        current={customers.pagination.page}
        total={customers.pagination.totalPages}
      />
    </div>
  );
}
  `);
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  try {
    await basicCrudExample();
    await advancedFilteringExample();
    await errorHandlingExample();
    await businessIntelligenceExample();
    await reactIntegrationExample();
    
    console.log('🎉 All examples completed successfully!');
  } catch (error) {
    console.error('❌ Example execution failed:', error);
  }
}

// Auto-run examples if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllExamples().catch(console.error);
}