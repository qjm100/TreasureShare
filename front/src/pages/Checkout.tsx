/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @author Ciami
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Check, ShoppingCart } from 'lucide-react';
import { api } from '../api';
import type { CartItem, Address } from '../types';
import ImgWithFallback from '../components/ImgWithFallback';

export default function Checkout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    receiverName: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
  });
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cartRes, addrRes] = await Promise.all([
        api.getCart(),
        api.getAddresses(),
      ]);
      const cartData = cartRes.rows || cartRes.data || cartRes || [];
      const addrData = addrRes.rows || addrRes.data || addrRes || [];
      setCartItems(Array.isArray(cartData) ? cartData : []);
      const addrList = Array.isArray(addrData) ? addrData : [];
      setAddresses(addrList);
      // Auto-select default address
      const defaultAddr = addrList.find((a: Address) => a.isDefault === '1' || a.isDefault === 'true');
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addrList.length > 0) {
        setSelectedAddressId(addrList[0].id);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddAddress = async () => {
    if (!newAddress.receiverName || !newAddress.phone || !newAddress.detail) {
      alert('请填写必填信息');
      return;
    }
    try {
      await api.addAddress(newAddress);
      setShowAddForm(false);
      setNewAddress({ receiverName: '', phone: '', province: '', city: '', district: '', detail: '' });
      fetchData();
    } catch (e: any) {
      alert(e.message || 'Failed to add address');
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedAddressId) {
      alert('请选择收货地址');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.createOrder(selectedAddressId);
      const orderId = res.data || res;
      navigate(`/order/${orderId}`);
    } catch (e: any) {
      alert(e.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const totalRent = cartItems.reduce((sum, item) => sum + item.rentPriceMonth * item.duration, 0);
  const totalDeposit = cartItems.reduce((sum, item) => sum + item.rentPriceMonth * 2, 0);

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
        <button onClick={fetchData} className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold">
          重试
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <ShoppingCart className="w-16 h-16 text-outline-variant mx-auto mb-4" />
        <p className="text-secondary text-lg font-bold mb-2">购物车是空的</p>
        <button onClick={() => navigate('/cart')} className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold">
          返回购物车
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-4 pb-32">
      <div className="flex items-center gap-3 mb-6 mt-2">
        <button onClick={() => navigate('/cart')} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-on-surface" />
        </button>
        <h2 className="text-2xl font-black">确认订单</h2>
      </div>

      {/* Address selection */}
      <section className="mb-6">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> 收货地址
        </h3>
        <div className="space-y-3">
          {addresses.map((addr) => (
            <button
              key={addr.id}
              onClick={() => setSelectedAddressId(addr.id)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                selectedAddressId === addr.id
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant/30 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{addr.receiverName}</span>
                  <span className="text-secondary">{addr.phone}</span>
                  {addr.isDefault === '1' && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">默认</span>
                  )}
                </div>
                {selectedAddressId === addr.id && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
              <p className="text-sm text-secondary mt-1">
                {addr.province}{addr.city}{addr.district} {addr.detail}
              </p>
            </button>
          ))}

          {showAddForm ? (
            <div className="bg-white rounded-2xl p-4 border border-outline-variant/30 space-y-3">
              <input
                type="text"
                placeholder="收货人姓名 *"
                value={newAddress.receiverName}
                onChange={(e) => setNewAddress({ ...newAddress, receiverName: e.target.value })}
                className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <input
                type="text"
                placeholder="手机号 *"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="省"
                  value={newAddress.province}
                  onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                  className="bg-surface-container-low border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <input
                  type="text"
                  placeholder="市"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="bg-surface-container-low border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <input
                  type="text"
                  placeholder="区"
                  value={newAddress.district}
                  onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                  className="bg-surface-container-low border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="详细地址 *"
                value={newAddress.detail}
                onChange={(e) => setNewAddress({ ...newAddress, detail: e.target.value })}
                className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 border border-outline-variant rounded-full text-sm font-bold"
                >
                  取消
                </button>
                <button
                  onClick={handleAddAddress}
                  className="flex-1 py-2 bg-primary text-white rounded-full text-sm font-bold"
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-4 border-2 border-dashed border-outline-variant rounded-2xl flex items-center justify-center gap-2 text-secondary hover:text-primary transition-colors"
            >
              <Plus className="w-5 h-5" /> 添加新地址
            </button>
          )}
        </div>
      </section>

      {/* Order summary */}
      <section className="mb-6">
        <h3 className="font-bold text-lg mb-3">订单商品</h3>
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm border border-outline-variant/20 flex gap-3">
              <ImgWithFallback
                src={item.productImage}
                alt={item.productName}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-surface-container"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm line-clamp-1">{item.productName}</p>
                <p className="text-secondary text-xs">
                  ¥{item.rentPriceMonth}/月 x {item.duration}月
                </p>
                <p className="text-primary font-bold text-sm mt-1">
                  ¥{(item.rentPriceMonth * item.duration).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Price summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-secondary">商品租金</span>
          <span className="font-bold">¥{totalRent.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary">押金</span>
          <span className="font-bold">¥{totalDeposit.toFixed(2)}</span>
        </div>
        <div className="border-t border-outline-variant/30 pt-3 flex justify-between">
          <span className="font-black text-lg">应付总额</span>
          <span className="font-black text-lg text-primary">¥{(totalRent + totalDeposit).toFixed(2)}</span>
        </div>
      </div>

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmitOrder}
        disabled={submitting || !selectedAddressId}
        className="w-full mt-6 py-4 bg-primary text-white rounded-full font-black text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? '提交中...' : '提交订单'}
      </motion.button>
    </motion.div>
  );
}
