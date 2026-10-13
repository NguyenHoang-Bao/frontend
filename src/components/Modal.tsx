import { X } from 'lucide-react';
import { useEffect, ReactNode, MouseEvent } from 'react';

// Định nghĩa Interface cho các Props truyền vào Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode; // ReactNode là kiểu chuẩn cho mọi children trong React
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Xử lý khóa cuộn trang nền khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Dọn dẹp khi component bị hủy
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Lớp nền mờ (Backdrop)
    <div 
      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose} // Đóng khi bấm ra ngoài
    >
      {/* Khung nội dung Modal */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col text-black"
        // Thêm kiểu MouseEvent<HTMLDivElement> cho sự kiện onClick
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 className="text-xl font-bold uppercase tracking-wider">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body (Nội dung chính) */}
        <div className="p-6 overflow-y-auto text-gray-600 leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}