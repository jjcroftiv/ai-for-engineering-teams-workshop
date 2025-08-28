/**
 * API Types and Interfaces
 * 
 * Comprehensive type definitions for Customer API endpoints including
 * request/response types, error handling, and validation schemas.
 */

import type { Customer } from '@/data/mock-customers';

// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  code: string;
  timestamp: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: keyof Customer;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

// Filter Types
export interface CustomerFilterParams {
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  healthScoreMin?: number;
  healthScoreMax?: number;
  company?: string;
  searchTerm?: string;
}

// Customer API Request Types
export interface CreateCustomerRequest {
  name: string;
  company: string;
  email?: string;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  domains?: string[];
}

export interface UpdateCustomerRequest {
  name?: string;
  company?: string;
  email?: string;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  domains?: string[];
  healthScore?: number;
}

export interface SearchCustomerParams {
  q: string;
  limit?: number;
}

// Customer API Response Types
export interface CustomerListResponse extends ApiResponse<PaginatedResponse<Customer>> {}

export interface CustomerResponse extends ApiResponse<Customer> {}

export interface CustomerCreateResponse extends ApiResponse<Customer> {}

export interface CustomerUpdateResponse extends ApiResponse<Customer> {}

export interface CustomerDeleteResponse extends ApiResponse<{ deleted: boolean; id: string }> {}

export interface CustomerSearchResponse extends ApiResponse<{
  results: Customer[];
  metadata: {
    searchTerm: string;
    resultCount: number;
    totalFound: number;
    limit: number;
    searchTime: number;
  };
}> {}

// Statistics Types
export interface CustomerStats {
  total: number;
  byTier: {
    basic: number;
    premium: number;
    enterprise: number;
  };
  averageHealthScore: number;
  healthDistribution: {
    healthy: number;
    warning: number;
    critical: number;
  };
  metadata: {
    generatedAt: string;
    cacheExpiry: string;
    version: string;
  };
}

export interface EnhancedCustomerStats extends CustomerStats {
  additionalMetrics: {
    tierDistribution: {
      basicPercentage: number;
      premiumPercentage: number;
      enterprisePercentage: number;
    };
    healthDistributionPercentages: {
      healthyPercentage: number;
      warningPercentage: number;
      criticalPercentage: number;
    };
    performanceMetrics: {
      responseTime: number;
      dataFreshness: string;
    };
  };
}

export interface CustomerStatsResponse extends ApiResponse<EnhancedCustomerStats> {}

// Validation Error Types
export interface ValidationError {
  field?: string;
  message: string;
  code: string;
}

export interface ValidationErrorResponse extends ApiError {
  code: 'VALIDATION_ERROR';
  validationErrors?: ValidationError[];
}

// HTTP Error Codes
export enum ApiErrorCode {
  // Validation Errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_JSON = 'INVALID_JSON',
  INVALID_BODY = 'INVALID_BODY',
  MISSING_NAME = 'MISSING_NAME',
  MISSING_COMPANY = 'MISSING_COMPANY',
  NAME_TOO_LONG = 'NAME_TOO_LONG',
  COMPANY_TOO_LONG = 'COMPANY_TOO_LONG',
  EMAIL_TOO_LONG = 'EMAIL_TOO_LONG',
  TOO_MANY_DOMAINS = 'TOO_MANY_DOMAINS',
  INVALID_ID = 'INVALID_ID',
  EMPTY_NAME = 'EMPTY_NAME',
  EMPTY_COMPANY = 'EMPTY_COMPANY',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_TIER = 'INVALID_TIER',
  INVALID_DOMAINS_FORMAT = 'INVALID_DOMAINS_FORMAT',
  INVALID_HEALTH_SCORE = 'INVALID_HEALTH_SCORE',
  NO_UPDATE_FIELDS = 'NO_UPDATE_FIELDS',
  MISSING_SEARCH_TERM = 'MISSING_SEARCH_TERM',
  INVALID_SEARCH_TERM = 'INVALID_SEARCH_TERM',
  SEARCH_TERM_TOO_SHORT = 'SEARCH_TERM_TOO_SHORT',
  SUSPICIOUS_PATTERN = 'SUSPICIOUS_PATTERN',
  INVALID_RANGE = 'INVALID_RANGE',
  
  // Client Errors (404)
  NOT_FOUND = 'NOT_FOUND',
  
  // Method Errors (405)
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  
  // Conflict Errors (409)
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  
  // Server Errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_ERROR = 'SERVICE_ERROR',
  DATA_INTEGRITY_ERROR = 'DATA_INTEGRITY_ERROR'
}

// API Route Parameters
export interface CustomerByIdParams {
  id: string;
}

// Request/Response Helper Types
export type ApiHandler<TRequest = any, TResponse = any> = (
  request: TRequest
) => Promise<ApiResponse<TResponse>>;

export type ApiRouteHandler<TParams = any, TBody = any, TResponse = any> = (
  request: Request,
  context: { params: TParams }
) => Promise<Response>;

// Type Guards
export function isApiError(response: ApiResponse): response is ApiError {
  return !response.success;
}

export function isValidationErrorResponse(response: ApiResponse): response is ValidationErrorResponse {
  return !response.success && response.code === 'VALIDATION_ERROR';
}

// Utility types for strict typing
export type CustomerListParams = CustomerFilterParams & PaginationParams;

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  timestamp: string;
};

export type CustomerApiEndpoints = {
  list: {
    method: 'GET';
    path: '/api/customers';
    params: CustomerListParams;
    response: CustomerListResponse;
  };
  create: {
    method: 'POST';
    path: '/api/customers';
    body: CreateCustomerRequest;
    response: CustomerCreateResponse;
  };
  get: {
    method: 'GET';
    path: '/api/customers/[id]';
    params: { id: string };
    response: CustomerResponse;
  };
  update: {
    method: 'PUT';
    path: '/api/customers/[id]';
    params: { id: string };
    body: UpdateCustomerRequest;
    response: CustomerUpdateResponse;
  };
  delete: {
    method: 'DELETE';
    path: '/api/customers/[id]';
    params: { id: string };
    response: CustomerDeleteResponse;
  };
  search: {
    method: 'GET';
    path: '/api/customers/search';
    params: SearchCustomerParams;
    response: CustomerSearchResponse;
  };
  stats: {
    method: 'GET';
    path: '/api/customers/stats';
    response: CustomerStatsResponse;
  };
};

// Export all types for easy importing
export type { Customer };