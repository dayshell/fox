'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="text-9xl font-bold text-gradient mb-4"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          404
        </motion.div>
        
        <h1 className="text-2xl font-semibold text-white mb-4">
          Страница не найдена
        </h1>
        
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/">
            <motion.button
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5" />
              На главную
            </motion.button>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>
        </div>
      </motion.div>
    </div>
  );
}
