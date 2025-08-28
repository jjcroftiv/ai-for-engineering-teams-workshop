/**
 * API Security Utilities
 * 
 * Comprehensive security utilities for input validation, sanitization,
 * and protection against common web vulnerabilities in API endpoints.
 */

import { NextResponse } from 'next/server';
import type { ApiResponse, ApiError, ValidationError } from '@/types/api';

// Security Configuration
const SECURITY_CONFIG = {
  maxStringLength: 1000,
  maxEmailLength: 254,
  maxNameLength: 100,
  maxCompanyLength: 100,
  maxDomainLength: 253,
  maxDomainsPerCustomer: 10,
  minSearchTermLength: 2,
  maxSearchTermLength: 100,
  maxIdLength: 50,
  
  // Rate limiting (for future implementation)
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
  
  // Suspicious patterns to detect potential attacks
  suspiciousPatterns: [
    /[<>]/,           // HTML tags
    /javascript:/i,   // JavaScript protocol
    /data:/i,         // Data protocol
    /vbscript:/i,     // VBScript protocol
    /on\w+=/i,        // Event handlers
    /{{\s*\w+\s*}}/,  // Template expressions
    /\$\{.*\}/,       // Template literals
    /\[\[.*\]\]/,     // Template expressions
    /<%.*%>/,         // Server-side includes
    /\x00/,           // Null bytes
  ] as RegExp[]
};

// Input Sanitization Functions
export class InputSanitizer {
  /**
   * Sanitize a general string input
   */
  static sanitizeString(input: string | null | undefined, maxLength = SECURITY_CONFIG.maxStringLength): string | undefined {
    if (!input || typeof input !== 'string') return undefined;
    
    // Remove potentially dangerous characters while preserving legitimate content
    const sanitized = input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML/XML tags
      .replace(/[{}]/g, '') // Remove potential template injection
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .substring(0, maxLength);
    
    return sanitized.length > 0 ? sanitized : undefined;
  }

  /**
   * Sanitize email address with format validation
   */
  static sanitizeEmail(email: string | null | undefined): string | undefined {
    if (!email || typeof email !== 'string') return undefined;
    
    const sanitized = this.sanitizeString(email, SECURITY_CONFIG.maxEmailLength);
    if (!sanitized) return undefined;
    
    // Comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitized)) return undefined;
    
    // Additional security checks
    if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.endsWith('.')) {
      return undefined;
    }
    
    return sanitized.toLowerCase();
  }

  /**
   * Sanitize domain names array
   */
  static sanitizeDomains(domains: unknown): string[] | undefined {
    if (!Array.isArray(domains)) return undefined;
    
    if (domains.length > SECURITY_CONFIG.maxDomainsPerCustomer) return undefined;
    
    const sanitizedDomains = domains
      .filter((domain): domain is string => typeof domain === 'string')
      .map(domain => this.sanitizeString(domain, SECURITY_CONFIG.maxDomainLength))
      .filter((domain): domain is string => {
        if (!domain) return false;
        
        // Domain validation regex - more comprehensive
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}(\.[a-zA-Z]{2,})*)$/;
        
        // Additional domain security checks
        const isValidFormat = domainRegex.test(domain);
        const hasValidLength = domain.length >= 4 && domain.length <= SECURITY_CONFIG.maxDomainLength;
        const noConsecutiveDots = !domain.includes('..');
        const noStartEndHyphen = !domain.startsWith('-') && !domain.endsWith('-');
        
        return isValidFormat && hasValidLength && noConsecutiveDots && noStartEndHyphen;
      });
    
    return sanitizedDomains.length > 0 ? sanitizedDomains : undefined;
  }

  /**
   * Sanitize customer ID
   */
  static sanitizeId(id: string): string | null {
    if (!id || typeof id !== 'string') return null;
    
    // Remove potentially dangerous characters and limit length
    const sanitized = id
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, '')
      .substring(0, SECURITY_CONFIG.maxIdLength);
    
    return sanitized.length > 0 ? sanitized : null;
  }

  /**
   * Sanitize search term with security checks
   */
  static sanitizeSearchTerm(input: string | null | undefined): string | undefined {
    if (!input || typeof input !== 'string') return undefined;
    
    // Check for suspicious patterns first
    const isSuspicious = SECURITY_CONFIG.suspiciousPatterns.some(pattern => pattern.test(input));
    if (isSuspicious) return undefined;
    
    // Sanitize allowing more characters for search functionality
    const sanitized = input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML/XML tags
      .replace(/[{}]/g, '') // Remove potential template injection
      .replace(/[^\w\s@.-]/g, '') // Only allow alphanumeric, whitespace, @, ., and -
      .substring(0, SECURITY_CONFIG.maxSearchTermLength);
    
    return sanitized.length >= SECURITY_CONFIG.minSearchTermLength ? sanitized : undefined;
  }
}

// Validation Functions
export class InputValidator {
  /**
   * Validate subscription tier
   */
  static validateSubscriptionTier(tier: unknown): 'basic' | 'premium' | 'enterprise' | undefined {
    if (typeof tier !== 'string') return undefined;
    const validTiers = ['basic', 'premium', 'enterprise'] as const;
    return validTiers.includes(tier as any) ? tier as 'basic' | 'premium' | 'enterprise' : undefined;
  }

