/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @author Ciami
 */

import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { api } from '../api';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // If already logged in, redirect to home
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('请填写用户名和密码');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }

    setLoading(true);
    try {
      const res = mode === 'login'
        ? await api.login(username, password)
        : await api.register(username, password);

      const token = res.token || res.data?.token || res.data;
      if (token) {
        localStorage.setItem('token', typeof token === 'string' ? token : JSON.stringify(token));
      }

      // If register, auto-login
      if (mode === 'register') {
        const loginRes = await api.login(username, password);
        const loginToken = loginRes.token || loginRes.data?.token || loginRes.data;
        if (loginToken) {
          localStorage.setItem('token', typeof loginToken === 'string' ? loginToken : JSON.stringify(loginToken));
        }
      }

      navigate('/', { replace: true });
    } catch (e: any) {
      setError(e.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-sans font-extrabold text-4xl text-primary italic tracking-tight mb-2">
            TreasureShare
          </h1>
          <p className="text-secondary text-sm">玩具租赁共享平台</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-outline-variant/20">
          {/* Mode toggle */}
          <div className="flex mb-6 bg-surface-container-low rounded-full p-1">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                mode === 'login' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant'
              }`}
            >
              <LogIn className="w-4 h-4" /> 登录
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                mode === 'register' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant'
              }`}
            >
              <UserPlus className="w-4 h-4" /> 注册
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-outline mb-1 px-1">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none text-sm"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-outline mb-1 px-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none text-sm"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
            {mode === 'register' && (
              <div>
                <label className="block text-[12px] font-bold text-outline mb-1 px-1">确认密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入密码"
                  className="w-full bg-surface-container-low border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none text-sm"
                  autoComplete="new-password"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white rounded-full font-black text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-outline mt-6">
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
            className="text-primary font-bold ml-1"
          >
            {mode === 'login' ? '立即注册' : '去登录'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
