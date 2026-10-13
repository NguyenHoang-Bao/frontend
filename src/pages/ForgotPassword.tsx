import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import AuthBanner from '../components/Auth/AuthBanner';

interface StatusState {
  type: 'error' | 'success' | '';
  message: string;
}

export default function ForgotPassword() {
  const [input, setInput] = useState<string>('');
  const [status, setStatus] = useState<StatusState>({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    const isPhone = /^[0-9]{10}$/.test(input.replace(/\s+/g, ""));

    if (!isEmail && !isPhone) {
      setStatus({ type: 'error', message: 'Vui lòng nhập email hoặc số điện thoại 10 số hợp lệ.' });
      return;
    }

    setIsLoading(true);
    // Giả lập API call
    setTimeout(() => {
      setIsLoading(false);
      setStatus({ type: 'success', message: 'Mã khôi phục đã được gửi. Vui lòng kiểm tra điện thoại/email.' });
      setTimeout(() => navigate('/login'), 2500);
    }, 1500);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Nửa Trái: Banner 1 hình ảnh */}
      <AuthBanner />

      {/* Nửa Phải: Form Khôi phục mật khẩu */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative py-6 px-6 sm:px-10 overflow-hidden h-full">
        <Link to="/login" className="absolute top-6 right-6 text-gray-400 hover:text-rose-600 transition-colors">
          <X size={28} />
        </Link>

        <div className="w-full max-w-md my-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase mb-2">Khôi Phục Mật Khẩu</h2>
          <p className="text-gray-500 text-xs sm:text-sm mb-6">Nhập số điện thoại hoặc email bạn đã đăng ký để nhận mã khôi phục.</p>
          
          {status.message && (
            <div className={`mb-6 text-sm font-medium ${status.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                id="reset-input"
                className="peer w-full bg-transparent border-0 border-b border-gray-300 text-gray-900 focus:outline-none focus:border-rose-500 focus:ring-0 placeholder-transparent py-2 transition-colors"
                placeholder="Số điện thoại / Email"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
              />
              <label 
                htmlFor="reset-input" 
                className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-rose-600"
              >
                Số điện thoại / Email
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-bold py-3 uppercase tracking-wider transition-colors flex justify-center items-center gap-2 cursor-pointer"
            >
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {isLoading ? 'Đang xử lý...' : 'Gửi Mã Khôi Phục'}
            </button>

            <div className="text-center mt-6">
              <Link to="/login" className="text-gray-500 hover:text-rose-600 text-sm font-semibold transition-colors">
                Quay lại Đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}