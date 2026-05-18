/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @author Ciami
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, CreditCard, X } from 'lucide-react';
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

function getStatusColor(status: string): string {
  switch (status) {
    case '0': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case '1':
    case '2': return 'bg-blue-100 text-blue-700 border-blue-200';
    case '3':
    case '4':
    case '5': return 'bg-green-100 text-green-700 border-green-200';
    case '6': return 'bg-gray-100 text-gray-600 border-gray-200';
    case '7': return 'bg-red-100 text-red-500 border-red-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ToyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnLogisticsNo, setReturnLogisticsNo] = useState('');

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getOrder(Number(id));
      const data = res.data || res;
      setOrder(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleAction = async (action: () => Promise<any>) => {
    setActionLoading(true);
    try {
      await action();
      await fetchOrder();
    } catch (e: any) {
      alert(e.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-fixed border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-secondary mb-4">{error || 'Order not found'}</p>
        <button onClick={() => navigate('/orders')} className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold">
          返回订单列表
        </button>
      </div>
    );
  }

  const canPay = order.status === '0';
  const canReceive = order.status === '2';
  const canReturn = order.status === '3';

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-4 pb-32">
      <div className="flex items-center gap-3 mb-6 mt-2">
        <button onClick={() => navigate('/orders')} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-on-surface" />
        </button>
        <h2 className="text-2xl font-black">订单详情</h2>
      </div>

      {/* Status banner */}
      <div className={`mb-6 p-4 rounded-2xl border ${getStatusColor(order.status)}`}>
        <p className="text-2xl font-black">{STATUS_MAP[order.status] || order.status}</p>
        <p className="text-sm mt-1 opacity-80">订单号: {order.orderNo}</p>
        {order.payTime && <p className="text-xs mt-1 opacity-70">付款时间: {order.payTime}</p>}
      </div>

      {/* Receiver info */}
      {order.receiverName && (
        <section className="mb-4 bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> 收货信息
          </h3>
          <p className="text-sm">
            <span className="font-bold">{order.receiverName}</span>
            <span className="text-secondary ml-2">{order.receiverPhone}</span>
          </p>
          <p className="text-xs text-secondary mt-1">{order.receiverAddress}</p>
        </section>
      )}

      {/* Logistics info if shipped */}
      {order.logisticsNo && (
        <section className="mb-4 bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" /> 物流信息
          </h3>
          <p className="text-sm">快递单号: {order.logisticsNo}</p>
        </section>
      )}

      {/* Return logistics */}
      {order.returnLogisticsNo && (
        <section className="mb-4 bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            <Package className="w-4 h-4 text-tertiary" /> 归还物流
          </h3>
          <p className="text-sm">快递单号: {order.returnLogisticsNo}</p>
        </section>
      )}

      {/* Order items */}
      <section className="mb-4 bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20">
        <h3 className="font-bold text-sm mb-3">商品信息</h3>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-3">
              <ImgWithFallback
                src={item.productImage}
                alt={item.productName}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-surface-container"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm line-clamp-1">{item.productName}</p>
                <p className="text-xs text-secondary">
                  ¥{item.rentPrice} x {item.duration}月 x {item.quantity}件
                </p>
                <p className="text-primary font-bold text-sm mt-1">
                  ¥{(item.rentPrice * item.duration * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Price summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-secondary">租金合计</span>
          <span className="font-bold">¥{order.totalRent}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary">押金</span>
          <span className="font-bold">¥{order.deposit}</span>
        </div>
        <div className="border-t border-outline-variant/30 pt-3 flex justify-between">
          <span className="font-black">总计</span>
          <span className="font-black text-primary">¥{(order.totalRent + order.deposit).toFixed(2)}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {canPay && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAction(() => api.payOrder(order.id))}
            disabled={actionLoading}
            className="w-full py-4 bg-primary text-white rounded-full font-black text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CreditCard className="w-5 h-5" />
            {actionLoading ? '处理中...' : '去支付'}
          </motion.button>
        )}
        {canReceive && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAction(() => api.receiveOrder(order.id))}
            disabled={actionLoading}
            className="w-full py-4 bg-primary text-white rounded-full font-black text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Package className="w-5 h-5" />
            {actionLoading ? '处理中...' : '确认收货'}
          </motion.button>
        )}
        {canReturn && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowReturnModal(true); setReturnLogisticsNo(''); }}
            disabled={actionLoading}
            className="w-full py-4 bg-tertiary text-white rounded-full font-black text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Package className="w-5 h-5" />
            {actionLoading ? '处理中...' : '申请归还'}
          </motion.button>
        )}
      </div>

      {/* Return logistics modal */}
      <AnimatePresence>
        {showReturnModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50"
            onClick={() => setShowReturnModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black">填写归还物流单号</h3>
                <button onClick={() => setShowReturnModal(false)} className="p-1 hover:bg-surface-container-low rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-secondary mb-4">请输入归还快递单号</p>
              <div>
                <label className="text-xs text-secondary font-bold mb-1 block">物流单号</label>
                <input
                  type="text"
                  value={returnLogisticsNo}
                  onChange={(e) => setReturnLogisticsNo(e.target.value)}
                  placeholder="请输入物流单号"
                  className="w-full bg-surface-container-low border-none rounded-full py-3 px-4 text-sm focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={() => handleAction(() => api.returnOrder(order.id, returnLogisticsNo.trim()).then(() => setShowReturnModal(false)))}
                disabled={actionLoading || !returnLogisticsNo.trim()}
                className="mt-6 w-full py-3 bg-tertiary text-white rounded-full font-bold text-sm disabled:opacity-40 transition-opacity"
              >
                {actionLoading ? '处理中...' : '确认归还'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create time */}
      {order.createTime && (
        <p className="text-center text-[10px] text-outline mt-6">
          创建时间: {order.createTime}
        </p>
      )}
    </motion.div>
  );
}
