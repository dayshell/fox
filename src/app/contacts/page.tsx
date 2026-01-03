'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import ContactForm from '@/components/ContactForm';
import { Mail, Phone, Send, Clock } from 'lucide-react';

export default function ContactsPage() {
  const { t } = useLanguage();

  const contactInfo = [
    { icon: Mail, label: 'Email', value: t('contacts.info.email') },
    { icon: Phone, label: t('contacts.info.phoneLabel'), value: t('contacts.info.phone') },
    { icon: Send, label: 'Telegram', value: t('contacts.info.telegram') },
  ];

  return (
    <div className="min-h-screen py-12 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('contacts.title')}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('contacts.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.label}
                className="card-dark p-6 flex items-center gap-4 hover:border-orange-500/50 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-orange-600/20 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">{item.label}</p>
                  <p className="text-white font-medium">{item.value}</p>
                </div>
              </motion.div>
            ))}

            {/* Working Hours */}
            <motion.div
              className="card-dark p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">{t('contacts.info.workingHours')}</p>
                  <p className="text-green-400 font-medium">{t('contacts.info.available')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
