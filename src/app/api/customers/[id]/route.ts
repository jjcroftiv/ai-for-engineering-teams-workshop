/**
 * Customer API Routes by ID - GET, PUT, DELETE for individual customers
 * 
 * Provides secure, validated endpoints for individual customer operations
 * with comprehensive input sanitization, error handling, and security measures.
 */

import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/services/CustomerService';
import type { CustomerUpdateInput } from '@/services/CustomerService';

// Request type definitions
interface UpdateCustomerRequest {
  name?: string;
  company?: string;
  email?: string;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  domains?: string[];
  healthScore?: number;
}

// Input sanitization utilities (reused from main route)
function sanitizeString(input: string | null | undefined): string | undefined {
  if (!input || typeof input !== 'string') return undefined;
  
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

function validateHealthScore(score: unknown): number | undefined {
  if (typeof score !== 'number') return undefined;
  return score >= 0 && score <= 100 ? score : undefined;
}

function sanitizeId(id: string): string | null {
  if (!id || typeof id !== 'string') return null;
  
  // Remove potentially dangerous characters and limit length
  const sanitized = id.trim().replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 50);
  
  return sanitized.length > 0 ? sanitized : null;
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
 * GET /api/customers/[id] - Get customer by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = sanitizeId(id);
    
    if (!customerId) {
      return createErrorResponse('Invalid customer ID format', 400, 'INVALID_ID');
    }
    
    const result = await customerService.getCustomerById(customerId);
    
    if (!result.success) {
      // Map service errors to appropriate HTTP status codes
      let statusCode = 400;
      
      if (result.code === 'NOT_FOUND') {
        statusCode = 404;
      } else if (result.code === 'INTERNAL_ERROR') {
        statusCode = 500;
      }
      
      return createErrorResponse(result.error || 'Failed to retrieve customer', statusCode, result.code);
    }
    
    return createSuccessResponse(result.data);
    
  } catch (error) {
    const { id } = await params;
    console.error(`[API] GET /api/customers/${id} error:`, error);
    return createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR');
  }
}

/**
 * PUT /api/customers/[id] - Update customer by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = sanitizeId(id);
    
    if (!customerId) {
      return createErrorResponse('Invalid customer ID format', 400, 'INVALID_ID');
    }
    
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
    
    // Extract and sanitize input data (all optional for updates)
    const updateInput: CustomerUpdateInput = {};
    
    const name = sanitizeString(rawData.name as string);
    if (name !== undefined) {
      if (!name) {
        return createErrorResponse('Customer name cannot be empty', 400, 'EMPTY_NAME');
      }
      if (name.length > 100) {
        return createErrorResponse('Customer name must be 100 characters or less', 400, 'NAME_TOO_LONG');
      }
      updateInput.name = name;
    }
    
    const company = sanitizeString(rawData.company as string);
    if (company !== undefined) {
      if (!company) {
        return createErrorResponse('Company name cannot be empty', 400, 'EMPTY_COMPANY');
      }
      if (company.length > 100) {
        return createErrorResponse('Company name must be 100 characters or less', 400, 'COMPANY_TOO_LONG');
      }
      updateInput.company = company;
    }
    
    const email = sanitizeEmail(rawData.email as string);
    if (rawData.email !== undefined) {
      if (rawData.email === null || rawData.email === '') {
        // Allow clearing email by setting to undefined
        updateInput.email = undefined;
      } else if (email) {
        if (email.length > 254) {
          return createErrorResponse('Email address is too long', 400, 'EMAIL_TOO_LONG');
        }
        updateInput.email = email;
      } else {
        return createErrorResponse('Invalid email format', 400, 'INVALID_EMAIL');
      }
    }
    
    const subscriptionTier = validateSubscriptionTier(rawData.subscriptionTier);
    if (rawData.subscriptionTier !== undefined) {
      if (!subscriptionTier) {
        return createErrorResponse('Invalid subscription tier. Must be basic, premium, or enterprise', 400, 'INVALID_TIER');
      }
      updateInput.subscriptionTier = subscriptionTier;
    }
    
    const domains = sanitizeDomains(rawData.domains);
    if (rawData.domains !== undefined) {
      if (Array.isArray(rawData.domains)) {
        if (rawData.domains.length > 10) {
          return createErrorResponse('Maximum 10 domains allowed per customer', 400, 'TOO_MANY_DOMAINS');
        }
        updateInput.domains = domains || [];
      } else {
        return createErrorResponse('Domains must be an array of strings', 400, 'INVALID_DOMAINS_FORMAT');
      }
    }
    
    const healthScore = validateHealthScore(rawData.healthScore);
    if (rawData.healthScore !== undefined) {
      if (healthScore === undefined) {
        return createErrorResponse('Health score must be a number between 0 and 100', 400, 'INVALID_HEALTH_SCORE');
      }
      updateInput.healthScore = healthScore;
    }
    
    // Check if at least one field is provided for update
    if (Object.keys(updateInput).length === 0) {
      return createErrorResponse('At least one field must be provided for update', 400, 'NO_UPDATE_FIELDS');
    }
    
    // Call service
    const result = await customerService.updateCustomer(customerId, updateInput);
    
    if (!result.success) {
      // Map service errors to appropriate HTTP status codes
      let statusCode = 400;
      
      if (result.code === 'NOT_FOUND') {
        statusCode = 404;
      } else if (result.code === 'DUPLICATE_ERROR') {
        statusCode = 409; // Conflict
      } else if (result.code === 'INTERNAL_ERROR') {
        statusCode = 500;
      }
      
      return createErrorResponse(result.error || 'Failed to update customer', statusCode, result.code);
    }
    
    return createSuccessResponse(result.data);
    
  } catch (error) {
    const { id } = await params;
    console.error(`[API] PUT /api/customers/${id} error:`, error);
    return createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR');
  }
}

/**
 * DELETE /api/customers/[id] - Delete customer by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = sanitizeId(id);
    
    if (!customerId) {
      return createErrorResponse('Invalid customer ID format', 400, 'INVALID_ID');
    }
    
    const result = await customerService.deleteCustomer(customerId);
    
    if (!result.success) {
      // Map service errors to appropriate HTTP status codes
      let statusCode = 400;
      
      if (result.code === 'NOT_FOUND') {
        statusCode = 404;
      } else if (result.code === 'INTERNAL_ERROR') {
        statusCode = 500;
      }
      
      return createErrorResponse(result.error || 'Failed to delete customer', statusCode, result.code);
    }
    
    return createSuccessResponse({ deleted: true, id: customerId });
    
  } catch (error) {
    const { id } = await params;
    console.error(`[API] DELETE /api/customers/${id} error:`, error);
    return createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR');
  }
}

// Security headers middleware for all requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  });
}