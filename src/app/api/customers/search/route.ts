/**
 * Customer Search API Route - GET for searching customers
 * 
 * Provides secure search functionality with input sanitization,
 * query validation, and comprehensive error handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/services/CustomerService';

// Input sanitization utilities
function sanitizeSearchTerm(input: string | null | undefined): string | undefined {
  if (!input || typeof input !== 'string') return undefined;
  
  // Remove potentially dangerous characters while preserving search functionality
  const sanitized = input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML/XML tags
    .replace(/[{}]/g, '') // Remove potential template injection
    .replace(/[^\w\s@.-]/g, '') // Only allow alphanumeric, whitespace, @, ., and -
    .substring(0, 100); // Limit search term length
  
  return sanitized.length > 0 ? sanitized : undefined;
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
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
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
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'no-cache, no-store, must-revalidate' // Prevent caching of search results
      }
    }
  );
}

/**
 * GET /api/customers/search - Search customers by name, company, or email
 * 
 * Query parameters:
 * - q: Search term (required)
 * - limit: Maximum number of results (optional, default: 20, max: 100)
 * 
 * Security features:
 * - Input sanitization to prevent injection attacks
 * - Search term length limits
 * - Rate limiting considerations (logging for monitoring)
 * - No caching of sensitive search results
 */
export async function GET(request: NextRequest) {
  const requestStart = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract and sanitize search parameters
    const rawSearchTerm = searchParams.get('q');
    const rawLimit = searchParams.get('limit');
    
    // Validate and sanitize search term
    if (!rawSearchTerm) {
      return createErrorResponse('Search term is required. Use the "q" query parameter.', 400, 'MISSING_SEARCH_TERM');
    }
    
    const searchTerm = sanitizeSearchTerm(rawSearchTerm);
    
    if (!searchTerm) {
      return createErrorResponse('Invalid search term. Search term must contain valid characters and be non-empty.', 400, 'INVALID_SEARCH_TERM');
    }
    
    // Validate minimum search term length to prevent overly broad searches
    if (searchTerm.length < 2) {
      return createErrorResponse('Search term must be at least 2 characters long.', 400, 'SEARCH_TERM_TOO_SHORT');
    }
    
    // Validate and sanitize limit parameter
    const limit = parseNumericParam(rawLimit, 1, 100) || 20; // Default to 20, max 100
    
    // Log search request for monitoring and rate limiting analysis
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    console.log(`[API] Search request: term="${searchTerm.substring(0, 20)}${searchTerm.length > 20 ? '...' : ''}", ` +
                `limit=${limit}, ip=${clientIP}, timestamp=${new Date().toISOString()}`);
    
    // Check for potential abuse patterns (very basic detection)
    const suspiciousPatterns = [
      /[<>]/,           // HTML tags
      /javascript:/i,   // JavaScript protocol
      /data:/i,         // Data protocol
      /vbscript:/i,     // VBScript protocol
      /on\w+=/i,        // Event handlers
      /{{\s*\w+\s*}}/,  // Template expressions
      /\$\{.*\}/,       // Template literals
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(rawSearchTerm));
    
    if (isSuspicious) {
      console.warn(`[API] Suspicious search pattern detected: ${rawSearchTerm} from IP: ${clientIP}`);
      return createErrorResponse('Invalid search term format.', 400, 'SUSPICIOUS_PATTERN');
    }
    
    // Perform the search
    const result = await customerService.searchCustomers(searchTerm);
    
    if (!result.success) {
      console.error(`[API] Search service error: ${result.error}, code: ${result.code}`);
      return createErrorResponse(result.error || 'Search failed', 500, result.code);
    }
    
    // Apply limit to results (additional safety check)
    const limitedResults = result.data?.slice(0, limit) || [];
    
    // Prepare response with metadata
    const responseData = {
      results: limitedResults,
      metadata: {
        searchTerm: searchTerm,
        resultCount: limitedResults.length,
        totalFound: result.data?.length || 0,
        limit: limit,
        searchTime: Date.now() - requestStart
      }
    };
    
    // Log successful search completion
    console.log(`[API] Search completed: found ${responseData.metadata.totalFound} results, ` +
                `returned ${responseData.metadata.resultCount}, time: ${responseData.metadata.searchTime}ms`);
    
    return createSuccessResponse(responseData);
    
  } catch (error) {
    const searchTime = Date.now() - requestStart;
    console.error(`[API] GET /api/customers/search error (${searchTime}ms):`, error);
    
    // Don't expose internal error details to client
    return createErrorResponse('Internal server error occurred during search', 500, 'INTERNAL_ERROR');
  }
}

/**
 * POST method not allowed - search should be done via GET for caching and RESTful design
 */
export async function POST() {
  return createErrorResponse('POST method not allowed for search. Use GET with query parameters.', 405, 'METHOD_NOT_ALLOWED');
}

/**
 * PUT method not allowed
 */
export async function PUT() {
  return createErrorResponse('PUT method not allowed for search endpoint.', 405, 'METHOD_NOT_ALLOWED');
}

/**
 * DELETE method not allowed
 */
export async function DELETE() {
  return createErrorResponse('DELETE method not allowed for search endpoint.', 405, 'METHOD_NOT_ALLOWED');
}

// Security headers middleware for all requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}