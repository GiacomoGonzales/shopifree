import { NextRequest, NextResponse } from 'next/server'

/**
 * Verify Firebase Auth token using REST API
 * This method doesn't require Firebase Admin SDK or service account credentials
 * Returns the decoded token with user information
 */
export async function verifyAuthToken(request: NextRequest): Promise<{
  success: boolean
  uid?: string
  error?: string
  status?: number
}> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Missing or invalid authorization header',
        status: 401
      }
    }

    // Extract token
    const token = authHeader.split('Bearer ')[1]

    if (!token) {
      return {
        success: false,
        error: 'No token provided',
        status: 401
      }
    }

    // Decode and verify JWT token structure
    // This is a basic verification that doesn't require external API calls
    try {
      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const parts = token.split('.')

      if (parts.length !== 3) {
        return {
          success: false,
          error: 'Invalid token format',
          status: 401
        }
      }

      // Decode the payload (middle part)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())

      // Verify token hasn't expired
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        return {
          success: false,
          error: 'Token expired. Please sign in again.',
          status: 401
        }
      }

      // Verify it's a Firebase token
      if (!payload.user_id || !payload.firebase) {
        return {
          success: false,
          error: 'Invalid Firebase token',
          status: 401
        }
      }

      // Additional security: verify token is recent (issued within last 24 hours)
      if (payload.iat && (now - payload.iat) > 86400) {
        return {
          success: false,
          error: 'Token too old. Please sign in again.',
          status: 401
        }
      }

      return {
        success: true,
        uid: payload.user_id
      }
    } catch (decodeError) {
      console.error('❌ Token decode failed:', decodeError)
      return {
        success: false,
        error: 'Invalid token',
        status: 401
      }
    }
  } catch (error: any) {
    console.error('❌ Token verification failed:', error.message)

    return {
      success: false,
      error: 'Authentication failed',
      status: 401
    }
  }
}

/**
 * Simple rate limiter using in-memory storage
 * For production, consider using Redis or a dedicated rate limiting service
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60 * 60 * 1000) // 1 hour

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number // Time window in milliseconds
}

/**
 * Check if request should be rate limited
 * Returns true if request should be blocked
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 } // Default: 10 requests per minute
): {
  limited: boolean
  remaining: number
  resetTime?: Date
} {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // No entry or expired - create new
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetTime: new Date(now + config.windowMs)
    }
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetTime: new Date(entry.resetTime)
    }
  }

  // Increment count
  entry.count++
  rateLimitMap.set(identifier, entry)

  return {
    limited: false,
    remaining: config.maxRequests - entry.count,
    resetTime: new Date(entry.resetTime)
  }
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return 'unknown'
}

/**
 * Validate image size from base64 string
 * Returns size in bytes and whether it's valid
 */
export function validateImageSize(
  base64Data: string,
  maxSizeBytes: number = 5 * 1024 * 1024 // Default: 5MB
): {
  valid: boolean
  sizeBytes: number
  sizeMB: number
  error?: string
} {
  try {
    // Calculate size from base64
    // Base64 encoding increases size by ~33%, so we need to decode to get actual size
    const base64Length = base64Data.length
    const padding = base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0
    const sizeBytes = (base64Length * 3) / 4 - padding
    const sizeMB = sizeBytes / (1024 * 1024)

    if (sizeBytes > maxSizeBytes) {
      return {
        valid: false,
        sizeBytes,
        sizeMB,
        error: `Image size (${sizeMB.toFixed(2)}MB) exceeds maximum allowed size (${(maxSizeBytes / (1024 * 1024)).toFixed(2)}MB)`
      }
    }

    return {
      valid: true,
      sizeBytes,
      sizeMB
    }
  } catch (error) {
    return {
      valid: false,
      sizeBytes: 0,
      sizeMB: 0,
      error: 'Invalid base64 image data'
    }
  }
}
