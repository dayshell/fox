import { NextRequest, NextResponse } from 'next/server';
import { FoxPaysClient } from '@/lib/foxpays';

function getFoxPaysConfig(request: NextRequest) {
  const apiBaseUrl = request.headers.get('X-FoxPays-URL') || process.env.FOXPAYS_API_URL || '';
  const accessToken = request.headers.get('X-FoxPays-Token') || process.env.FOXPAYS_ACCESS_TOKEN || '';
  return { apiBaseUrl, accessToken };
}

export async function PATCH(
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

    // Cancel order via FoxPays
    const client = new FoxPaysClient(apiBaseUrl, accessToken);
    await client.cancelOrder(orderId);

    // Get updated order status
    const order = await client.getH2HOrder(orderId);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.order_id,
        status: order.status,
        subStatus: order.sub_status,
      },
    });
  } catch (error) {
    console.error('[FoxPays Cancel Order Error]', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка отмены заказа' 
      },
      { status: 500 }
    );
  }
}
