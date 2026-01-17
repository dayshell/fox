import { NextRequest, NextResponse } from 'next/server';
import { FoxPaysClient } from '@/lib/foxpays';

function getFoxPaysConfig(request: NextRequest) {
  const apiBaseUrl = request.headers.get('X-FoxPays-URL') || process.env.FOXPAYS_API_URL || '';
  const accessToken = request.headers.get('X-FoxPays-Token') || process.env.FOXPAYS_ACCESS_TOKEN || '';
  return { apiBaseUrl, accessToken };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { apiBaseUrl, accessToken } = getFoxPaysConfig(request);
    
    if (!apiBaseUrl || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'FoxPays не настроен' },
        { status: 400 }
      );
    }

    const { orderId } = params;
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Не указан ID заказа' },
        { status: 400 }
      );
    }

    // Get order status from FoxPays
    const client = new FoxPaysClient(apiBaseUrl, accessToken);
    const order = await client.getH2HOrder(orderId);

    console.log('[FoxPays Get Order] Raw order from API:', JSON.stringify(order, null, 2));
    console.log('[FoxPays Get Order] Payment detail:', order.payment_detail);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.order_id,
        status: order.status,
        subStatus: order.sub_status,
        amount: order.amount,
        currency: order.currency,
        paymentGateway: order.payment_gateway,
        paymentGatewayName: order.payment_gateway_name,
        paymentDetail: order.payment_detail,
        expiresAt: order.expires_at,
        finishedAt: order.finished_at,
        createdAt: order.created_at,
        currentServerTime: order.current_server_time,
      },
    });
  } catch (error) {
    console.error('[FoxPays Get Order Error]', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения статуса заказа' 
      },
      { status: 500 }
    );
  }
}
