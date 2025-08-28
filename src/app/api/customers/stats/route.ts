/**
 * Customer Statistics API Route - GET for customer analytics and metrics
 * 
 * Provides secure statistics endpoint with caching, error handling,
 * and comprehensive customer analytics data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/services/CustomerService';

// Statistics response interface for type safety
interface CustomerStats {
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

function createSuccessResponse(data: any, status = 200, cacheControl = 'public, max-age=300') {
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
        'Cache-Control': cacheControl,
        'ETag': `"${Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16)}"`
      }
    }
  );
}

/**
 * GET /api/customers/stats - Get customer statistics and analytics
 * 
 * Returns comprehensive customer statistics including:
 * - Total customer count
 * - Distribution by subscription tier
 * - Average health score
 * - Health score distribution (healthy/warning/critical)
 * - Metadata with cache information
 * 
 * Security features:
 * - No sensitive customer data exposed
 * - Appropriate caching headers
 * - Request logging for monitoring
 * - Error handling without information leakage
 */
export async function GET(request: NextRequest) {
  const requestStart = Date.now();
  
  try {
    // Log request for monitoring
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    console.log(`[API] Stats request from IP: ${clientIP}, timestamp: ${new Date().toISOString()}`);
    
    // Check for conditional requests (ETag support)
    const ifNoneMatch = request.headers.get('if-none-match');
    
    // Get statistics from service
    const result = await customerService.getCustomerStats();
    
    if (!result.success) {
      console.error(`[API] Stats service error: ${result.error}, code: ${result.code}`);
      
      // Return generic error to prevent information leakage
      return createErrorResponse('Unable to retrieve customer statistics', 500, 'SERVICE_ERROR');
    }
    
    // Enhance statistics with additional metadata
    const now = new Date();
    const cacheExpiry = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
    
    const enhancedStats: CustomerStats = {
      ...result.data!,
      metadata: {
        generatedAt: now.toISOString(),
        cacheExpiry: cacheExpiry.toISOString(),
        version: '1.0'
      }
    };
    
    // Calculate additional metrics for better insights
    const additionalMetrics = {
      tierDistribution: {
        basicPercentage: result.data!.total > 0 ? Math.round((result.data!.byTier.basic / result.data!.total) * 100) : 0,
        premiumPercentage: result.data!.total > 0 ? Math.round((result.data!.byTier.premium / result.data!.total) * 100) : 0,
        enterprisePercentage: result.data!.total > 0 ? Math.round((result.data!.byTier.enterprise / result.data!.total) * 100) : 0
      },
      healthDistributionPercentages: {
        healthyPercentage: result.data!.total > 0 ? Math.round((result.data!.healthDistribution.healthy / result.data!.total) * 100) : 0,
        warningPercentage: result.data!.total > 0 ? Math.round((result.data!.healthDistribution.warning / result.data!.total) * 100) : 0,
        criticalPercentage: result.data!.total > 0 ? Math.round((result.data!.healthDistribution.critical / result.data!.total) * 100) : 0
      },
      performanceMetrics: {
        responseTime: Date.now() - requestStart,
        dataFreshness: 'real-time'
      }
    };
    
    const finalStats = {
      ...enhancedStats,
      additionalMetrics
    };
    
    // Generate ETag for caching
    const etag = `"stats-${Buffer.from(JSON.stringify({
      total: result.data!.total,
      averageHealthScore: result.data!.averageHealthScore,
      timestamp: Math.floor(now.getTime() / 60000) // Round to minute for better caching
    })).toString('base64').slice(0, 16)}"`;
    
    // Check if client has current version
    if (ifNoneMatch === etag) {
      console.log(`[API] Stats cache hit for IP: ${clientIP}`);
      return new NextResponse(null, { 
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'public, max-age=300',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block'
        }
      });
    }
    
    // Log successful statistics generation
    console.log(`[API] Stats generated: ${result.data!.total} customers, ` +
                `avg health: ${result.data!.averageHealthScore}, ` +
                `time: ${finalStats.additionalMetrics.performanceMetrics.responseTime}ms`);
    
    // Validate data integrity before returning
    if (result.data!.total < 0 || 
        result.data!.averageHealthScore < 0 || 
        result.data!.averageHealthScore > 100) {
      console.error('[API] Data integrity check failed for customer stats');
      return createErrorResponse('Data integrity error in statistics', 500, 'DATA_INTEGRITY_ERROR');
    }
    
    // Return with appropriate caching headers
    return NextResponse.json(
      {
        success: true,
        data: finalStats,
        timestamp: new Date().toISOString()
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
          'ETag': etag,
          'Vary': 'Accept-Encoding'
        }
      }
    );
    
  } catch (error) {
    const responseTime = Date.now() - requestStart;
    console.error(`[API] GET /api/customers/stats error (${responseTime}ms):`, error);
    
    // Return generic error without exposing internal details
    return createErrorResponse('Internal server error occurred while generating statistics', 500, 'INTERNAL_ERROR');
  }
}

/**
 * POST method not allowed - statistics should be read-only
 */
export async function POST() {
  return createErrorResponse('POST method not allowed for statistics endpoint. Statistics are read-only.', 405, 'METHOD_NOT_ALLOWED');
}

/**
 * PUT method not allowed - statistics should be read-only
 */
export async function PUT() {
  return createErrorResponse('PUT method not allowed for statistics endpoint. Statistics are read-only.', 405, 'METHOD_NOT_ALLOWED');
}

/**
 * DELETE method not allowed - statistics should be read-only
 */
export async function DELETE() {
  return createErrorResponse('DELETE method not allowed for statistics endpoint. Statistics are read-only.', 405, 'METHOD_NOT_ALLOWED');
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
      'Cache-Control': 'public, max-age=300'
    }
  });
}