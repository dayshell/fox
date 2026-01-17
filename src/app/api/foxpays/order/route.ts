import { NextRequest, NextResponse } from 'next/server';
import { FoxPaysClient } from '@/lib/foxpays';
import { CreateFoxPaysOrderParams, ExchangeOrder } from '@/types/foxpays';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

function getFoxPaysConfig(request: NextRequest) {
  const apiBaseUrl = request.headers.get('X-FoxPays-URL') || process.env.FOXPAYS_API_URL || '';
  const accessToken = request.headers.get('X-FoxPays-Token') || process.env.FOXPAYS_ACCESS_TOKEN || '';
  const merchantId = request.headers.get('X-FoxPays-Merchant-ID') || process.env.FOXPAYS_MERCHANT_ID || '';
  
  // Try to get from localStorage settings if headers are empty
  if (!merchantId && typeof window !== 'undefined') {
    try {
      const settings = localStorage.getItem('siteSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        return {
          apiBaseUrl: apiBaseUrl || parsed.foxpaysApiUrl || '',
          accessToken: accessToken || parsed.foxpaysAccessToken || '',
          merchantId: parsed.foxpaysMerchantId || '',
        };
      }
    } catch (e) {
      // Ignore
    }
  }
  
  return { apiBaseUrl, accessToken, merchantId };
}

function generateExternalId(): string {
  return 'FX' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const { apiBaseUrl, accessToken, merchantId } = getFoxPaysConfig(request);
    
    if (!apiBaseUrl || !accessToken || !merchantId) {
      return NextResponse.json(
        { success: false, error: 'FoxPays не настроен. Проверьте FOXPAYS_API_URL, FOXPAYS_ACCESS_TOKEN и FOXPAYS_MERCHANT_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const { amount, currency, payment_gateway, coinId, coinSymbol, coinAmount, userContact } = body;
    
    if (!amount) {
      return NextResponse.json(
        { success: false, error: 'Не указана сумма (amount)' },
        { status: 400 }
      );
    }

    if (!currency && !payment_gateway) {
      return NextResponse.json(
        { success: false, error: 'Необходимо указать currency или payment_gateway' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Сумма должна быть больше 0' },
        { status: 400 }
      );
    }

    // Generate external ID for tracking
    const externalId = generateExternalId();

    // Create order params according to FoxPays API documentation
    const orderParams: CreateFoxPaysOrderParams = {
      external_id: externalId,
      amount: Number(amount),
      merchant_id: merchantId,
    };

    // Add optional parameters
    if (payment_gateway) {
      orderParams.payment_gateway = payment_gateway;
    } else if (currency) {
      orderParams.currency = currency.toLowerCase();
    }

    // Optional: callback URL for status updates
    if (body.callback_url) {
      orderParams.callback_url = body.callback_url;
    }

    // Optional: payment detail type
    if (body.payment_detail_type) {
      orderParams.payment_detail_type = body.payment_detail_type;
    }

    // Optional: transgran filter
    if (body.is_transgran !== undefined) {
      orderParams.is_transgran = body.is_transgran ? '1' : '0';
    }

    console.log('[FoxPays] Creating order with params:', orderParams);

    // Create order via FoxPays API
    const client = new FoxPaysClient(apiBaseUrl, accessToken);
    const foxpaysOrder = await client.createH2HOrder(orderParams);

    console.log('[FoxPays] Order created successfully:', foxpaysOrder.order_id);

    // Check if payment_detail exists (may be null if waiting for details)
    const paymentDetail = foxpaysOrder.payment_detail ? {
      detail: foxpaysOrder.payment_detail.detail || '',
      detailType: foxpaysOrder.payment_detail.detail_type || 'card',
      initials: foxpaysOrder.payment_detail.initials || '',
      qrCodeUrl: foxpaysOrder.payment_detail.qr_code_url || undefined,
    } : {
      detail: '',
      detailType: 'card' as const,
      initials: '',
      qrCodeUrl: undefined,
    };

    // Prepare order data for storage
    const exchangeOrder: Omit<ExchangeOrder, 'id'> = {
      foxpaysOrderId: foxpaysOrder.order_id,
      externalId: foxpaysOrder.external_id,
      baseAmount: parseFloat(foxpaysOrder.base_amount),
      amount: parseFloat(foxpaysOrder.amount),
      currency: foxpaysOrder.currency,
      paymentGateway: foxpaysOrder.payment_gateway,
      paymentGatewayName: foxpaysOrder.payment_gateway_name,
      paymentDetail,
      status: foxpaysOrder.status,
      subStatus: foxpaysOrder.sub_status,
      coinId: coinId || '',
      coinSymbol: coinSymbol || '',
      coinAmount: coinAmount || 0,
      userContact: userContact || '',
      expiresAt: foxpaysOrder.expires_at,
      finishedAt: foxpaysOrder.finished_at,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Return order data (client will store in localStorage)
    return NextResponse.json({
      success: true,
      data: {
        ...exchangeOrder,
        id: externalId,
      },
    });
  } catch (error) {
    console.error('[FoxPays Create Order Error]', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Ошибка создания заказа';
    const errorDetails = (error as any).errors || {};
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
