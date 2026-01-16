import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8268271231:AAFwYm06zfTf342aFd1p-dEZ39nXS5KW1nY';
const WEB_APP_URL = 'https://www.foxswap.top';
const SUPPORT_URL = 'https://t.me/FoxProjectSeo';
// Banner image for welcome message
const WELCOME_IMAGE_URL = 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80'; // Crypto/trading themed image

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
  };
}

async function sendMessage(chatId: number, text: string, replyMarkup?: object) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  };
  
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  return response.json();
}

async function sendPhoto(chatId: number, photoUrl: string, caption: string, replyMarkup?: object) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
  
  const body: any = {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: 'HTML',
  };
  
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();
    
    if (update.message?.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const firstName = update.message.from.first_name;
      
      if (text === '/start') {
        const welcomeMessage = `🦊 <b>Добро пожаловать в FoxSwap, ${firstName}!</b>

Мы — надёжный сервис обмена криптовалют с лучшими курсами.

✅ Быстрый обмен BTC, ETH, USDT и других криптовалют
✅ Выгодные курсы с минимальной комиссией
✅ Поддержка рублей (карта, СБП)
✅ Безопасные транзакции 24/7

Нажмите кнопку ниже, чтобы начать обмен 👇`;

        const inlineKeyboard = {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть FoxSwap',
                web_app: { url: WEB_APP_URL }
              }
            ],
            [
              {
                text: '🌐 Открыть сайт',
                url: WEB_APP_URL
              }
            ],
            [
              {
                text: '💬 Поддержка',
                url: SUPPORT_URL
              }
            ]
          ]
        };
        
        await sendPhoto(chatId, WELCOME_IMAGE_URL, welcomeMessage, inlineKeyboard);
      } else if (text === '/help') {
        const helpMessage = `🦊 <b>FoxSwap — Помощь</b>

<b>Доступные команды:</b>
/start — Главное меню
/help — Справка
/rates — Текущие курсы

<b>Как обменять криптовалюту:</b>
1. Нажмите "Открыть FoxSwap"
2. Выберите валютную пару
3. Введите сумму
4. Следуйте инструкциям

По всем вопросам обращайтесь в поддержку.`;

        await sendMessage(chatId, helpMessage);
      } else if (text === '/rates') {
        const ratesMessage = `📊 <b>Актуальные курсы FoxSwap</b>

<b>Bitcoin (BTC)</b>
💰 Покупка: ~7,409,708 ₽
💸 Продажа: ~7,119,131 ₽

<b>Ethereum (ETH)</b>
💰 Покупка: ~246,000 ₽
💸 Продажа: ~244,000 ₽

<b>USDT</b>
💰 Покупка: ~79 ₽
💸 Продажа: ~78 ₽

<i>Курсы обновляются в реальном времени на сайте.</i>`;

        const keyboard = {
          inline_keyboard: [
            [{ text: '🔄 Обменять сейчас', web_app: { url: WEB_APP_URL } }]
          ]
        };
        
        await sendMessage(chatId, ratesMessage, keyboard);
      } else {
        // Unknown command
        const defaultMessage = `🦊 Используйте команду /start для начала работы с ботом.`;
        await sendMessage(chatId, defaultMessage);
      }
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}

// GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook is active' });
}
