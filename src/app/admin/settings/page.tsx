'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Image as ImageIcon, Type, Search, Send, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('FoxSwap');
  const [logoUrl, setLogoUrl] = useState('');
  const [metaTitle, setMetaTitle] = useState('FoxSwap - Обмен криптовалют');
  const [metaDescription, setMetaDescription] = useState('Быстрый и надёжный обмен криптовалют по лучшим курсам');
  const [metaKeywords, setMetaKeywords] = useState('криптовалюта, обмен, биткоин, эфириум, USDT, обменник');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  // FoxPays settings
  const [foxpaysApiUrl, setFoxpaysApiUrl] = useState('');
  const [foxpaysAccessToken, setFoxpaysAccessToken] = useState('');
  const [foxpaysEnabled, setFoxpaysEnabled] = useState(false);
  const [testingFoxpays, setTestingFoxpays] = useState(false);
  const [foxpaysTestResult, setFoxpaysTestResult] = useState<'success' | 'error' | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('siteSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setSiteName(settings.siteName || 'FoxSwap');
        setLogoUrl(settings.logoUrl || '');
        setMetaTitle(settings.metaTitle || 'FoxSwap - Обмен криптовалют');
        setMetaDescription(settings.metaDescription || 'Быстрый и надёжный обмен криптовалют по лучшим курсам');
        setMetaKeywords(settings.metaKeywords || 'криптовалюта, обмен, биткоин, эфириум, USDT, обменник');
        setTelegramBotToken(settings.telegramBotToken || '');
        setTelegramChatId(settings.telegramChatId || '');
        setTelegramEnabled(settings.telegramEnabled || false);
        // FoxPays
        setFoxpaysApiUrl(settings.foxpaysApiUrl || '');
        setFoxpaysAccessToken(settings.foxpaysAccessToken || '');
        setFoxpaysEnabled(settings.foxpaysEnabled || false);
      } catch (e) {
        console.error('Failed to parse settings');
      }
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    
    const settings = { 
      siteName, logoUrl, metaTitle, metaDescription, metaKeywords,
      telegramBotToken, telegramChatId, telegramEnabled,
      foxpaysApiUrl, foxpaysAccessToken, foxpaysEnabled
    };
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    
    // Trigger re-render in other components
    window.dispatchEvent(new Event('storage'));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testFoxpaysConnection = async () => {
    if (!foxpaysApiUrl || !foxpaysAccessToken) {
      alert('Заполните URL API и Access Token');
      return;
    }
    
    setTestingFoxpays(true);
    setFoxpaysTestResult(null);
    
    try {
      const response = await fetch(`${foxpaysApiUrl}/api/currencies`, {
        headers: {
          'Accept': 'application/json',
          'Access-Token': foxpaysAccessToken,
        },
      });
      
      const data = await response.json();
      setFoxpaysTestResult(data.success ? 'success' : 'error');
    } catch (error) {
      setFoxpaysTestResult('error');
    }
    
    setTestingFoxpays(false);
    setTimeout(() => setFoxpaysTestResult(null), 3000);
  };

  const testTelegramConnection = async () => {
    if (!telegramBotToken || !telegramChatId) {
      alert('Заполните токен бота и Chat ID');
      return;
    }
    
    setTestingTelegram(true);
    setTelegramTestResult(null);
    
    try {
      const chatIds = telegramChatId.split(',').map(id => id.trim()).filter(id => id);
      let allSuccess = true;
      
      for (const chatId of chatIds) {
        const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '✅ Тестовое сообщение от FoxSwap!\n\nУведомления настроены успешно.',
            parse_mode: 'HTML',
          }),
        });
        
        if (!response.ok) {
          allSuccess = false;
        }
      }
      
      setTelegramTestResult(allSuccess ? 'success' : 'error');
    } catch (error) {
      setTelegramTestResult('error');
    }
    
    setTestingTelegram(false);
    setTimeout(() => setTelegramTestResult(null), 3000);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white">Настройки</h1>
        <p className="text-gray-500">Настройки сайта и брендинга</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branding Settings */}
        <motion.div
          className="card-dark p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Type className="w-5 h-5 text-orange-400" />
            Брендинг
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Название сайта</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-4 py-3 input-dark"
                placeholder="FoxSwap"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">URL логотипа</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-4 py-3 input-dark"
                placeholder="https://example.com/logo.png"
              />
              <p className="text-gray-600 text-xs mt-2">
                Оставьте пустым для использования стандартного логотипа
              </p>
            </div>

            {/* Preview */}
            <div className="p-4 bg-dark-input rounded-xl">
              <p className="text-gray-400 text-sm mb-3">Предпросмотр:</p>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt="Logo preview" 
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">🦊</span>
                  </div>
                )}
                <span className="text-xl font-bold text-white">{siteName || 'FoxSwap'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SEO Settings */}
        <motion.div
          className="card-dark p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-400" />
            SEO / META теги
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">META Title (заголовок страницы)</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-4 py-3 input-dark"
                placeholder="FoxSwap - Обмен криптовалют"
              />
              <p className="text-gray-600 text-xs mt-2">
                Отображается в заголовке вкладки браузера и в результатах поиска
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">META Description (описание)</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-4 py-3 input-dark resize-none"
                rows={3}
                placeholder="Быстрый и надёжный обмен криптовалют по лучшим курсам"
              />
              <p className="text-gray-600 text-xs mt-2">
                Описание сайта для поисковых систем (рекомендуется 150-160 символов)
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">META Keywords (ключевые слова)</label>
              <textarea
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                className="w-full px-4 py-3 input-dark resize-none"
                rows={2}
                placeholder="криптовалюта, обмен, биткоин, эфириум"
              />
              <p className="text-gray-600 text-xs mt-2">
                Ключевые слова через запятую для SEO
              </p>
            </div>
          </div>
        </motion.div>

        {/* Logo Upload Info */}
        <motion.div
          className="card-dark p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-orange-400" />
            Рекомендации по логотипу
          </h2>

          <div className="space-y-4 text-gray-400 text-sm">
            <p>• Рекомендуемый размер: 200x200 пикселей</p>
            <p>• Формат: PNG с прозрачным фоном</p>
            <p>• Логотип должен быть квадратным</p>
            <p>• Используйте прямую ссылку на изображение</p>
          </div>

          <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
            <p className="text-orange-400 text-sm">
              💡 Совет: Загрузите логотип на imgur.com или другой хостинг изображений и вставьте прямую ссылку.
            </p>
          </div>
        </motion.div>

        {/* SEO Tips */}
        <motion.div
          className="card-dark p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-400" />
            Советы по SEO
          </h2>

          <div className="space-y-4 text-gray-400 text-sm">
            <p>• Title должен быть 50-60 символов</p>
            <p>• Description — 150-160 символов</p>
            <p>• Используйте релевантные ключевые слова</p>
            <p>• Включите название бренда в title</p>
            <p>• Описание должно быть уникальным и привлекательным</p>
          </div>

          <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
            <p className="text-orange-400 text-sm">
              💡 Хорошие ключевые слова: обмен криптовалют, купить биткоин, обменник, USDT, BTC, ETH
            </p>
          </div>
        </motion.div>

        {/* Telegram Settings */}
        <motion.div
          className="card-dark p-6 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-orange-400" />
            Telegram уведомления
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Bot Token</label>
                <input
                  type="text"
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  className="w-full px-4 py-3 input-dark font-mono text-sm"
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                />
                <p className="text-gray-600 text-xs mt-2">
                  Получите токен у @BotFather в Telegram
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Chat ID (можно несколько через запятую)</label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="w-full px-4 py-3 input-dark font-mono text-sm"
                  placeholder="123456789, 987654321"
                />
                <p className="text-gray-600 text-xs mt-2">
                  ID пользователей через запятую. Узнайте через @userinfobot
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTelegramEnabled(!telegramEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    telegramEnabled ? 'bg-orange-600' : 'bg-gray-700'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    telegramEnabled ? 'left-7' : 'left-1'
                  }`} />
                </button>
                <span className="text-gray-400 text-sm">
                  {telegramEnabled ? 'Уведомления включены' : 'Уведомления выключены'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-dark-input rounded-xl">
                <h3 className="text-white font-medium mb-3">Как настроить:</h3>
                <ol className="space-y-2 text-gray-400 text-sm list-decimal list-inside">
                  <li>Создайте бота через @BotFather</li>
                  <li>Скопируйте токен бота</li>
                  <li>Каждый получатель пишет боту /start</li>
                  <li>Узнайте ID через @userinfobot</li>
                  <li>Укажите все ID через запятую</li>
                  <li>Нажмите "Тест" для проверки</li>
                </ol>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-blue-400 text-xs">
                  💡 Можно добавить несколько получателей: 123456789, 987654321
                </p>
              </div>

              <motion.button
                onClick={testTelegramConnection}
                disabled={testingTelegram || !telegramBotToken || !telegramChatId}
                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                  telegramTestResult === 'success' 
                    ? 'bg-green-600 text-white' 
                    : telegramTestResult === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white disabled:bg-gray-700 disabled:text-gray-500'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {testingTelegram ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : telegramTestResult === 'success' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Успешно!
                  </>
                ) : telegramTestResult === 'error' ? (
                  'Ошибка подключения'
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Тест подключения
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* FoxPays Settings */}
        <motion.div
          className="card-dark p-6 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-400" />
            FoxPays - Платежная система
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">API URL</label>
                <input
                  type="url"
                  value={foxpaysApiUrl}
                  onChange={(e) => setFoxpaysApiUrl(e.target.value)}
                  className="w-full px-4 py-3 input-dark font-mono text-sm"
                  placeholder="https://panel.foxpays.top"
                />
                <p className="text-gray-600 text-xs mt-2">
                  Базовый URL API FoxPays
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Access Token</label>
                <input
                  type="password"
                  value={foxpaysAccessToken}
                  onChange={(e) => setFoxpaysAccessToken(e.target.value)}
                  className="w-full px-4 py-3 input-dark font-mono text-sm"
                  placeholder="Ваш Access Token"
                />
                <p className="text-gray-600 text-xs mt-2">
                  Токен доступа из личного кабинета FoxPays
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFoxpaysEnabled(!foxpaysEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    foxpaysEnabled ? 'bg-orange-600' : 'bg-gray-700'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    foxpaysEnabled ? 'left-7' : 'left-1'
                  }`} />
                </button>
                <span className="text-gray-400 text-sm">
                  {foxpaysEnabled ? 'FoxPays включен' : 'FoxPays выключен'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-dark-input rounded-xl">
                <h3 className="text-white font-medium mb-3">Что даёт FoxPays:</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>• Автоматическое получение реквизитов</li>
                  <li>• Поддержка разных банков (Сбербанк, Тинькофф и др.)</li>
                  <li>• QR-коды для оплаты</li>
                  <li>• Автоматическое отслеживание платежей</li>
                  <li>• Защита от мошенничества</li>
                </ul>
              </div>

              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <p className="text-orange-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Получите Access Token в личном кабинете FoxPays
                </p>
              </div>

              <motion.button
                onClick={testFoxpaysConnection}
                disabled={testingFoxpays || !foxpaysApiUrl || !foxpaysAccessToken}
                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                  foxpaysTestResult === 'success' 
                    ? 'bg-green-600 text-white' 
                    : foxpaysTestResult === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-orange-600 hover:bg-orange-500 text-white disabled:bg-gray-700 disabled:text-gray-500'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {testingFoxpays ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : foxpaysTestResult === 'success' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Подключено!
                  </>
                ) : foxpaysTestResult === 'error' ? (
                  'Ошибка подключения'
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Проверить подключение
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={handleSave}
          disabled={loading}
          className={`px-8 py-4 btn-primary flex items-center gap-2 ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : saved ? (
            <>✓ Сохранено</>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Сохранить настройки
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
