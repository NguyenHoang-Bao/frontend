import { Clock, Package, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Order } from './types';

export default function OrderStatusBadge({ status }: { status: Order['status'] }) {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={13} /> Chờ xác nhận
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Package size={13} /> Đang chuẩn bị hàng
        </span>
      );
    case 'shipping':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Truck size={13} /> Đang vận chuyển
        </span>
      );
    case 'delivered':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={13} /> Đã giao hàng
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle size={13} /> Đã hủy
        </span>
      );
    default:
      return null;
  }
}