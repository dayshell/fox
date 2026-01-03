'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAdmins, Admin, AdminRole } from '@/hooks/useAdmins';
import { Plus, Trash2, Edit2, X, User, Mail, Lock, Shield } from 'lucide-react';

export default function AdminsPage() {
  const router = useRouter();
  const { admins, currentAdmin, isSuperAdmin, addAdmin, updateAdmin, deleteAdmin, loading } = useAdmins();
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator' as AdminRole,
  });

  // Redirect if not superadmin
  useEffect(() => {
    if (!loading && currentAdmin && !isSuperAdmin) {
      router.push('/admin/orders');
    }
  }, [loading, currentAdmin, isSuperAdmin, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAdmin) {
      updateAdmin(editingAdmin.id, {
        name: formData.name,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
        role: formData.role,
      });
    } else {
      addAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
    }
    
    setShowModal(false);
    setEditingAdmin(null);
    setFormData({ name: '', email: '', password: '', role: 'operator' });
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить этого админа?')) {
      const success = deleteAdmin(id);
      if (!success) {
        alert('Нельзя удалить последнего главного админа');
      }
    }
  };

  const openAddModal = () => {
    setEditingAdmin(null);
    setFormData({ name: '', email: '', password: '', role: 'operator' });
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-white">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Управление админами</h1>
          <p className="text-gray-500 mt-1">Создавайте операторов с ограниченным доступом</p>
        </div>
        <motion.button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 btn-primary rounded-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Добавить админа
        </motion.button>
      </div>

      {/* Roles explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="card-dark p-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-orange-400" />
            <h3 className="text-white font-medium">Главный админ</h3>
          </div>
          <p className="text-gray-500 text-sm">Полный доступ: заказы, монеты, реквизиты, настройки, управление админами</p>
        </div>
        <div className="card-dark p-4">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-medium">Оператор</h3>
          </div>
          <p className="text-gray-500 text-sm">Ограниченный доступ: только просмотр и обработка заказов, отзывы</p>
        </div>
      </div>

      {/* Admins list */}
      <div className="card-dark overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Имя</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Email</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Роль</th>
              <th className="text-left text-gray-400 font-medium px-6 py-4">Создан</th>
              <th className="text-right text-gray-400 font-medium px-6 py-4">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-800/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      admin.role === 'superadmin' ? 'bg-orange-500/20' : 'bg-blue-500/20'
                    }`}>
                      {admin.role === 'superadmin' ? (
                        <Shield className="w-4 h-4 text-orange-400" />
                      ) : (
                        <User className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <span className="text-white">{admin.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">{admin.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    admin.role === 'superadmin' 
                      ? 'bg-orange-500/20 text-orange-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {admin.role === 'superadmin' ? 'Главный админ' : 'Оператор'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {admin.createdAt.toLocaleDateString('ru-RU')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <motion.button
                      onClick={() => handleEdit(admin)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    {admin.id !== currentAdmin?.id && (
                      <motion.button
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="card-dark p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingAdmin ? 'Редактировать админа' : 'Новый админ'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Имя</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 input-dark"
                    placeholder="Имя админа"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 input-dark"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Пароль {editingAdmin && <span className="text-gray-600">(оставьте пустым, чтобы не менять)</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 input-dark"
                    placeholder="••••••••"
                    {...(!editingAdmin && { required: true })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Роль</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
                  className="w-full px-4 py-3 input-dark"
                >
                  <option value="operator">Оператор (только заказы)</option>
                  <option value="superadmin">Главный админ (полный доступ)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 btn-primary rounded-xl"
                >
                  {editingAdmin ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