  /**
   * Validate health score
   */
  static validateHealthScore(score: unknown): number | undefined {
    if (typeof score !== 'number') return undefined;
    if (isNaN(score) || !isFinite(score)) return undefined;
    return score >= 0 && score <= 100 ? score : undefined;
  }

  /**
   * Parse and validate numeric parameter
   */
  static parseNumericParam(param: string | null, min = 0, max = Number.MAX_SAFE_INTEGER): number | undefined {
    if (!param) return undefined;
    const num = parseInt(param, 10);
    return !isNaN(num) && num >= min && num <= max ? num : undefined;
  }

  /**
   * Validate customer name
   */
  static validateCustomerName(name: string | undefined): ValidationError | null {
    if (!name) {
      return { message: 'Customer name is required', code: 'MISSING_NAME' };
    }
    if (name.length > SECURITY_CONFIG.maxNameLength) {
      return { 
        field: 'name',
        message: `Customer name must be ${SECURITY_CONFIG.maxNameLength} characters or less`, 
        code: 'NAME_TOO_LONG' 
      };
    }
    return null;
  }

  /**
   * Validate company name
   */
  static validateCompanyName(company: string | undefined): ValidationError | null {
    if (!company) {
      return { message: 'Company name is required', code: 'MISSING_COMPANY' };
    }
    if (company.length > SECURITY_CONFIG.maxCompanyLength) {
      return { 
        field: 'company',
        message: `Company name must be ${SECURITY_CONFIG.maxCompanyLength} characters or less`, 
        code: 'COMPANY_TOO_LONG' 
      };
    }
    return null;
  }

  /**
   * Validate email format and length
   */
  static validateEmail(email: string | undefined): ValidationError | null {
    if (!email) return null; // Email is optional
    
    if (email.length > SECURITY_CONFIG.maxEmailLength) {
      return {
        field: 'email',
        message: 'Email address is too long',
        code: 'EMAIL_TOO_LONG'
      };
    }
    
    return null; // Additional validation done in sanitizeEmail
  }
}

// Security Detection Functions
export class SecurityDetector {
  /**
   * Detect suspicious patterns in input
   */
  static detectSuspiciousPatterns(input: string): boolean {
    return SECURITY_CONFIG.suspiciousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Log security events
   */
  static logSecurityEvent(event: string, details: Record<string, any>, clientIP?: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      clientIP: clientIP || 'unknown',
      ...details
    };
    
    console.warn(`[SECURITY] ${event}:`, logEntry);
    
    // In production, this would integrate with security monitoring systems
    // Examples: Sentry, DataDog, CloudWatch, etc.
  }

  /**
   * Extract client IP from request headers
   */
  static getClientIP(headers: Headers): string {
    return headers.get('x-forwarded-for') || 
           headers.get('x-real-ip') || 
           headers.get('cf-connecting-ip') || // Cloudflare
           'unknown';
  }
}

// Response Creation Utilities
export class ResponseCreator {
  /**
   * Create standardized error response
   */
  static createErrorResponse(
    message: string, 
    status = 400, 
    code?: string,
    validationErrors?: ValidationError[]
  ): NextResponse {
    const response: ApiError = {
      success: false,
      error: message,
      code: code || 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    };

    // Add validation errors if provided
    if (validationErrors && validationErrors.length > 0) {
      (response as any).validationErrors = validationErrors;
    }

    return NextResponse.json(response, { 
      status,
      headers: this.getSecurityHeaders()
    });
  }

  /**
   * Create standardized success response
   */
  static createSuccessResponse(
    data: any, 
    status = 200,
    additionalHeaders: Record<string, string> = {}
  ): NextResponse {
    const response: ApiResponse = {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, {
      status,
      headers: {
        ...this.getSecurityHeaders(),
        ...additionalHeaders
      }
    });
  }

  /**
   * Get standard security headers
   */
  private static getSecurityHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  /**
   * Create OPTIONS response for CORS
   */
  static createOptionsResponse(allowedMethods: string[]): NextResponse {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Allow': allowedMethods.join(', '),
        'Access-Control-Allow-Methods': allowedMethods.join(', '),
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        ...this.getSecurityHeaders()
      }
    });
  }
}

// Request Validation Middleware
export class RequestValidator {
  /**
   * Validate JSON request body
   */
  static async validateJsonBody(request: Request): Promise<{ data: any; error?: ValidationError }> {
    try {
      const body = await request.json();
      
      if (!body || typeof body !== 'object') {
        return {
          data: null,
          error: {
            message: 'Request body must be a valid JSON object',
            code: 'INVALID_BODY'
          }
        };
      }
      
      return { data: body };
      
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        }
      };
    }
  }

  /**
   * Rate limiting check (basic implementation)
   */
  static checkRateLimit(clientIP: string, endpoint: string): boolean {
    // Basic rate limiting logic
    // In production, this would use Redis, in-memory cache, or external service
    
    // For now, just log requests for monitoring
    console.log(`[API] Request from ${clientIP} to ${endpoint} at ${new Date().toISOString()}`);
    
    // Return true to allow request (implement actual rate limiting logic)
    return true;
  }
}

// Export configuration for external use
export const API_SECURITY_CONFIG = SECURITY_CONFIG;