/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @author Ciami
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { api } from '../api';
import type { CartItem } from '../types';
import ImgWithFallback from '../components/ImgWithFallback';

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCart();
      const data = res.rows || res.data || res || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateDuration = async (item: CartItem, newDuration: number) => {
    if (newDuration < 1) return;
    setUpdatingId(item.id);
    try {
      await api.updateCart(item.id, newDuration);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, duration: newDuration } : i))
      );
    } catch (e: any) {
      alert(e.message || 'Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (item: CartItem) => {
    setUpdatingId(item.id);
    try {
      await api.removeFromCart(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (e: any) {
      alert(e.message || 'Failed to remove');
    } finally {
      setUpdatingId(null);
    }
  };

  const totalRent = items.reduce((sum, item) => sum + item.rentPriceMonth * item.duration, 0);
  const totalDeposit = items.reduce((sum, item) => sum + item.rentPriceMonth * 2, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-fixed border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-secondary mb-4">{error}</p>
        <button onClick={fetchCart} className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold">
          重试
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-4 pb-32">
      <div className="flex items-center gap-3 mb-6 mt-2">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-on-surface" />
        </button>
        <h2 className="text-2xl font-black">购物车</h2>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="w-16 h-16 text-outline-variant mx-auto mb-4" />
          <p className="text-secondary text-lg font-bold mb-2">购物车是空的</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold"
          >
            去逛逛
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex gap-4"
              >
                <ImgWithFallback
                  src={item.productImage}
                  alt={item.productName}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-surface-container"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm line-clamp-2">{item.productName}</h3>
                  <p className="text-primary font-black text-lg mt-1">¥{item.rentPriceMonth}<span className="text-xs font-normal text-secondary">/月</span></p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateDuration(item, item.duration - 1)}
                        disabled={updatingId === item.id || item.duration <= 1}
                        className="w-7 h-7 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-50"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm min-w-[2rem] text-center">{item.duration}月</span>
                      <button
                        onClick={() => handleUpdateDuration(item, item.duration + 1)}
                        disabled={updatingId === item.id}
                        className="w-7 h-7 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item)}
                      disabled={updatingId === item.id}
                      className="p-1.5 text-secondary hover:text-primary transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-secondary">租金合计</span>
              <span className="font-bold">¥{totalRent.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary">押金合计</span>
              <span className="font-bold">¥{totalDeposit.toFixed(2)}</span>
            </div>
            <div className="border-t border-outline-variant/30 pt-3 flex justify-between">
              <span className="font-black text-lg">合计</span>
              <span className="font-black text-lg text-primary">¥{(totalRent + totalDeposit).toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/checkout')}
            className="w-full mt-6 py-4 bg-primary text-white rounded-full font-black text-lg shadow-lg flex items-center justify-center gap-2"
          >
            去结算
          </motion.button>
        </>
      )}
    </motion.div>
  );
}
