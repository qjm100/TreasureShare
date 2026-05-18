/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @author Ciami
 */

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Search, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { ToyProduct } from '../types';
import ImgWithFallback from '../components/ImgWithFallback';

export default function Discovery() {
  const [products, setProducts] = useState<ToyProduct[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProducts = useCallback(async (categoryId?: number, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (categoryId) params.categoryId = String(categoryId);
      if (name) params.name = name;
      const res = await api.getProducts(params);
      const items = res.rows || res.data || [];
      setProducts(items);
    } catch (e: any) {
      setError(e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.getCategories();
      const data = res.data || res.rows || [];
      // Flatten tree structure if nested
      const flat: { id: number; name: string }[] = [];
      const flatten = (nodes: any[]) => {
        for (const node of nodes) {
          flat.push({ id: node.id, name: node.name });
          if (node.children && node.children.length > 0) {
            flatten(node.children);
          }
        }
      };
      flatten(Array.isArray(data) ? data : []);
      setCategories(flat);
    } catch (_) {
      // Categories are optional
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleCategoryClick = (catId: number | null) => {
    setActiveCat(catId);
    fetchProducts(catId ?? undefined, search || undefined);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchProducts(activeCat ?? undefined, search || undefined);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-4">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="mb-6 mt-2 relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索书籍或玩具..."
          className="w-full bg-surface-container-low border-none rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary text-sm shadow-sm"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5 font-bold" />
      </form>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-6">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all shadow-sm ${activeCat === null ? 'bg-primary text-on-primary scale-105 shadow-md' : 'bg-surface-container-highest text-on-surface-variant hover:opacity-80'}`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all shadow-sm ${activeCat === cat.id ? 'bg-primary text-on-primary scale-105 shadow-md' : 'bg-surface-container-highest text-on-surface-variant hover:opacity-80'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-20">
          <p className="text-secondary mb-4">{error}</p>
          <button onClick={() => fetchProducts()} className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold">
            重试
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className="columns-2 gap-3 space-y-3">
          {products.map((item) => {
            const soldOut = (item.stock ?? 0) <= 0;
            return (
            <motion.div
              key={item.id}
              whileHover={soldOut ? {} : { y: -4 }}
              onClick={() => !soldOut && navigate(`/detail/${item.id}`)}
              className={`break-inside-avoid bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden ${soldOut ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="relative">
                <ImgWithFallback
                  src={item.image || (item.images && item.images[0]?.imageUrl)}
                  alt={item.name}
                  className={`w-full object-cover ${soldOut ? 'grayscale opacity-50' : ''}`}
                />
                {soldOut && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="bg-black/70 text-white px-4 py-1.5 rounded-full font-black text-sm tracking-widest">已售罄</span>
                  </div>
                )}
              </div>
              <div className={`p-3 ${soldOut ? 'opacity-50' : ''}`}>
                <h3 className="font-bold text-[14px] leading-tight line-clamp-2">{item.name}</h3>
                <div className="mt-2 flex justify-between items-end">
                  <p className="text-primary font-black text-lg">
                    {item.rentPriceMonth === 0 ? '免费租赁' : `¥${item.rentPriceMonth}/月`}
                  </p>
                  <div className="flex items-center gap-1 text-secondary text-[11px] mb-1">
                    <Heart className="w-3 h-3" />
                    <span>{item.stock ?? 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 text-secondary">
          <p className="text-lg font-bold mb-2">暂无商品</p>
          <p className="text-sm">还没有人发布商品，去发布第一个吧</p>
        </div>
      )}
    </motion.div>
  );
}
