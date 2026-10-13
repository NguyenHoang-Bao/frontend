import React, { useState } from 'react';
import { Loader2, Phone, ShieldCheck, User, Lock } from 'lucide-react';
import { UserProfile } from '../types';
import { retailApi } from '../services/api';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Vui lòng nhập tài khoản');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const user = await retailApi.login(username, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || 'Tài khoản hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#ecf0f5] select-none font-sans p-4">
      {/* Khung đăng nhập chuẩn phong cách Quản trị Admin với tone Xanh Navy Đậm */}
      <div className="w-full max-w-sm">
        {/* Header hệ thống */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center gap-2 mb-1">
            <ShieldCheck size={28} className="text-[#1b3b6f]" />
            <h1 className="text-2xl font-bold text-[#222] tracking-tight">
              HoangBao<span className="text-[#1b3b6f]">.retail</span>
            </h1>
          </div>
          <p className="text-xs uppercase font-bold tracking-wider text-[#555]">
            Hệ Thống Quản Lý Bán Hàng & Kho
          </p>
        </div>

        {/* Thẻ đăng nhập */}
        <div className="bg-white rounded border border-[#d2d6de] shadow-sm p-6 space-y-4">
          <p className="text-xs text-[#555] text-center pb-2 border-b border-[#eee]">
            Đăng nhập tài khoản nội bộ
          </p>

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#444] mb-1">
                Tài khoản
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-[#d2d6de] rounded text-[#333] focus:outline-none focus:border-[#1b3b6f] transition-colors"
                  placeholder="Nhập tên đăng nhập / tài khoản..."
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  autoFocus
                />
                <User size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#444] mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-[#d2d6de] rounded text-[#333] focus:outline-none focus:border-[#1b3b6f] transition-colors"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  required
                />
                <Lock size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 mt-2 bg-[#1b3b6f] hover:bg-[#142d55] disabled:bg-gray-400 text-white font-bold text-xs uppercase tracking-wide rounded cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              {loading && <Loader2 className="animate-spin" size={15} />}
              <span>{loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}</span>
            </button>
          </form>

          {/* Hotline hỗ trợ kỹ thuật */}
          <div className="pt-3 border-t border-[#eee] flex items-center justify-between text-[11px] text-[#777]">
            <span className="flex items-center gap-1">
              <Phone size={12} className="text-[#1b3b6f]" />
              <span>Hỗ trợ kỹ thuật:</span>
            </span>
            <a
              href="tel:0359490221"
              className="font-bold text-[#1b3b6f] hover:underline font-mono"
            >
              0359490221
            </a>
          </div>
        </div>

        {/* Footer ghi chú hệ thống */}
        <div className="text-center mt-3 text-[11px] text-[#999]">
          © HoangBao Retail Management System
        </div>
      </div>
    </div>
  );
}
