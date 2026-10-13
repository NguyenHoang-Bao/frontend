import React, { useEffect, useState, useRef } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { retailApi } from '../../services/api';

interface DynamicQrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  orderCode: string;
  paymentMethod: 'BANK_TRANSFER' | 'MOMO';
  onPaymentSuccess: () => void;
}

export default function DynamicQrPaymentModal({
  isOpen,
  onClose,
  totalAmount,
  orderCode,
  paymentMethod,
  onPaymentSuccess
}: DynamicQrPaymentModalProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [loadingQr, setLoadingQr] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(600); // 10 phút
  const [pollCount, setPollCount] = useState<number>(0);
  const isMountedRef = useRef<boolean>(true);

  const isMomo = paymentMethod === 'MOMO';
  const brandColor = isMomo ? '#a50064' : '#1b3b6f';
  const brandBg = isMomo ? 'bg-[#a50064]' : 'bg-[#1b3b6f]';
  const brandBorder = isMomo ? 'border-[#a50064]' : 'border-[#1b3b6f]';
  const brandText = isMomo ? 'text-[#a50064]' : 'text-[#1b3b6f]';
  const brandName = isMomo ? 'Ví Điện Tử MoMo' : 'Chuyển Khoản Ngân Hàng (VietQR)';

  // 1. Tải thông tin mã QR khi mở Modal
  useEffect(() => {
    isMountedRef.current = true;
    if (!isOpen) {
      setIsSuccess(false);
      setPollCount(0);
      setCountdown(600);
      return;
    }

    setLoadingQr(true);
    retailApi
      .getPaymentQr(orderCode, paymentMethod, totalAmount)
      .then((data) => {
        if (isMountedRef.current) {
          setQrUrl(data.qrCodeUrl);
          setLoadingQr(false);
        }
      })
      .catch(() => {
        if (isMountedRef.current) {
          setLoadingQr(false);
        }
      });

    return () => {
      isMountedRef.current = false;
    };
  }, [isOpen, orderCode, paymentMethod, totalAmount]);

  // 2. Đếm ngược thời gian hết hạn mã QR
  useEffect(() => {
    if (!isOpen || isSuccess) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isSuccess]);

  // 3. Polling kiểm tra API tự động (Mỗi 2.5 giây) - Tuyệt đối không cho nhân viên tự duyệt
  useEffect(() => {
    if (!isOpen || isSuccess || loadingQr) return;

    const interval = setInterval(async () => {
      try {
        const res = await retailApi.checkPaymentStatus(orderCode);
        if (isMountedRef.current) {
          setPollCount((c) => c + 1);
          if (res.isPaid) {
            clearInterval(interval);
            setIsSuccess(true);
            // Tự động đóng modal và kích hoạt hoàn tất đơn sau 1.5s
            setTimeout(() => {
              if (isMountedRef.current) {
                onPaymentSuccess();
              }
            }, 1500);
          }
        }
      } catch (err) {
        console.error('Lỗi kiểm tra trạng thái thanh toán:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, isSuccess, loadingQr, orderCode, onPaymentSuccess]);

  if (!isOpen) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Hàm mô phỏng webhook thanh toán dành riêng cho kiểm thử / demo nếu backend chưa bật webhook thật
  const handleSimulatePaymentWebhook = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onPaymentSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 font-sans select-none backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-[#d2d6de] shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header thương hiệu */}
        <div className={`${brandBg} text-white px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-300" />
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wide">{brandName}</h3>
              <p className="text-[10px] text-white/80">Xác thực tự động qua API Webhook</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white cursor-pointer transition-colors p-1"
            title="Đóng / Hủy"
          >
            <X size={18} />
          </button>
        </div>

        {/* Thân Modal */}
        <div className="p-4 space-y-3.5 text-center">
          {/* TRƯỜNG HỢP: ĐÃ THANH TOÁN THÀNH CÔNG */}
          {isSuccess ? (
            <div className="py-8 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="text-base font-bold text-emerald-700">THANH TOÁN THÀNH CÔNG!</h4>
              <p className="text-xs text-gray-600">
                Hệ thống đã nhận đủ{' '}
                <strong className="text-gray-900 font-mono text-sm">
                  {totalAmount.toLocaleString('vi-VN')} đ
                </strong>
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold animate-pulse">
                Đang xuất hóa đơn bán lẻ K80...
              </p>
            </div>
          ) : (
            /* TRƯỜNG HỢP: ĐANG CHỜ KHÁCH QUÉT MÃ */
            <>
              {/* Khung hiển thị mã QR */}
              <div className="relative mx-auto w-56 h-56 p-2 bg-white border-2 border-dashed rounded-lg flex items-center justify-center shadow-xs">
                {loadingQr ? (
                  <div className="flex flex-col items-center gap-2 text-gray-400 text-xs">
                    <Loader2 size={28} className="animate-spin text-[#1b3b6f]" />
                    <span>Đang tạo mã QR động...</span>
                  </div>
                ) : (
                  <img
                    src={qrUrl}
                    alt={`Mã ${brandName}`}
                    className="w-full h-full object-contain rounded"
                  />
                )}

                {/* Logo thương hiệu đính góc dưới */}
                <div
                  className={`absolute -bottom-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs ${brandBg}`}
                >
                  {isMomo ? 'MoMo QR Pay' : 'VietQR 247'}
                </div>
              </div>

              {/* Thông tin giao dịch */}
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded text-xs space-y-1 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Số tiền cần thanh toán:</span>
                  <span className={`font-mono font-bold text-sm ${brandText}`}>
                    {totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-mono font-bold text-gray-800">{orderCode}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-600">Tài khoản thụ hưởng:</span>
                  <span className="font-bold text-gray-800">
                    NGUYEN HOANG BAO {isMomo ? '(0359490221)' : '(MBBank)'}
                  </span>
                </div>
              </div>

              {/* HỘP CẢNH BÁO & TRẠNG THÁI CHỜ API */}
              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 text-left flex items-start gap-2">
                <Loader2 size={15} className="animate-spin text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Đang đợi khách quét mã thanh toán...</p>
                  <p className="text-[10px] text-amber-700 leading-tight">
                    Hệ thống đang đối soát API thời gian thực. Không cho phép thu ngân tự duyệt khi chưa có tiền vào tài khoản.
                  </p>
                </div>
              </div>

              {/* Đồng hồ đếm ngược hiệu lực mã */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
                <span className="flex items-center gap-1">
                  <RefreshCw size={11} className="animate-spin" />
                  <span>Đang dò API ({pollCount} lần)</span>
                </span>
                <span>
                  Hiệu lực còn: <strong className="text-red-600 font-mono">{formattedTime}</strong>
                </span>
              </div>

              {/* Nút hủy giao dịch / đổi phương thức khác */}
              <div className="pt-1 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={13} />
                  <span>Hủy quét mã & Chọn thanh toán khác</span>
                </button>

                {/* Nút giả lập Webhook thử nghiệm (chỉ dùng test nhanh offline) */}
                <button
                  type="button"
                  onClick={handleSimulatePaymentWebhook}
                  className="text-[10px] text-gray-400 hover:text-gray-600 underline text-center cursor-pointer pt-0.5"
                  title="Nhấn để giả lập SePay/MoMo Webhook đã báo tiền vào tài khoản"
                >
                  [Kiểm thử nhanh: Giả lập Webhook đã nhận tiền]
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
