import { NextRequest, NextResponse } from 'next/server';
import { FoxPaysClient } from '@/lib/foxpays';
import { FoxPaysPaymentGateway } from '@/types/foxpays';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Cache for payment gateways (5 minutes)
let gatewaysCache: {
  data: FoxPaysPaymentGateway[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getFoxPaysConfig(request: NextRequest) {
  // Get config from headers (passed from client)
  const apiBaseUrl = request.headers.get('X-FoxPays-URL') || process.env.FOXPAYS_API_URL || '';
  const accessToken = request.headers.get('X-FoxPays-Token') || process.env.FOXPAYS_ACCESS_TOKEN || '';
  
  return { apiBaseUrl, accessToken };
}

export async function GET(request: NextRequest) {
  try {
    const { apiBaseUrl, accessToken } = getFoxPaysConfig(request);
    
    if (!apiBaseUrl || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'FoxPays не настроен' },
        { status: 400 }
      );
    }

    // Check cache
    const now = Date.now();
    if (gatewaysCache.data && (now - gatewaysCache.timestamp) < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: gatewaysCache.data,
        cached: true,
      });
    }

    // Fetch from API
    const client = new FoxPaysClient(apiBaseUrl, accessToken);
    const gateways = await client.getPaymentGateways();

    // Update cache
    gatewaysCache = {
      data: gateways,
      timestamp: now,
    };

    return NextResponse.json({
      success: true,
      data: gateways,
      cached: false,
    });
  } catch (error) {
    console.error('[FoxPays Gateways Error]', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения платежных методов' 
      },
      { status: 500 }
    );
  }
}
