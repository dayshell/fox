import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8268271231:AAFwYm06zfTf342aFd1p-dEZ39nXS5KW1nY';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if (action === 'setWebhook') {
    const webhookUrl = searchParams.get('url');
    if (!webhookUrl) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
    }
    
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
    );
    const result = await response.json();
    return NextResponse.json(result);
  }
  
  if (action === 'deleteWebhook') {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`
    );
    const result = await response.json();
    return NextResponse.json(result);
  }
  
  if (action === 'getWebhookInfo') {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );
    const result = await response.json();
    return NextResponse.json(result);
  }
  
  if (action === 'getMe') {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getMe`
    );
    const result = await response.json();
    return NextResponse.json(result);
  }
  
  if (action === 'setCommands') {
    const commands = [
      { command: 'start', description: '🚀 Начать работу с ботом' },
      { command: 'help', description: '❓ Справка и помощь' },
      { command: 'rates', description: '📊 Текущие курсы' },
    ];
    
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands }),
      }
    );
    const result = await response.json();
    return NextResponse.json(result);
  }
  
  return NextResponse.json({
    message: 'Telegram Bot Setup API',
    actions: [
      'setWebhook?url=YOUR_WEBHOOK_URL',
      'deleteWebhook',
      'getWebhookInfo',
      'getMe',
      'setCommands',
    ],
    example: '/api/telegram/setup?action=setWebhook&url=https://your-domain.com/api/telegram/webhook'
  });
}
