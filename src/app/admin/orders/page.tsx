'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrders } from '@/hooks/useOrders';
import { Order, OrderStatus } from '@/types';
import { 
  Clock, CheckCircle, XCircle, AlertCircle, 
  ArrowRight, RefreshCw, Copy, ExternalLink, ChevronDown, Search
} from 'lucide-react';

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  pending: { label: 'Ожидает', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: Clock },
  paid: { label: 'Оплачен', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: AlertCircle },
  processing: { label: 'Обработка', color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: RefreshCw },
  completed: { label: 'Завершён', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: CheckCircle },
  cancelled: { label: 'Отменён', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: XCircle },
};

interface OrderModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (status: OrderStatus, message?: string) => void;
}

function OrderModal({ order, onClose, onUpdateStatus }: OrderModalProps) {
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [message, setMessage] = useState(order.adminMessage || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    onUpdateStatus(newStatus, message || undefined);
    setLoading(false);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card-dark p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">#{order.orderNumber}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details */}
        <div className="p-3 bg-dark-input rounded-lg mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white">{order.amount} {order.fromCoinSymbol}</span>
            <ArrowRight className="w-4 h-4 text-orange-500" />
            <span className="text-white">{order.receiveAmount} {order.toCoinSymbol}</span>
          </div>
        </div>

        <div className="p-3 bg-dark-input rounded-lg mb-4">
          <p className="text-gray-500 text-xs mb-1">Кошелёк клиента</p>
          <code className="text-white font-mono text-xs break-all">{order.customerWallet}</code>
        </div>

        {/* Status Update */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Статус</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(statusConfig) as OrderStatus[]).map((status) => {
                const config = statusConfig[status];
                return (
                  <button
                    key={status}
                    onClick={() => setNewStatus(status)}
                    className={`p-2 rounded-lg text-xs transition-all ${
                      newStatus === status 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-dark-input text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Сообщение клиенту</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 input-dark resize-none text-sm"
              placeholder="Сообщение..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm">
              Отмена
            </button>
            <motion.button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-2 btn-primary text-sm"
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Сохранить'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const ITEMS_PER_PAGE = 10;

export default function AdminOrdersPage() {
  const { orders, loading, updateOrderStatus } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerWallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.fromCoinSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.toCoinSymbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when filter/search changes
  const handleFilterChange = (status: OrderStatus | 'all') => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleUpdateStatus = (status: OrderStatus, message?: string) => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, status, message);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-white">Заказы</h1>
        </motion.div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Поиск по номеру, кошельку..."
              className="bg-dark-input border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none w-64"
            />
          </div>
          
          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value as OrderStatus | 'all')}
              className="appearance-none bg-dark-input border border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm text-white focus:border-orange-500 focus:outline-none cursor-pointer"
            >
              <option value="all">Все ({orders.length})</option>
              {(Object.keys(statusConfig) as OrderStatus[]).map((status) => {
                const count = orders.filter(o => o.status === status).length;
                return (
                  <option key={status} value={status}>
                    {statusConfig[status].label} ({count})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-dark overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-dark-bg/50 border-b border-gray-800 text-xs text-gray-500 font-medium">
          <div className="col-span-2">ID заказа</div>
          <div className="col-span-3">Кошелёк</div>
          <div className="col-span-2">Обмен</div>
          <div className="col-span-2">Сумма</div>
          <div className="col-span-1">Статус</div>
          <div className="col-span-1">Дата</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 text-gray-600 animate-spin mx-auto" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-10 h-10 text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Нет заказов</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {paginatedOrders.map((order, index) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;
              const walletShort = order.customerWallet.length > 20 
                ? `${order.customerWallet.slice(0, 16)}...` 
                : order.customerWallet;
              
              return (
                <motion.div
                  key={order.id}
                  className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-800/30 transition-colors text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  {/* Order ID */}
                  <div className="col-span-2">
                    <span className="text-white font-medium">{order.orderNumber}</span>
                  </div>
                  
                  {/* Wallet */}
                  <div className="col-span-3 flex items-center gap-1">
                    <span className="text-gray-400 font-mono text-xs truncate">{walletShort}</span>
                    <button 
                      onClick={() => copyToClipboard(order.customerWallet, order.id)}
                      className="text-gray-600 hover:text-orange-400 transition-colors"
                    >
                      {copiedId === order.id ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  
                  {/* Exchange */}
                  <div className="col-span-2">
                    <span className="text-white text-xs">{order.fromCoinSymbol} → {order.toCoinSymbol}</span>
                  </div>
                  
                  {/* Amount */}
                  <div className="col-span-2">
                    <div className="text-white text-xs">{order.amount} {order.fromCoinSymbol}</div>
                    <div className="text-gray-500 text-[10px]">{order.receiveAmount} {order.toCoinSymbol}</div>
                  </div>
                  
                  {/* Status */}
                  <div className="col-span-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bgColor} ${config.color}`}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {config.label}
                    </span>
                  </div>
                  
                  {/* Date */}
                  <div className="col-span-1">
                    <span className="text-gray-500 text-xs">
                      {order.createdAt.toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-orange-400 hover:text-orange-300 text-xs flex items-center gap-1"
                    >
                      Детали <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination info */}
      {filteredOrders.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-gray-500 text-xs">
            Показано {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)} из {filteredOrders.length} заказов
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперёд
              </button>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
