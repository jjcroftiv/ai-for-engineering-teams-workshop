/**
 * Customer API Routes - GET (list), POST (create)
 * 
 * Provides secure, validated endpoints for customer list and creation operations
 * with comprehensive input sanitization, error handling, and security measures.
 */

import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/services/CustomerService';
import type { 
  CustomerCreateInput, 
  CustomerFilterOptions, 
  PaginationOptions 
} from '@/services/CustomerService';
import type { Customer } from '@/data/mock-customers';

// Request/Response type definitions
interface CreateCustomerRequest {
  name: string;
  company: string;
  email?: string;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  domains?: string[];
}

interface ListCustomersQuery extends CustomerFilterOptions, PaginationOptions {}

// Input sanitization utilities
function sanitizeString(input: string | null | undefined): string | undefined {
  if (!input || typeof input !== 'string') return undefined;
  
  // Remove potentially dangerous characters while preserving legitimate content
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML/XML tags
    .replace(/[{}]/g, '') // Remove potential template injection
    .substring(0, 1000); // Prevent extremely long inputs
}

function sanitizeEmail(email: string | null | undefined): string | undefined {
  if (!email || typeof email !== 'string') return undefined;
  
  const sanitized = sanitizeString(email);
  if (!sanitized) return undefined;
  
  // Basic email format validation with security considerations
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(sanitized) ? sanitized.toLowerCase() : undefined;
}

function sanitizeDomains(domains: unknown): string[] | undefined {
  if (!Array.isArray(domains)) return undefined;
  
  const sanitizedDomains = domains
    .filter((domain): domain is string => typeof domain === 'string')
    .map(domain => sanitizeString(domain))
    .filter((domain): domain is string => {
      if (!domain) return false;
      // Domain validation regex
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}(\.[a-zA-Z]{2,})*)$/;
      return domainRegex.test(domain) && domain.length <= 253;
    });
  
  return sanitizedDomains.length > 0 ? sanitizedDomains : undefined;
}

function validateSubscriptionTier(tier: unknown): 'basic' | 'premium' | 'enterprise' | undefined {
  if (typeof tier !== 'string') return undefined;
  const validTiers = ['basic', 'premium', 'enterprise'] as const;
  return validTiers.includes(tier as any) ? tier as 'basic' | 'premium' | 'enterprise' : undefined;
}

function parseNumericParam(param: string | null, min = 0, max = Number.MAX_SAFE_INTEGER): number | undefined {
  if (!param) return undefined;
  const num = parseInt(param, 10);
  return !isNaN(num) && num >= min && num <= max ? num : undefined;
}

// Error response utilities
function createErrorResponse(message: string, status = 400, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: code || 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    },
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    }
  );
}

function createSuccessResponse(data: any, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString()
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    }
  );
}

/**
 * GET /api/customers - List customers with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract and sanitize query parameters
    const options: ListCustomersQuery = {};
    
    // Pagination parameters
    const page = parseNumericParam(searchParams.get('page'), 1, 1000);
    const limit = parseNumericParam(searchParams.get('limit'), 1, 100);
    
    if (page) options.page = page;
    if (limit) options.limit = limit;
    
    // Sorting parameters
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');
    
    if (sortBy && ['id', 'name', 'company', 'healthScore', 'createdAt', 'updatedAt'].includes(sortBy)) {
      options.sortBy = sortBy as keyof Customer;
    }
    
    if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
      options.sortOrder = sortOrder as 'asc' | 'desc';
    }
    
    // Filter parameters
    const subscriptionTier = validateSubscriptionTier(searchParams.get('subscriptionTier'));
    if (subscriptionTier) options.subscriptionTier = subscriptionTier;
    
    const healthScoreMin = parseNumericParam(searchParams.get('healthScoreMin'), 0, 100);
    const healthScoreMax = parseNumericParam(searchParams.get('healthScoreMax'), 0, 100);
    
    if (healthScoreMin !== undefined) options.healthScoreMin = healthScoreMin;
    if (healthScoreMax !== undefined) options.healthScoreMax = healthScoreMax;
    
    const company = sanitizeString(searchParams.get('company'));
    if (company) options.company = company;
    
    const searchTerm = sanitizeString(searchParams.get('searchTerm'));
    if (searchTerm) options.searchTerm = searchTerm;
    
    // Validate health score range
    if (healthScoreMin !== undefined && healthScoreMax !== undefined && healthScoreMin > healthScoreMax) {
      return createErrorResponse('healthScoreMin cannot be greater than healthScoreMax', 400, 'INVALID_RANGE');
    }
    
    // Call service
    const result = await customerService.getCustomers(options);
    
    if (!result.success) {
      return createErrorResponse(result.error || 'Failed to retrieve customers', 500, result.code);
    }
    
    return createSuccessResponse(result.data);
    
  } catch (error) {
    console.error('[API] GET /api/customers error:', error);
    return createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR');
  }
}

/**
 * POST /api/customers - Create new customer
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let body: unknown;
    
    try {
      body = await request.json();
    } catch (error) {
      return createErrorResponse('Invalid JSON in request body', 400, 'INVALID_JSON');
    }
    
    if (!body || typeof body !== 'object') {
      return createErrorResponse('Request body must be a valid JSON object', 400, 'INVALID_BODY');
    }
    
    const rawData = body as Record<string, unknown>;
    
    // Extract and sanitize input data
    const name = sanitizeString(rawData.name as string);
    const company = sanitizeString(rawData.company as string);
    const email = sanitizeEmail(rawData.email as string);
    const subscriptionTier = validateSubscriptionTier(rawData.subscriptionTier);
    const domains = sanitizeDomains(rawData.domains);
    
    // Validate required fields
    if (!name) {
      return createErrorResponse('Customer name is required and must be a valid string', 400, 'MISSING_NAME');
    }
    
    if (!company) {
      return createErrorResponse('Company name is required and must be a valid string', 400, 'MISSING_COMPANY');
    }
    
    // Additional validation
    if (name.length > 100) {
      return createErrorResponse('Customer name must be 100 characters or less', 400, 'NAME_TOO_LONG');
    }
    
    if (company.length > 100) {
      return createErrorResponse('Company name must be 100 characters or less', 400, 'COMPANY_TOO_LONG');
    }
    
    if (email && email.length > 254) {
      return createErrorResponse('Email address is too long', 400, 'EMAIL_TOO_LONG');
    }
    
    if (domains && domains.length > 10) {
      return createErrorResponse('Maximum 10 domains allowed per customer', 400, 'TOO_MANY_DOMAINS');
    }
    
    // Prepare input for service
    const createInput: CustomerCreateInput = {
      name,
      company,
      email,
      subscriptionTier: subscriptionTier || 'basic',
      domains
    };
    
    // Call service
    const result = await customerService.createCustomer(createInput);
    
    if (!result.success) {
      // Map service errors to appropriate HTTP status codes
      let statusCode = 400;
      
      if (result.code === 'DUPLICATE_ERROR') {
        statusCode = 409; // Conflict
      } else if (result.code === 'INTERNAL_ERROR') {
        statusCode = 500;
      }
      
      return createErrorResponse(result.error || 'Failed to create customer', statusCode, result.code);
    }
    
    return createSuccessResponse(result.data, 201);
    
  } catch (error) {
    console.error('[API] POST /api/customers error:', error);
    return createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR');
  }
}

// Security headers middleware for all requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  });
}