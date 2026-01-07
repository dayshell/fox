import { NextRequest, NextResponse } from 'next/server';
import { FoxPaysClient } from '@/lib/foxpays';
import { CreateFoxPaysOrderParams, ExchangeOrder } from '@/types/foxpays';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

function getFoxPaysConfig(request: NextRequest) {
  const apiBaseUrl = request.headers.get('X-FoxPays-URL') || process.env.FOXPAYS_API_URL || '';
  const accessToken = request.headers.get('X-FoxPays-Token') || process.env.FOXPAYS_ACCESS_TOKEN || '';
  return { apiBaseUrl, accessToken };
}

function generateExternalId(): string {
  return 'FX' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const { apiBaseUrl, accessToken } = getFoxPaysConfig(request);
    
    if (!apiBaseUrl || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'FoxPays не настроен' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const { amount, currency, payment_gateway, coinId, coinSymbol, coinAmount, userContact } = body;
    
    if (!amount || !currency || !payment_gateway) {
      return NextResponse.json(
        { success: false, error: 'Не указаны обязательные поля: amount, currency, payment_gateway' },
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

    // Create order params
    const orderParams: CreateFoxPaysOrderParams = {
      amount: Number(amount),
      currency: currency.toLowerCase(),
      payment_gateway,
      external_id: externalId,
    };

    // Create order via FoxPays API
    const client = new FoxPaysClient(apiBaseUrl, accessToken);
    const foxpaysOrder = await client.createH2HOrder(orderParams);

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
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка создания заказа' 
      },
      { status: 500 }
    );
  }
}
