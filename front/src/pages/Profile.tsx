/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @author Ciami
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Star,
  LogOut,
  Edit,
  Trash2,
  X,
  Plus,
  Home,
  Package,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Address, ToyProduct } from '../types';
import ImgWithFallback from '../components/ImgWithFallback';

interface ProfileData {
  id?: number;
  userId?: number;
  nickName?: string;
  avatar?: string;
  creditScore?: number;
  userName?: string;
}

interface AddressFormData {
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

const EMPTY_ADDRESS_FORM: AddressFormData = {
  receiverName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
};

export default function Profile() {
  const navigate = useNavigate();

  // Profile
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Edit profile modal
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editNickName, setEditNickName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address form modal
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormData>(EMPTY_ADDRESS_FORM);
  const [savingAddress, setSavingAddress] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

  // My products
  const [myProducts, setMyProducts] = useState<ToyProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ToyProduct | null>(null);
  const [editProductForm, setEditProductForm] = useState({ name: '', image: '', price: 0, rentPriceDay: 0, rentPriceMonth: 0, stock: 0, description: '', categoryId: 0, ageRange: '' });
  const [savingProduct, setSavingProduct] = useState(false);
  const [deleteProductTarget, setDeleteProductTarget] = useState<ToyProduct | null>(null);

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res = await api.getProfile();
      const data = res.data || res;
      setProfile(data);
    } catch {
      // keep whatever we had
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    setAddressLoading(true);
    setAddressError(null);
    try {
      const res = await api.getAddresses();
      const data = res.rows || res.data || [];
      setAddresses(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setAddressError(e instanceof Error ? e.message : '加载地址失败');
    } finally {
      setAddressLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
    fetchMyProducts();
  }, [fetchProfile, fetchAddresses]);

  const fetchMyProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await api.getMyProducts();
      const data = res.data || res.rows || [];
      setMyProducts(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- Profile editing ---

  const openEditProfile = () => {
    setEditNickName(profile?.nickName || '');
    setEditAvatar(profile?.avatar || '');
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!editNickName.trim()) return;
    setSavingProfile(true);
    try {
      await api.updateProfile({ nickName: editNickName, avatar: editAvatar });
      setProfile((prev) =>
        prev ? { ...prev, nickName: editNickName, avatar: editAvatar } : prev,
      );
      setShowEditProfile(false);
    } catch {
      // silently fail
    } finally {
      setSavingProfile(false);
    }
  };

  // --- Address management ---

  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setShowAddressForm(true);
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      receiverName: addr.receiverName,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      isDefault: addr.isDefault === '1',
    });
    setShowAddressForm(true);
  };

  const handleSaveAddress = async () => {
    const { receiverName, phone, detail } = addressForm;
    if (!receiverName.trim() || !phone.trim() || !detail.trim()) return;

    setSavingAddress(true);
    try {
      const payload = {
        ...addressForm,
        isDefault: addressForm.isDefault ? '1' : '0',
      };
      if (editingAddress) {
        await api.updateAddress(editingAddress.id, payload);
      } else {
        await api.addAddress(payload);
      }
      setShowAddressForm(false);
      fetchAddresses();
    } catch {
      // silently fail
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteAddress(deleteTarget.id);
      setDeleteTarget(null);
      fetchAddresses();
    } catch {
      // silently fail
    }
  };

  // --- Product management ---

  const openEditProduct = (product: ToyProduct) => {
    setEditingProduct(product);
    setEditProductForm({
      name: product.name,
      image: product.image || '',
      price: product.price,
      rentPriceDay: product.rentPriceDay,
      rentPriceMonth: product.rentPriceMonth,
      stock: product.stock,
      description: product.description || '',
      categoryId: product.categoryId,
      ageRange: product.ageRange || '',
    });
    setShowEditProduct(true);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct || !editProductForm.name.trim()) return;
    setSavingProduct(true);
    try {
      await api.updateProduct(editingProduct.id, editProductForm);
      setShowEditProduct(false);
      fetchMyProducts();
    } catch {
      // silently fail
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    try {
      await api.deleteProduct(deleteProductTarget.id);
      setDeleteProductTarget(null);
      fetchMyProducts();
    } catch {
      // silently fail
    }
  };

  const handleSetDefault = async (addr: Address) => {
    if (addr.isDefault === '1') return;
    try {
      await api.updateAddress(addr.id, {
        receiverName: addr.receiverName,
        phone: addr.phone,
        province: addr.province,
        city: addr.city,
        district: addr.district,
        detail: addr.detail,
        isDefault: '1',
      });
      fetchAddresses();
    } catch {
      // silently fail
    }
  };

  // --- Render ---

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.nickName || profile?.userName || '用户';
  const avatarUrl =
    profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=primary&color=fff&size=96`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pb-32"
    >
      {/* Banner */}
      <div className="relative w-full h-40 overflow-hidden rounded-b-3xl -mx-4 px-0">
        <ImgWithFallback
          src="https://images.unsplash.com/photo-1557683316-973673baf926?w=600&h=200&fit=crop"
          className="w-full h-full object-cover"
          alt="背景"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Profile card */}
      <div className="-mt-12 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-md border border-outline-variant/20 mb-6">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="relative w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg bg-surface-container flex-shrink-0">
              <ImgWithFallback src={avatarUrl} className="w-full h-full object-cover" alt="头像" />
              <button
                onClick={openEditProfile}
                className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md"
              >
                <Edit className="w-3.5 h-3.5 text-on-primary" />
              </button>
            </div>
            <div className="flex gap-2 flex-wrap flex-1 justify-end">
              <button
                onClick={() => navigate('/orders')}
                className="bg-primary text-on-primary px-4 py-2 rounded-full font-bold text-sm shadow-md whitespace-nowrap"
              >
                我的订单
              </button>
              <button
                onClick={() => navigate('/rented-out')}
                className="bg-surface-container px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap"
              >
                我的出租
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="bg-surface-container px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap"
              >
                购物车
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black">{displayName}</h1>
            {profile?.creditScore !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                  profile.creditScore >= 80
                    ? 'bg-green-100 text-green-700'
                    : profile.creditScore >= 60
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-500'
                }`}
              >
                <Star className="w-3 h-3" />
                信用 {profile.creditScore}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Address section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-lg flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            收货地址
          </h3>
          <button
            onClick={openAddAddress}
            className="text-primary font-bold text-sm flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            新增
          </button>
        </div>

        {addressLoading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-3 border-surface-container-high border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {addressError && (
          <div className="text-center py-8">
            <p className="text-secondary text-sm mb-3">{addressError}</p>
            <button
              onClick={fetchAddresses}
              className="px-4 py-1.5 bg-primary text-on-primary rounded-full font-bold text-xs"
            >
              重试
            </button>
          </div>
        )}

        {!addressLoading && !addressError && addresses.length === 0 && (
          <div className="text-center py-8 text-secondary">
            <MapPin className="w-10 h-10 text-outline-variant mx-auto mb-2" />
            <p className="text-sm">暂无收货地址</p>
            <button
              onClick={openAddAddress}
              className="mt-2 text-primary font-bold text-xs"
            >
              添加地址
            </button>
          </div>
        )}

        {!addressLoading && !addressError && addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => handleSetDefault(addr)}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  addr.isDefault === '1'
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant/20 hover:border-outline-variant/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm">{addr.receiverName}</span>
                      <span className="text-xs text-secondary">{addr.phone}</span>
                      {addr.isDefault === '1' && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                          默认
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-secondary truncate">
                      {addr.province}
                      {addr.city}
                      {addr.district} {addr.detail}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditAddress(addr);
                      }}
                      className="p-1.5 hover:bg-surface-container-low rounded-full transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-outline" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(addr);
                      }}
                      className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Products section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            我的发布
          </h3>
          <button
            onClick={() => navigate('/post')}
            className="text-primary font-bold text-sm flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            发布
          </button>
        </div>

        {productsLoading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-3 border-surface-container-high border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!productsLoading && myProducts.length === 0 && (
          <div className="text-center py-8 text-secondary">
            <Package className="w-10 h-10 text-outline-variant mx-auto mb-2" />
            <p className="text-sm">暂无发布的商品</p>
          </div>
        )}

        {!productsLoading && myProducts.length > 0 && (
          <div className="space-y-2">
            {myProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors"
              >
                <ImgWithFallback
                  src={product.image || ''}
                  alt={product.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-surface-container"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{product.name}</p>
                  <p className="text-primary font-black text-xs">
                    ¥{product.rentPriceMonth}/月 · 库存 {product.stock}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEditProduct(product)}
                    className="p-1.5 hover:bg-surface-container-low rounded-full transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-outline" />
                  </button>
                  <button
                    onClick={() => setDeleteProductTarget(product)}
                    className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 border border-red-300 text-red-500 rounded-full font-bold text-sm hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4 inline mr-2" />
        退出登录
      </button>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setShowEditProfile(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black">编辑资料</h3>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="p-1 hover:bg-surface-container-low rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-secondary font-bold mb-1 block">昵称</label>
                  <input
                    type="text"
                    value={editNickName}
                    onChange={(e) => setEditNickName(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-full py-3 px-4 text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary font-bold mb-1 block">头像链接</label>
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-surface-container-low border-none rounded-full py-3 px-4 text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
                {editAvatar && (
                  <div className="flex justify-center">
                    <ImgWithFallback
                      src={editAvatar}
                      className="w-20 h-20 rounded-full object-cover border-2 border-outline-variant/20"
                      alt="预览"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile || !editNickName.trim()}
                className="mt-6 w-full py-3 bg-primary text-on-primary rounded-full font-bold text-sm disabled:opacity-40 transition-opacity"
              >
                {savingProfile ? '保存中...' : '保存'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address Form Modal */}
      <AnimatePresence>
        {showAddressForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setShowAddressForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black">
                  {editingAddress ? '编辑地址' : '新增地址'}
                </h3>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="p-1 hover:bg-surface-container-low rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-secondary font-bold mb-1 block">收货人</label>
                  <input
                    type="text"
                    value={addressForm.receiverName}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, receiverName: e.target.value }))
                    }
                    className="w-full bg-surface-container-low border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary font-bold mb-1 block">电话</label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full bg-surface-container-low border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-secondary font-bold mb-1 block">省</label>
                    <input
                      type="text"
                      value={addressForm.province}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, province: e.target.value }))
                      }
                      className="w-full bg-surface-container-low border-none rounded-full py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-secondary font-bold mb-1 block">市</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, city: e.target.value }))
                      }
                      className="w-full bg-surface-container-low border-none rounded-full py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-secondary font-bold mb-1 block">区</label>
                    <input
                      type="text"
                      value={addressForm.district}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, district: e.target.value }))
                      }
                      className="w-full bg-surface-container-low border-none rounded-full py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-secondary font-bold mb-1 block">详细地址</label>
                  <input
                    type="text"
                    value={addressForm.detail}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, detail: e.target.value }))
                    }
                    className="w-full bg-surface-container-low border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                    }
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span className="text-sm font-bold">设为默认地址</span>
                </label>
              </div>

              <button
                onClick={handleSaveAddress}
                disabled={
                  savingAddress ||
                  !addressForm.receiverName.trim() ||
                  !addressForm.phone.trim() ||
                  !addressForm.detail.trim()
                }
                className="mt-6 w-full py-3 bg-primary text-on-primary rounded-full font-bold text-sm disabled:opacity-40 transition-opacity"
              >
                {savingAddress ? '保存中...' : '保存'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {showEditProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setShowEditProduct(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black">编辑商品</h3>
                <button onClick={() => setShowEditProduct(false)} className="p-1 hover:bg-surface-container-low rounded-full">
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-secondary font-bold mb-1 block">商品名称</label>
                  <input
                    type="text"
                    value={editProductForm.name}
                    onChange={(e) => setEditProductForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-secondary font-bold mb-1 block">日租价格</label>
                    <input
                      type="number"
                      value={editProductForm.rentPriceDay}
                      onChange={(e) => setEditProductForm((prev) => ({ ...prev, rentPriceDay: Number(e.target.value) }))}
                      className="w-full bg-surface-container-low border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-secondary font-bold mb-1 block">月租价格</label>
                    <input
                      type="number"
                      value={editProductForm.rentPriceMonth}
                      onChange={(e) => setEditProductForm((prev) => ({ ...prev, rentPriceMonth: Number(e.target.value) }))}
                      className="w-full bg-surface-container-low border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-secondary font-bold mb-1 block">原价</label>
                    <input
                      type="number"
                      value={editProductForm.price}
                      onChange={(e) => setEditProductForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full bg-surface-container-low border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-secondary font-bold mb-1 block">库存</label>
                    <input
                      type="number"
                      value={editProductForm.stock}
                      onChange={(e) => setEditProductForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                      className="w-full bg-surface-container-low border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-secondary font-bold mb-1 block">适用年龄</label>
                  <input
                    type="text"
                    value={editProductForm.ageRange}
                    onChange={(e) => setEditProductForm((prev) => ({ ...prev, ageRange: e.target.value }))}
                    placeholder="例如: 3-6岁"
                    className="w-full bg-surface-container-low border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary font-bold mb-1 block">描述</label>
                  <textarea
                    value={editProductForm.description}
                    onChange={(e) => setEditProductForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-surface-container-low border-none rounded-2xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProduct}
                disabled={savingProduct || !editProductForm.name.trim()}
                className="mt-6 w-full py-3 bg-primary text-on-primary rounded-full font-bold text-sm disabled:opacity-40"
              >
                {savingProduct ? '保存中...' : '保存'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Product Confirmation */}
      <AnimatePresence>
        {deleteProductTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
            onClick={() => setDeleteProductTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-80 mx-4 shadow-xl"
            >
              <h3 className="text-lg font-black text-center mb-2">确认删除</h3>
              <p className="text-sm text-secondary text-center mb-6">
                确定要删除商品「{deleteProductTarget.name}」吗？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteProductTarget(null)}
                  className="flex-1 py-2.5 bg-surface-container-low rounded-full font-bold text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-full font-bold text-sm"
                >
                  删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal (Address) */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-80 mx-4 shadow-xl"
            >
              <h3 className="text-lg font-black text-center mb-2">确认删除</h3>
              <p className="text-sm text-secondary text-center mb-6">
                确定要删除地址「{deleteTarget.receiverName} {deleteTarget.phone}」吗？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 bg-surface-container-low rounded-full font-bold text-sm hover:bg-surface-container transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteAddress}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-full font-bold text-sm hover:bg-red-600 transition-colors"
                >
                  删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
