/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @author Ciami
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, CheckCircle, Package, X } from 'lucide-react';
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
  { key: '1', label: '待发货' },
  { key: '3', label: '租赁中' },
  { key: '4', label: '待归还' },
  { key: '6', label: '已完成' },
];

function getStatusColor(status: string): string {
  switch (status) {
    case '0': return 'bg-yellow-100 text-yellow-700';
    case '1':
    case '2': return 'bg-blue-100 text-blue-700';
    case '3': return 'bg-green-100 text-green-700';
    case '4': return 'bg-purple-100 text-purple-700';
    case '5': return 'bg-orange-100 text-orange-700';
    case '6': return 'bg-gray-100 text-gray-600';
    case '7': return 'bg-red-100 text-red-500';
    default: return 'bg-gray-100 text-gray-600';
  }
}

export default function RentedOut() {
  const [orders, setOrders] = useState<ToyOrder[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ship modal
  const [shipTarget, setShipTarget] = useState<ToyOrder | null>(null);
  const [logisticsNo, setLogisticsNo] = useState('');
  const [shipping, setShipping] = useState(false);

  // Confirm return modal
  const [confirmReturnTarget, setConfirmReturnTarget] = useState<ToyOrder | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Disinfect modal
  const [disinfectTarget, setDisinfectTarget] = useState<ToyOrder | null>(null);
  const [disinfecting, setDisinfecting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSellerOrders();
      const data = res.rows || res.data || res || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleShip = async () => {
    if (!shipTarget || !logisticsNo.trim()) return;
    setShipping(true);
    try {
      await api.shipOrder(shipTarget.id, logisticsNo.trim());
      setShipTarget(null);
      setLogisticsNo('');
      fetchOrders();
    } catch (e: any) {
      alert(e.message || '发货失败');
    } finally {
      setShipping(false);
    }
  };

  const handleConfirmReturn = async () => {
    if (!confirmReturnTarget) return;
    setConfirming(true);
    try {
      await api.confirmReturnOrder(confirmReturnTarget.id);
      setConfirmReturnTarget(null);
      fetchOrders();
    } catch (e: any) {
      alert(e.message || '确认失败');
    } finally {
      setConfirming(false);
    }
  };

  const handleDisinfect = async () => {
    if (!disinfectTarget) return;
    setDisinfecting(true);
    try {
      await api.disinfectOrder(disinfectTarget.id);
      setDisinfectTarget(null);
      fetchOrders();
    } catch (e: any) {
      alert(e.message || '操作失败');
    } finally {
      setDisinfecting(false);
    }
  };

  const filteredOrders = activeTab
    ? orders.filter((o) => o.status === activeTab)
    : orders;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-4 pb-32">
      <h2 className="text-2xl font-black mb-6 mt-2">我的出租</h2>

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
              <p className="text-secondary text-lg font-bold">暂无出租订单</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20"
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
                      <p className="text-primary font-black mt-1">
                        ¥{order.totalRent}
                      </p>
                    </div>
                  </div>

                  {/* Logistics info */}
                  {order.logisticsNo && (
                    <p className="text-xs text-secondary mt-2">
                      <Truck className="w-3 h-3 inline mr-1" />
                      发货单号: {order.logisticsNo}
                    </p>
                  )}
                  {order.returnLogisticsNo && (
                    <p className="text-xs text-secondary mt-1">
                      <Truck className="w-3 h-3 inline mr-1" />
                      归还单号: {order.returnLogisticsNo}
                    </p>
                  )}

                  {/* Address info */}
                  {order.receiverAddress && (
                    <p className="text-xs text-outline mt-2 truncate">
                      收货地址: {order.receiverAddress} ({order.receiverName} {order.receiverPhone})
                    </p>
                  )}

                  {order.createTime && (
                    <p className="text-[10px] text-outline mt-2">{order.createTime}</p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {order.status === '1' && (
                      <button
                        onClick={() => { setShipTarget(order); setLogisticsNo(''); }}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-primary rounded-full hover:opacity-90 transition-opacity"
                      >
                        填写单号并发货
                      </button>
                    )}
                    {order.status === '4' && (
                      <button
                        onClick={() => setConfirmReturnTarget(order)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-green-600 rounded-full hover:opacity-90 transition-opacity"
                      >
                        确认收到归还
                      </button>
                    )}
                    {order.status === '5' && (
                      <button
                        onClick={() => setDisinfectTarget(order)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-orange-500 rounded-full hover:opacity-90 transition-opacity"
                      >
                        消毒完成
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Ship modal */}
      <AnimatePresence>
        {shipTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50"
            onClick={() => setShipTarget(null)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black">填写物流单号</h3>
                <button onClick={() => setShipTarget(null)} className="p-1 hover:bg-surface-container-low rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-secondary mb-4">订单号: {shipTarget.orderNo}</p>
              <div>
                <label className="text-xs text-secondary font-bold mb-1 block">物流单号</label>
                <input
                  type="text"
                  value={logisticsNo}
                  onChange={(e) => setLogisticsNo(e.target.value)}
                  placeholder="请输入物流单号"
                  className="w-full bg-surface-container-low border-none rounded-full py-3 px-4 text-sm focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={handleShip}
                disabled={shipping || !logisticsNo.trim()}
                className="mt-6 w-full py-3 bg-primary text-on-primary rounded-full font-bold text-sm disabled:opacity-40 transition-opacity"
              >
                {shipping ? '发货中...' : '确认发货'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm return modal */}
      <AnimatePresence>
        {confirmReturnTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-8"
            onClick={() => setConfirmReturnTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black">确认收到归还</h3>
                <button onClick={() => setConfirmReturnTarget(null)} className="p-1 hover:bg-surface-container-low rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-secondary mb-1">订单号: {confirmReturnTarget.orderNo}</p>
              {confirmReturnTarget.returnLogisticsNo && (
                <p className="text-sm text-secondary mb-4">归还单号: {confirmReturnTarget.returnLogisticsNo}</p>
              )}
              <p className="text-sm text-secondary mb-6">确认已收到归还物品？确认后将进入消毒环节。</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmReturnTarget(null)}
                  className="flex-1 py-3 border border-outline-variant rounded-full font-bold text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmReturn}
                  disabled={confirming}
                  className="flex-1 py-3 bg-green-600 text-white rounded-full font-bold text-sm disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  {confirming ? '确认中...' : '确认收货'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disinfect modal */}
      <AnimatePresence>
        {disinfectTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-8"
            onClick={() => setDisinfectTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black">消毒完成</h3>
                <button onClick={() => setDisinfectTarget(null)} className="p-1 hover:bg-surface-container-low rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-secondary mb-1">订单号: {disinfectTarget.orderNo}</p>
              <p className="text-sm text-secondary mb-6">确认消毒完成？确认后订单将完成，库存将恢复。</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDisinfectTarget(null)}
                  className="flex-1 py-3 border border-outline-variant rounded-full font-bold text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleDisinfect}
                  disabled={disinfecting}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-full font-bold text-sm disabled:opacity-50"
                >
                  {disinfecting ? '处理中...' : '确认完成'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
