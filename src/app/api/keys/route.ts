import { NextResponse } from 'next/server';
import { generateApiKey } from '../../../lib/setup-utils';
import { ApiKeyManager, validateApiKeyMiddleware, extractApiKey } from '../../../lib/api-key-manager';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  // Validate admin access
  const validationError = await validateApiKeyMiddleware(request, 'manage');
  if (validationError) return validationError;

  try {
    const { action, tier, permissions } = await request.json();

    if (action === 'validate') {
      const apiKey = request.headers.get('x-validate-key');
      if (!apiKey) {
        return NextResponse.json(
          { error: 'No key provided for validation' },
          { status: 400 }
        );
      }

      const keyConfig = ApiKeyManager.validateKey(apiKey);
      if (!keyConfig) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }

      const usage = ApiKeyManager.getUsage(apiKey);
      return NextResponse.json({
        valid: true,
        tier: keyConfig.tier,
        permissions: keyConfig.permissions,
        usage
      });
    }

    if (action === 'create') {
      if (!tier || !permissions || !Array.isArray(permissions)) {
        return NextResponse.json(
          { error: 'Invalid key creation parameters' },
          { status: 400 }
        );
      }

      if (!['free', 'pro'].includes(tier)) {
        return NextResponse.json(
          { error: 'Invalid tier specified' },
          { status: 400 }
        );
      }

      const validPermissions = ['predict', 'train', 'manage'];
      if (!permissions.every(p => validPermissions.includes(p))) {
        return NextResponse.json(
          { error: 'Invalid permissions specified' },
          { status: 400 }
        );
      }

      // Generate a secure API key
      const keyPrefix = tier === 'free' ? 'sk_test_' : 'sk_prod_';
      const randomSuffix = randomBytes(16).toString('hex');
      const newApiKey = `${keyPrefix}sintrix_${randomSuffix}`;

      // Add to ApiKeyManager (this will be implemented in the manager)
      try {
        await ApiKeyManager.createKey(newApiKey, {
          tier,
          permissions,
          rateLimit: tier === 'free' ? 1000 : 10000
        });

        return NextResponse.json({
          success: true,
          apiKey: newApiKey
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to create API key' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API key management error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Validate access
  const validationError = await validateApiKeyMiddleware(request, 'manage');
  if (validationError) return validationError;

  const apiKey = extractApiKey(request);
  if (!apiKey) {
    return NextResponse.json(
      { error: 'No API key provided' },
      { status: 401 }
    );
  }

  const usage = ApiKeyManager.getUsage(apiKey);
  const keyConfig = ApiKeyManager.validateKey(apiKey);

  if (!keyConfig) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }

  // Get detailed usage statistics
  return NextResponse.json({
    success: true,
    usage,
    tier: keyConfig.tier,
    permissions: keyConfig.permissions,
    limits: {
      minute: keyConfig.tier === 'free' ? 60 : 300,
      hourly: keyConfig.tier === 'free' ? 1000 : 5000,
      daily: keyConfig.rateLimit
    },
    created: Date.now() // In a real implementation, this would come from the key metadata
  });
}
