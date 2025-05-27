import { createHash, randomBytes } from 'crypto';

interface ApiKeyConfig {
  key: string; // Stores hashed key
  tier: 'free' | 'pro';
  rateLimit: number;
  permissions: string[];
  salt: string;
}

// This would typically be in a secure database or environment variables
// Keys are stored as salted hashes for security
const API_KEYS: { [key: string]: ApiKeyConfig } = {
  'sk_test_sintrix_0123456789abcdef': {
    key: createHash('sha256').update('sk_test_sintrix_0123456789abcdef' + 'salt1').digest('hex'),
    tier: 'free',
    rateLimit: 1000,
    permissions: ['predict', 'train'],
    salt: 'salt1'
  },
  'sk_prod_sintrix_9876543210abcdef': {
    key: createHash('sha256').update('sk_prod_sintrix_9876543210abcdef' + 'salt2').digest('hex'),
    tier: 'pro',
    rateLimit: 10000,
    permissions: ['predict', 'train', 'manage'],
    salt: 'salt2'
  }
};

interface RateLimitInfo {
  count: number;
  lastReset: number;
  minute: number;
  hourly: number;
  daily: number;
}

interface CreateKeyParams {
  tier: 'free' | 'pro';
  permissions: string[];
  rateLimit: number;
}

// Key validation and rate limiting
export class ApiKeyManager {
  private static rateLimitMap = new Map<string, RateLimitInfo>();
  private static readonly MINUTE = 60 * 1000;
  private static readonly HOUR = 60 * 60 * 1000;
  private static readonly DAY = 24 * 60 * 60 * 1000;

  private static hashKey(key: string, salt: string): string {
    return createHash('sha256').update(key + salt).digest('hex');
  }

  static validateKey(apiKey: string): ApiKeyConfig | null {
    // Find the key config by checking each hashed key
    for (const [originalKey, config] of Object.entries(API_KEYS)) {
      const hashedInput = this.hashKey(apiKey, config.salt);
      if (hashedInput === config.key) {
        return { ...config, key: originalKey }; // Return original key for reference
      }
    }
    return null;
  }

  static async createKey(apiKey: string, params: CreateKeyParams): Promise<void> {
    const salt = randomBytes(16).toString('hex');
    const hashedKey = this.hashKey(apiKey, salt);
    
    API_KEYS[apiKey] = {
      key: hashedKey,
      tier: params.tier,
      rateLimit: params.rateLimit,
      permissions: params.permissions,
      salt
    };
  }

  private static resetRateLimits(now: number): void {
    this.rateLimitMap.forEach((info, key) => {
      if (now - info.lastReset > this.DAY) {
        info.daily = 0;
        info.hourly = 0;
        info.minute = 0;
        info.lastReset = now;
      } else if (now - info.lastReset > this.HOUR) {
        info.hourly = 0;
        info.minute = 0;
      } else if (now - info.lastReset > this.MINUTE) {
        info.minute = 0;
      }
    });
  }

  static checkRateLimit(apiKey: string): boolean {
    const now = Date.now();
    this.resetRateLimits(now);

    const keyConfig = this.validateKey(apiKey);
    if (!keyConfig) return false;

    let info = this.rateLimitMap.get(apiKey);
    if (!info) {
      info = {
        count: 0,
        lastReset: now,
        minute: 0,
        hourly: 0,
        daily: 0
      };
    }

    // Apply tiered rate limits
    const minuteLimit = keyConfig.tier === 'free' ? 60 : 300;
    const hourlyLimit = keyConfig.tier === 'free' ? 1000 : 5000;
    const dailyLimit = keyConfig.rateLimit;

    if (info.minute >= minuteLimit || 
        info.hourly >= hourlyLimit || 
        info.daily >= dailyLimit) {
      return false;
    }

    // Update counters
    info.minute++;
    info.hourly++;
    info.daily++;
    info.count++;
    this.rateLimitMap.set(apiKey, info);
    
    return true;
  }

  static hasPermission(apiKey: string, permission: string): boolean {
    const keyConfig = this.validateKey(apiKey);
    return keyConfig ? keyConfig.permissions.includes(permission) : false;
  }

  static getUsage(apiKey: string): {
    minute: { current: number; limit: number };
    hourly: { current: number; limit: number };
    daily: { current: number; limit: number };
  } | null {
    const keyConfig = this.validateKey(apiKey);
    if (!keyConfig) return null;

    const info = this.rateLimitMap.get(apiKey) || {
      minute: 0,
      hourly: 0,
      daily: 0
    };

    return {
      minute: {
        current: info.minute || 0,
        limit: keyConfig.tier === 'free' ? 60 : 300
      },
      hourly: {
        current: info.hourly || 0,
        limit: keyConfig.tier === 'free' ? 1000 : 5000
      },
      daily: {
        current: info.daily || 0,
        limit: keyConfig.rateLimit
      }
    };
  }
}

// Helper function to extract API key from request headers
export function extractApiKey(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

// Middleware for API key validation
export async function validateApiKeyMiddleware(
  request: Request,
  requiredPermission: string
): Promise<Response | null> {
  const apiKey = extractApiKey(request);
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!ApiKeyManager.validateKey(apiKey)) {
    return new Response(
      JSON.stringify({ error: 'Invalid API key' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!ApiKeyManager.hasPermission(apiKey, requiredPermission)) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!ApiKeyManager.checkRateLimit(apiKey)) {
    const usage = ApiKeyManager.getUsage(apiKey);
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded',
        usage
      }),
      { 
        status: 429, 
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': '60'
        } 
      }
    );
  }

  return null; // No error, continue with request
}
