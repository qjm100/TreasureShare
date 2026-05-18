/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @author Ciami
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Package, MessageCircle,
  ArrowLeft, Star, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { api } from '../api';
import type { ToyProduct, Evaluation } from '../types';
import ImgWithFallback from '../components/ImgWithFallback';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ToyProduct | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const allImages = product
    ? [
        product.image,
        ...(product.images?.map((img) => img.imageUrl) || []),
      ].filter(Boolean)
    : [];

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProduct(Number(id));
      const data = res.data || res;
      setProduct(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchEvaluations = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.getEvaluations(Number(id));
      const items = res.rows || res.data || [];
      setEvaluations(items);
    } catch (_) {
      // Evaluations are optional
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    fetchEvaluations();
  }, [fetchProduct, fetchEvaluations]);

  const handleAddToCart = async (goToCart: boolean) => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await api.addToCart(product.id, 1);
      if (goToCart) {
        navigate('/cart');
      } else {
        // Show subtle feedback - just a brief state change
        setTimeout(() => setAddingToCart(false), 500);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to add to cart');
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-secondary mb-4">{error || 'Product not found'}</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold">
          返回首页
        </button>
      </div>
    );
  }

  const deposit = product.rentPriceMonth * 2;
  const soldOut = (product.stock ?? 0) <= 0;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pb-32">
      {/* Image carousel */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container">
        {allImages.length > 0 ? (
          <>
            <ImgWithFallback
              src={allImages[currentImageIndex]}
              alt={product.name}
              className={`w-full h-full object-cover ${soldOut ? 'grayscale opacity-40' : ''}`}
            />
            {soldOut && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="bg-black/70 text-white px-8 py-3 rounded-full font-black text-2xl tracking-widest">已售罄</span>
              </div>
            )}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5 text-on-surface" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm"
                >
                  <ChevronRight className="w-5 h-5 text-on-surface" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-primary w-4' : 'bg-white/70'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary">暂无图片</div>
        )}
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Tags and title */}
        <div>
          <div className="flex gap-2 mb-3">
            {product.categoryName && (
              <span className="px-3 py-1 bg-tertiary-fixed text-on-surface font-bold text-[10px] rounded-full uppercase tracking-widest">
                {product.categoryName}
              </span>
            )}
            {product.ageRange && (
              <span className="px-3 py-1 bg-surface-container-high text-primary font-bold text-[10px] rounded-full uppercase tracking-widest">
                {product.ageRange}
              </span>
            )}
          </div>
          <h2 className="text-3xl font-black leading-tight text-on-surface mb-2">{product.name}</h2>
          {product.brand && (
            <p className="text-secondary text-sm flex items-center gap-1">
              品牌: {product.brand}
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30">
          <div className="grid grid-cols-3 divide-x divide-outline-variant/50">
            <div className="px-2">
              <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">日租价格</p>
              <p className="text-xl font-black text-primary">
                {product.rentPriceDay === 0 ? '免费' : `¥${product.rentPriceDay}`}
                <span className="text-xs font-normal text-on-surface-variant"> / 天</span>
              </p>
            </div>
            <div className="px-4">
              <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">月租价格</p>
              <p className="text-xl font-black text-primary">
                {product.rentPriceMonth === 0 ? '免费' : `¥${product.rentPriceMonth}`}
                <span className="text-xs font-normal text-on-surface-variant"> / 月</span>
              </p>
            </div>
            <div className="px-4">
              <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">押金</p>
              <p className="text-xl font-black">¥{deposit}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="space-y-3">
            <h3 className="text-xl font-black">描述</h3>
            <p className="text-on-surface-variant leading-relaxed">{product.description}</p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold">原价 ¥{product.price}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold">库存 {product.stock}</span>
              </div>
            </div>
          </div>
        )}

        {/* Owner info */}
        <div className="pt-6 border-t border-outline-variant/30 flex items-center gap-4">
          <ImgWithFallback
            src={product.avatar || ''}
            alt={product.nickName || 'Owner'}
            className="w-14 h-14 rounded-full object-cover border-2 border-surface-container-high"
          />
          <div className="flex-1">
            <h4 className="font-black text-lg">{product.nickName || '用户'}</h4>
            <div className="flex items-center gap-1 text-primary">
              <Star className="w-4 h-4 fill-primary" />
              <span className="text-xs font-black">认证用户</span>
            </div>
          </div>
        </div>

        {/* Evaluations */}
        {evaluations.length > 0 && (
          <div className="pt-6 border-t border-outline-variant/30 space-y-3">
            <h3 className="text-xl font-black">评价 ({evaluations.length})</h3>
            <div className="space-y-4">
              {evaluations.map((ev) => (
                <div key={ev.id} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20">
                  <div className="flex items-center gap-3 mb-2">
                    <ImgWithFallback
                      src={ev.avatar || ''}
                      alt={ev.nickName}
                      className="w-8 h-8 rounded-full object-cover bg-surface-container"
                    />
                    <div>
                      <p className="font-bold text-sm">{ev.nickName}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < ev.rating ? 'fill-primary text-primary' : 'text-outline-variant'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant">{ev.content}</p>
                  <p className="text-[10px] text-outline mt-2">{ev.createTime}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] z-[60] bg-white/95 backdrop-blur-md shadow-[0_-4px_30px_rgba(0,0,0,0.08)] px-5 py-6 rounded-t-[32px] flex items-center justify-between gap-4">
        <div className="hidden md:block">
          <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">预估月租</p>
          <p className="text-2xl font-black text-primary">
            ¥{product.rentPriceMonth}
            <span className="text-sm font-normal text-on-surface-variant"> / 月</span>
          </p>
        </div>
        <div className="flex gap-4 flex-1">
          <button
            onClick={() => handleAddToCart(false)}
            disabled={addingToCart || soldOut}
            className="flex-1 py-4 border-2 border-primary text-primary rounded-full font-black flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-5 h-5" /> 加入购物车
          </button>
          <button
            onClick={() => handleAddToCart(true)}
            disabled={addingToCart || soldOut}
            className="flex-[1.5] py-4 bg-primary text-white rounded-full font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-primary/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {soldOut ? '已售罄' : addingToCart ? '处理中...' : '立即租赁'} <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
