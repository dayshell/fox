'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '@/hooks/useChat';
import { Save, Loader2, ArrowLeft, Clock, MessageCircle, Power } from 'lucide-react';
import Link from 'next/link';

export default function ChatSettingsPage() {
  const { settings, updateSettings } = useChat();
  const [formData, setFormData] = useState(settings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = async () => {
    setLoading(true);
    updateSettings(formData);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/chat">
          <motion.button
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Настройки чата</h1>
          <p className="text-gray-500 mt-1">Управление чатом поддержки</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enable/Disable */}
        <motion.div
          className="card-dark p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Power className="w-5 h-5 text-orange-400" />
            Статус чата
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-dark-input rounded-xl">
              <div>
                <p className="text-white font-medium">Чат включен</p>
                <p className="text-gray-500 text-sm">Показывать виджет чата на сайте</p>
              </div>
              <button
                onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  formData.enabled ? 'bg-orange-600' : 'bg-gray-700'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  formData.enabled ? 'left-8' : 'left-1'
                }`} />
              </button>
            </div>

            <div className={`p-4 rounded-xl ${formData.enabled ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <p className={`text-sm ${formData.enabled ? 'text-green-400' : 'text-red-400'}`}>
                {formData.enabled 
                  ? '✓ Чат активен и виден посетителям сайта' 
                  : '✗ Чат выключен и скрыт от посетителей'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Working Hours */}
        <motion.div
          className="card-dark p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            Рабочие часы
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-dark-input rounded-xl">
              <div>
                <p className="text-white font-medium">Ограничить по времени</p>
                <p className="text-gray-500 text-sm">Показывать "офлайн" вне рабочих часов</p>
              </div>
              <button
                onClick={() => setFormData({ ...formData, workingHoursEnabled: !formData.workingHoursEnabled })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  formData.workingHoursEnabled ? 'bg-orange-600' : 'bg-gray-700'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  formData.workingHoursEnabled ? 'left-8' : 'left-1'
                }`} />
              </button>
            </div>

            {formData.workingHoursEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Начало работы</label>
                  <input
                    type="time"
                    value={formData.workingHoursStart}
                    onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                    className="w-full px-4 py-3 input-dark"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Конец работы</label>
                  <input
                    type="time"
                    value={formData.workingHoursEnd}
                    onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                    className="w-full px-4 py-3 input-dark"
                  />
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-blue-400 text-xs">
                💡 {formData.workingHoursEnabled 
                  ? `Чат онлайн с ${formData.workingHoursStart} до ${formData.workingHoursEnd}` 
                  : 'Чат всегда показывается как онлайн'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <motion.div
          className="card-dark p-6 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-400" />
            Сообщения
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Приветственное сообщение</label>
              <textarea
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                className="w-full px-4 py-3 input-dark resize-none"
                rows={3}
                placeholder="Здравствуйте! Чем можем помочь?"
              />
              <p className="text-gray-600 text-xs mt-2">
                Автоматическое сообщение при начале чата
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Сообщение офлайн</label>
              <textarea
                value={formData.offlineMessage}
                onChange={(e) => setFormData({ ...formData, offlineMessage: e.target.value })}
                className="w-full px-4 py-3 input-dark resize-none"
                rows={3}
                placeholder="Мы сейчас офлайн. Оставьте сообщение..."
              />
              <p className="text-gray-600 text-xs mt-2">
                Показывается когда чат офлайн или вне рабочих часов
              </p>
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
