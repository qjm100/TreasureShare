/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @author Ciami
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronRight, X } from 'lucide-react';
import { api } from '../api';
import type { ToyOrder } from '../types';
import ImgWithFallback from '../components/ImgWithFallback';

const STATUS_MAP: Record<string, string> = {
  '0': '待付款',
  '1': '待发货',
  '2': '待收货',
  '3': '租赁中',
  '4': '待归还',
  '5': '待消毒',
  '6': '已完成',
  '7': '已取消',
};

const TABS = [
  { key: '', label: '全部' },
  { key: '0', label: '待付款' },
  { key: '3', label: '租赁中' },
  { key: '6', label: '已完成' },
];

function getStatusColor(status: string): string {
  switch (status) {
    case '0': return 'bg-yellow-100 text-yellow-700';
    case '1':
    case '2': return 'bg-blue-100 text-blue-700';
    case '3':
    case '4':
    case '5': return 'bg-green-100 text-green-700';
    case '6': return 'bg-gray-100 text-gray-600';
    case '7': return 'bg-red-100 text-red-500';
    default: return 'bg-gray-100 text-gray-600';
  }
}

export default function Orders() {
  const [orders, setOrders] = useState<ToyOrder[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ToyOrder | null>(null);
  const [canceling, setCanceling] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getOrders();
      const data = res.rows || res.data || res || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCanceling(true);
    try {
      await api.cancelOrder(cancelTarget.id);
      setCancelTarget(null);
      fetchOrders();
    } catch (e: any) {
      alert(e.message || '取消失败');
    } finally {
      setCanceling(false);
    }
  };

  const filteredOrders = activeTab
    ? orders.filter((o) => o.status === activeTab)
    : orders;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-4 pb-32">
      <h2 className="text-2xl font-black mb-6 mt-2">我的订单</h2>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container-highest text-on-surface-variant hover:opacity-80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-primary-fixed border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <p className="text-secondary mb-4">{error}</p>
          <button onClick={fetchOrders} className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold">
            重试
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-outline-variant mx-auto mb-4" />
              <p className="text-secondary text-lg font-bold">暂无订单</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-secondary">订单号: {order.orderNo}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusColor(order.status)}`}>
                      {STATUS_MAP[order.status] || order.status}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex gap-1">
                      {order.items?.slice(0, 3).map((item) => (
                        <ImgWithFallback
                          key={item.id}
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 rounded-xl object-cover bg-surface-container"
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2 text-on-surface-variant">
                        {order.items?.map((i) => i.productName).join('、')}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-primary font-black">
                          ¥{order.totalRent}
                        </p>
                        <ChevronRight className="w-4 h-4 text-outline" />
                      </div>
                    </div>
                  </div>
                  {order.createTime && (
                    <p className="text-[10px] text-outline mt-2">{order.createTime}</p>
                  )}
                  {(order.status === '0' || order.status === '1') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setCancelTarget(order); }}
                      className="mt-2 px-4 py-1.5 text-xs font-bold text-red-500 border border-red-300 rounded-full hover:bg-red-50 transition-colors"
                    >
                      取消订单
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Cancel confirmation modal */}
      <AnimatePresence>
        {cancelTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-8"
            onClick={() => setCancelTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black">确认取消订单</h3>
                <button onClick={() => setCancelTarget(null)} className="p-1 hover:bg-surface-container rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-secondary mb-1">订单号: {cancelTarget.orderNo}</p>
              <p className="text-sm text-secondary mb-6">取消后无法恢复，确定要取消此订单吗？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelTarget(null)}
                  className="flex-1 py-3 border border-outline-variant rounded-full font-bold text-sm"
                >
                  暂不取消
                </button>
                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  className="flex-1 py-3 bg-red-500 text-white rounded-full font-bold text-sm disabled:opacity-50"
                >
                  {canceling ? '取消中...' : '确定取消'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
