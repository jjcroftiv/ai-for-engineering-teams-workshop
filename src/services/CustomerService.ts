/**
 * CustomerService - Complete CRUD operations for Customer management
 * 
 * Provides data abstraction layer for customer operations with comprehensive
 * error handling, validation, and business logic. Designed for easy transition
 * from mock data to real API integration.
 */

import { Customer, mockCustomers } from '@/data/mock-customers';

// Service-specific interfaces and types
export interface CustomerCreateInput {
  name: string;
  company: string;
  email?: string;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  domains?: string[];
}

export interface CustomerUpdateInput {
  name?: string;
  company?: string;
  email?: string;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  domains?: string[];
  healthScore?: number;
}

export interface CustomerFilterOptions {
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  healthScoreMin?: number;
  healthScoreMax?: number;
  company?: string;
  searchTerm?: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: keyof Customer;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Custom error types for better error handling
export class CustomerServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'CustomerServiceError';
  }
}

export class ValidationError extends CustomerServiceError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends CustomerServiceError {
  constructor(id: string) {
    super(`Customer with ID '${id}' not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends CustomerServiceError {
  constructor(field: string, value: string) {
    super(`Customer with ${field} '${value}' already exists`, 'DUPLICATE_ERROR', 409);
    this.name = 'DuplicateError';
  }
}

/**
 * CustomerService class providing comprehensive CRUD operations
 * with validation, error handling, and business logic
 */
export class CustomerService {
  private customers: Customer[] = [...mockCustomers];
  private nextId: number = 9; // Start from 9 since mock data has 8 customers

  /**
   * Get all customers with optional filtering and pagination
   */
  async getCustomers(
    options: CustomerFilterOptions & PaginationOptions = {}
  ): Promise<ServiceResponse<PaginatedResponse<Customer>>> {
    try {
      this.logOperation('getCustomers', { options });

      let filteredCustomers = [...this.customers];

      // Apply filters
      if (options.subscriptionTier) {
        filteredCustomers = filteredCustomers.filter(
          customer => customer.subscriptionTier === options.subscriptionTier
        );
      }

      if (options.healthScoreMin !== undefined) {
        filteredCustomers = filteredCustomers.filter(
          customer => customer.healthScore >= options.healthScoreMin!
        );
      }

      if (options.healthScoreMax !== undefined) {
        filteredCustomers = filteredCustomers.filter(
          customer => customer.healthScore <= options.healthScoreMax!
        );
      }

      if (options.company) {
        filteredCustomers = filteredCustomers.filter(
          customer => customer.company.toLowerCase().includes(options.company!.toLowerCase())
        );
      }

      if (options.searchTerm) {
        const searchLower = options.searchTerm.toLowerCase();
        filteredCustomers = filteredCustomers.filter(
          customer =>
            customer.name.toLowerCase().includes(searchLower) ||
            customer.company.toLowerCase().includes(searchLower) ||
            customer.email?.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      if (options.sortBy) {
        filteredCustomers.sort((a, b) => {
          const aValue = a[options.sortBy!];
          const bValue = b[options.sortBy!];
          const modifier = options.sortOrder === 'desc' ? -1 : 1;

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue) * modifier;
          }

          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return (aValue - bValue) * modifier;
          }

          return 0;
        });
      }

      // Apply pagination
      const page = options.page || 1;
      const limit = options.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

      const response: PaginatedResponse<Customer> = {
        data: paginatedCustomers,
        pagination: {
          page,
          limit,
          total: filteredCustomers.length,
          totalPages: Math.ceil(filteredCustomers.length / limit)
        }
      };

      return { success: true, data: response };
    } catch (error) {
      return this.handleError('getCustomers', error);
    }
  }

  /**
   * Get a single customer by ID
   */
  async getCustomerById(id: string): Promise<ServiceResponse<Customer>> {
    try {
      this.logOperation('getCustomerById', { id });

      if (!id || id.trim() === '') {
        throw new ValidationError('Customer ID is required', 'id');
      }

      const customer = this.customers.find(c => c.id === id);
      if (!customer) {
        throw new NotFoundError(id);
      }

      return { success: true, data: customer };
    } catch (error) {
      return this.handleError('getCustomerById', error);
    }
  }

  /**
   * Create a new customer
   */
  async createCustomer(input: CustomerCreateInput): Promise<ServiceResponse<Customer>> {
    try {
      this.logOperation('createCustomer', { input: { ...input, email: input.email ? '***' : undefined } });

      // Validation
      this.validateCustomerInput(input);

      // Check for duplicate email
      if (input.email && this.customers.some(c => c.email === input.email)) {
        throw new DuplicateError('email', input.email);
      }

      // Generate new customer
      const now = new Date().toISOString();
      const newCustomer: Customer = {
        id: this.nextId.toString(),
        name: input.name.trim(),
        company: input.company.trim(),
        email: input.email?.trim(),
        subscriptionTier: input.subscriptionTier || 'basic',
        domains: input.domains || [],
        healthScore: this.calculateInitialHealthScore(input),
        createdAt: now,
        updatedAt: now
      };

      this.customers.push(newCustomer);
      this.nextId++;

      return { success: true, data: newCustomer };
    } catch (error) {
      return this.handleError('createCustomer', error);
    }
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(id: string, input: CustomerUpdateInput): Promise<ServiceResponse<Customer>> {
    try {
      this.logOperation('updateCustomer', { id, input: { ...input, email: input.email ? '***' : undefined } });

      if (!id || id.trim() === '') {
        throw new ValidationError('Customer ID is required', 'id');
      }

      const customerIndex = this.customers.findIndex(c => c.id === id);
      if (customerIndex === -1) {
        throw new NotFoundError(id);
      }

      // Validate update input
      this.validateCustomerUpdateInput(input);

      // Check for duplicate email (excluding current customer)
      if (input.email && this.customers.some(c => c.id !== id && c.email === input.email)) {
        throw new DuplicateError('email', input.email);
      }

      // Update customer
      const existingCustomer = this.customers[customerIndex];
      const updatedCustomer: Customer = {
        ...existingCustomer,
        ...Object.fromEntries(
          Object.entries(input).filter(([_, value]) => value !== undefined)
        ),
        updatedAt: new Date().toISOString()
      };

      // Ensure trimmed strings
      if (input.name) updatedCustomer.name = input.name.trim();
      if (input.company) updatedCustomer.company = input.company.trim();
      if (input.email) updatedCustomer.email = input.email.trim();

      // Recalculate health score if business-relevant fields changed
      if (input.subscriptionTier || input.domains) {
        updatedCustomer.healthScore = this.calculateHealthScore(updatedCustomer);
      }

      this.customers[customerIndex] = updatedCustomer;

      return { success: true, data: updatedCustomer };
    } catch (error) {
      return this.handleError('updateCustomer', error);
    }
  }

  /**
   * Delete a customer by ID
   */
  async deleteCustomer(id: string): Promise<ServiceResponse<boolean>> {
    try {
      this.logOperation('deleteCustomer', { id });

      if (!id || id.trim() === '') {
        throw new ValidationError('Customer ID is required', 'id');
      }

      const customerIndex = this.customers.findIndex(c => c.id === id);
      if (customerIndex === -1) {
        throw new NotFoundError(id);
      }

      this.customers.splice(customerIndex, 1);

      return { success: true, data: true };
    } catch (error) {
      return this.handleError('deleteCustomer', error);
    }
  }

  /**
   * Get customers by health score range
   */
  async getCustomersByHealthScore(
    minScore: number = 0,
    maxScore: number = 100
  ): Promise<ServiceResponse<Customer[]>> {
    try {
      this.logOperation('getCustomersByHealthScore', { minScore, maxScore });

      if (minScore < 0 || maxScore > 100 || minScore > maxScore) {
        throw new ValidationError('Invalid health score range. Must be 0-100 with min <= max');
      }

      const customers = this.customers.filter(
        customer => customer.healthScore >= minScore && customer.healthScore <= maxScore
      );

      return { success: true, data: customers };
    } catch (error) {
      return this.handleError('getCustomersByHealthScore', error);
    }
  }

  /**
   * Get customers by subscription tier
   */
  async getCustomersByTier(tier: 'basic' | 'premium' | 'enterprise'): Promise<ServiceResponse<Customer[]>> {
    try {
      this.logOperation('getCustomersByTier', { tier });

      const customers = this.customers.filter(customer => customer.subscriptionTier === tier);

      return { success: true, data: customers };
    } catch (error) {
      return this.handleError('getCustomersByTier', error);
    }
  }

  /**
   * Search customers by name, company, or email
   */
  async searchCustomers(searchTerm: string): Promise<ServiceResponse<Customer[]>> {
    try {
      this.logOperation('searchCustomers', { searchTerm: searchTerm ? '***' : '' });

      if (!searchTerm || searchTerm.trim() === '') {
        return { success: true, data: [] };
      }

      const searchLower = searchTerm.toLowerCase().trim();
      const customers = this.customers.filter(
        customer =>
          customer.name.toLowerCase().includes(searchLower) ||
          customer.company.toLowerCase().includes(searchLower) ||
          customer.email?.toLowerCase().includes(searchLower)
      );

      return { success: true, data: customers };
    } catch (error) {
      return this.handleError('searchCustomers', error);
    }
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(): Promise<ServiceResponse<{
    total: number;
    byTier: { basic: number; premium: number; enterprise: number };
    averageHealthScore: number;
    healthDistribution: { healthy: number; warning: number; critical: number };
  }>> {
    try {
      this.logOperation('getCustomerStats', {});

      const stats = {
        total: this.customers.length,
        byTier: {
          basic: this.customers.filter(c => c.subscriptionTier === 'basic').length,
          premium: this.customers.filter(c => c.subscriptionTier === 'premium').length,
          enterprise: this.customers.filter(c => c.subscriptionTier === 'enterprise').length
        },
        averageHealthScore: Math.round(
          this.customers.reduce((sum, c) => sum + c.healthScore, 0) / this.customers.length
        ),
        healthDistribution: {
          healthy: this.customers.filter(c => c.healthScore >= 71).length,
          warning: this.customers.filter(c => c.healthScore >= 31 && c.healthScore <= 70).length,
          critical: this.customers.filter(c => c.healthScore <= 30).length
        }
      };

      return { success: true, data: stats };
    } catch (error) {
      return this.handleError('getCustomerStats', error);
    }
  }

  // Private validation methods
  private validateCustomerInput(input: CustomerCreateInput): void {
    if (!input.name || input.name.trim() === '') {
      throw new ValidationError('Customer name is required', 'name');
    }

    if (!input.company || input.company.trim() === '') {
      throw new ValidationError('Company name is required', 'company');
    }

    if (input.name.trim().length > 100) {
      throw new ValidationError('Customer name must be less than 100 characters', 'name');
    }

    if (input.company.trim().length > 100) {
      throw new ValidationError('Company name must be less than 100 characters', 'company');
    }

    if (input.email && !this.isValidEmail(input.email)) {
      throw new ValidationError('Invalid email format', 'email');
    }

    if (input.domains) {
      input.domains.forEach((domain, index) => {
        if (!this.isValidDomain(domain)) {
          throw new ValidationError(`Invalid domain format at index ${index}: ${domain}`, 'domains');
        }
      });
    }
  }

  private validateCustomerUpdateInput(input: CustomerUpdateInput): void {
    if (input.name !== undefined && (!input.name || input.name.trim() === '')) {
      throw new ValidationError('Customer name cannot be empty', 'name');
    }

    if (input.company !== undefined && (!input.company || input.company.trim() === '')) {
      throw new ValidationError('Company name cannot be empty', 'company');
    }

    if (input.name && input.name.trim().length > 100) {
      throw new ValidationError('Customer name must be less than 100 characters', 'name');
    }

    if (input.company && input.company.trim().length > 100) {
      throw new ValidationError('Company name must be less than 100 characters', 'company');
    }

    if (input.email && !this.isValidEmail(input.email)) {
      throw new ValidationError('Invalid email format', 'email');
    }

    if (input.healthScore !== undefined && (input.healthScore < 0 || input.healthScore > 100)) {
      throw new ValidationError('Health score must be between 0 and 100', 'healthScore');
    }

    if (input.domains) {
      input.domains.forEach((domain, index) => {
        if (!this.isValidDomain(domain)) {
          throw new ValidationError(`Invalid domain format at index ${index}: ${domain}`, 'domains');
        }
      });
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}(\.[a-zA-Z]{2,})*)$/;
    return domainRegex.test(domain.trim()) && domain.length <= 253;
  }

  private calculateInitialHealthScore(input: CustomerCreateInput): number {
    let score = 50; // Base score

    // Subscription tier bonus
    switch (input.subscriptionTier) {
      case 'enterprise':
        score += 30;
        break;
      case 'premium':
        score += 15;
        break;
      case 'basic':
        score += 5;
        break;
    }

    // Domain count bonus (more domains = more engagement)
    if (input.domains) {
      score += Math.min(input.domains.length * 5, 20); // Max 20 points for domains
    }

    // Email presence bonus
    if (input.email) {
      score += 10;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  private calculateHealthScore(customer: Customer): number {
    // This is a simplified health score calculation
    // In a real system, this would incorporate actual usage data, payment history, etc.
    let score = 50;

    switch (customer.subscriptionTier) {
      case 'enterprise':
        score += 30;
        break;
      case 'premium':
        score += 15;
        break;
      case 'basic':
        score += 5;
        break;
    }

    if (customer.domains) {
      score += Math.min(customer.domains.length * 5, 20);
    }

    if (customer.email) {
      score += 10;
    }

    // Account age bonus (assuming older accounts are more stable)
    if (customer.createdAt) {
      const accountAge = Date.now() - new Date(customer.createdAt).getTime();
      const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
      score += Math.min(daysSinceCreation / 10, 15); // Max 15 points for account age
    }

    return Math.min(Math.max(Math.round(score), 0), 100);
  }

  private logOperation(operation: string, data: any): void {
    // In a real application, this would use a proper logging library
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CustomerService] ${operation}:`, data);
    }
  }

  private handleError(operation: string, error: unknown): ServiceResponse<any> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorCode = error instanceof CustomerServiceError ? error.code : 'INTERNAL_ERROR';

    console.error(`[CustomerService] ${operation} failed:`, error);

    return {
      success: false,
      error: errorMessage,
      code: errorCode
    };
  }

  // Utility methods for data management
  resetData(): void {
    this.customers = [...mockCustomers];
    this.nextId = 9;
    this.logOperation('resetData', { count: this.customers.length });
  }

  getDataSnapshot(): Customer[] {
    return [...this.customers];
  }
}

// Create singleton instance that survives hot reloads in development
declare global {
  var customerServiceInstance: CustomerService | undefined;
}

function createCustomerService(): CustomerService {
  if (typeof window !== 'undefined') {
    // Client-side: always create new instance
    return new CustomerService();
  }
  
  // Server-side: use global to persist across hot reloads
  if (!global.customerServiceInstance) {
    global.customerServiceInstance = new CustomerService();
  }
  
  return global.customerServiceInstance;
}

// Singleton instance for application use
export const customerService = createCustomerService();

export default customerService;