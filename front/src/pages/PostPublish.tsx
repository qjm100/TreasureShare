/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @author Ciami
 */

import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, X, PlusCircle } from 'lucide-react';
import { api } from '../api';

interface CategoryOption {
  id: number;
  name: string;
  children?: CategoryOption[];
}

export default function PostPublish() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: null as number | null,
    ageRange: '',
    brand: '',
    price: '',
    rentPriceDay: '',
    rentPriceMonth: '',
    stock: '1',
    image: '',
  });

  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingExtras, setUploadingExtras] = useState<Record<number, boolean>>({});
  const mainFileRef = useRef<HTMLInputElement>(null);
  const extraFileRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const handleFileUpload = async (file: File, isMain: boolean, idx?: number) => {
    try {
      const url = await api.upload(file);
      const fullUrl = url.startsWith('http') ? url : `http://localhost:8080${url}`;
      if (isMain) {
        setForm((prev) => ({ ...prev, image: fullUrl }));
        setUploadingMain(false);
      } else if (idx !== undefined) {
        setExtraImages((prev) => {
          const next = [...prev];
          next[idx] = fullUrl;
          return next;
        });
        setUploadingExtras((prev) => ({ ...prev, [idx]: false }));
      }
    } catch (e: any) {
      alert(e.message || 'Upload failed');
      if (isMain) setUploadingMain(false);
      if (idx !== undefined) setUploadingExtras((prev) => ({ ...prev, [idx]: false }));
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.getCategories();
      const data = res.data || res.rows || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (_) {
      // Categories optional
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('请输入商品名称');
      return;
    }
    if (!form.categoryId) {
      setError('请选择类目');
      return;
    }

    setSubmitting(true);
    try {
      const data: Record<string, any> = {
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        ageRange: form.ageRange,
        brand: form.brand,
        price: Number(form.price) || 0,
        rentPriceDay: Number(form.rentPriceDay) || 0,
        rentPriceMonth: Number(form.rentPriceMonth) || 0,
        stock: Number(form.stock) || 1,
        image: form.image,
        images: extraImages.filter(Boolean),
      };
      await api.createProduct(data);
      navigate('/', { replace: true });
    } catch (e: any) {
      setError(e.message || '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  // Flatten categories for display
  const flatCats: { id: number; name: string }[] = [];
  const flatten = (nodes: CategoryOption[]) => {
    for (const node of nodes) {
      flatCats.push({ id: node.id, name: node.name });
      if (node.children?.length) flatten(node.children);
    }
  };
  flatten(categories);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-4 py-4 min-h-full pb-32">
      <header className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/')} className="p-2 bg-surface-container rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black">发布宝贝</h2>
        <div className="w-9" />
      </header>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image upload */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-outline-variant/30 space-y-3">
          <h3 className="font-bold text-sm px-1">商品图片</h3>

          {/* Main image */}
          <div>
            <label className="block text-[12px] font-bold text-outline mb-1 px-1">主图</label>
            <div className="flex gap-3 items-start">
              <input
                type="file"
                accept="image/*"
                ref={mainFileRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadingMain(true);
                    handleFileUpload(file, true);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => mainFileRef.current?.click()}
                disabled={uploadingMain}
                className="flex-shrink-0 w-24 h-24 rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                {uploadingMain ? (
                  <div className="w-6 h-6 border-2 border-primary-fixed border-t-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-6 h-6 text-primary mb-1" />
                    <span className="text-[10px] font-bold text-on-surface-variant">上传</span>
                  </>
                )}
              </button>
              {form.image && (
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden relative shadow-md">
                  <img src={form.image} className="w-full h-full object-cover" alt="主图" />
                  <button type="button" onClick={() => setForm({ ...form, image: '' })} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <input
                type="text"
                placeholder="或输入图片URL"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="flex-1 bg-surface-container-low border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Extra images */}
          {extraImages.map((url, idx) => {
            let inputRef = extraFileRefs.current.get(idx);
            if (!inputRef) {
              inputRef = document.createElement('input');
              inputRef.type = 'file';
              inputRef.accept = 'image/*';
              inputRef.className = 'hidden';
              extraFileRefs.current.set(idx, inputRef);
              inputRef.onchange = (e: any) => {
                const file = e.target?.files?.[0];
                if (file) {
                  setUploadingExtras((prev) => ({ ...prev, [idx]: true }));
                  handleFileUpload(file, false, idx);
                }
              };
            }
            return (
              <div key={idx}>
                <label className="block text-[12px] font-bold text-outline mb-1 px-1">额外图片 {idx + 1}</label>
                <div className="flex gap-3 items-start">
                  <input type="file" accept="image/*" className="hidden" />
                  <button
                    type="button"
                    onClick={() => extraFileRefs.current.get(idx)?.click()}
                    disabled={uploadingExtras[idx]}
                    className="flex-shrink-0 w-24 h-24 rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-colors disabled:opacity-50"
                  >
                    {uploadingExtras[idx] ? (
                      <div className="w-6 h-6 border-2 border-primary-fixed border-t-primary rounded-full animate-spin" />
                    ) : (
                      <>
                        <PlusCircle className="w-6 h-6 text-primary mb-1" />
                        <span className="text-[10px] font-bold text-on-surface-variant">上传</span>
                      </>
                    )}
                  </button>
                  {url && (
                    <div className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden relative shadow-md">
                      <img src={url} className="w-full h-full object-cover" alt={`图片 ${idx + 1}`} />
                      <button type="button" onClick={() => setExtraImages(extraImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="或输入图片URL"
                    value={url}
                    onChange={(e) => {
                      const next = [...extraImages];
                      next[idx] = e.target.value;
                      setExtraImages(next);
                    }}
                    className="flex-1 bg-surface-container-low border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setExtraImages([...extraImages, ''])}
            className="w-full py-2 border-2 border-dashed border-outline-variant rounded-xl text-secondary hover:text-primary transition-colors text-sm font-bold flex items-center justify-center gap-1"
          >
            <PlusCircle className="w-4 h-4" /> 添加更多图片
          </button>
        </div>

        {/* Basic info */}
        <div className="bg-white p-4 rounded-3xl shadow-sm space-y-4 border border-outline-variant/30">
          <div>
            <label className="block text-[12px] font-bold text-outline mb-1 px-1">标题 *</label>
            <input
              type="text"
              placeholder="例如：复古相机或经典小说"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-outline mb-1 px-1">描述</label>
            <textarea
              placeholder="描述这件宝贝的故事..."
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-outline mb-1 px-1">品牌</label>
              <input
                type="text"
                placeholder="品牌名称"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-outline mb-1 px-1">适用年龄</label>
              <input
                type="text"
                placeholder="如: 3-6岁"
                value={form.ageRange}
                onChange={(e) => setForm({ ...form, ageRange: e.target.value })}
                className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-4 rounded-3xl shadow-sm space-y-4 border border-outline-variant/30">
          <h3 className="font-bold text-sm px-1">定价信息</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-outline mb-1 px-1">原价 (¥)</label>
              <input
                type="number"
                placeholder="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-outline mb-1 px-1">库存</label>
              <input
                type="number"
                placeholder="1"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-outline mb-1 px-1">日租价格 (¥)</label>
              <input
                type="number"
                placeholder="0"
                value={form.rentPriceDay}
                onChange={(e) => setForm({ ...form, rentPriceDay: e.target.value })}
                className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-outline mb-1 px-1">月租价格 (¥)</label>
              <input
                type="number"
                placeholder="0"
                value={form.rentPriceMonth}
                onChange={(e) => setForm({ ...form, rentPriceMonth: e.target.value })}
                className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-outline-variant/30">
          <label className="block text-[12px] font-bold text-outline mb-3 px-1">类目 *</label>
          <div className="flex flex-wrap gap-2">
            {flatCats.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setForm({ ...form, categoryId: cat.id })}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  form.categoryId === cat.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-surface-container hover:bg-surface-variant'
                }`}
              >
                {cat.name}
              </button>
            ))}
            {flatCats.length === 0 && (
              <span className="text-sm text-secondary">加载类目中...</span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full bg-primary text-white py-4 rounded-full font-black text-lg shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {submitting ? '发布中...' : '发布到社区'} <Send className="w-5 h-5" />
        </button>
      </form>
    </motion.div>
  );
}
