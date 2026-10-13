import { BsTruck } from 'react-icons/bs';

export default function PaymentMethods() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Badge Ví MoMo */}
      <div 
        className="bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm flex items-center justify-center h-8 hover:border-[#a50064] transition-colors cursor-default"
        title="Thanh toán qua Ví MoMo"
      >
        <img 
          src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png" 
          alt="Ví MoMo" 
          className="h-5 w-auto object-contain" 
        />
      </div>

      {/* Badge Vietcombank */}
      <div 
        className="bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm flex items-center justify-center h-8 hover:border-green-600 transition-colors cursor-default"
        title="Chuyển khoản Vietcombank"
      >
        <img 
          src="https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-Vietcombank.png" 
          alt="Vietcombank" 
          className="h-4 w-auto object-contain" 
        />
      </div>

      {/* Badge MB Bank */}
      <div 
        className="bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm flex items-center justify-center h-8 hover:border-blue-600 transition-colors cursor-default"
        title="Chuyển khoản MB Bank"
      >
        <img 
          src="https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-MB-Bank-MBB.png" 
          alt="MB Bank" 
          className="h-5 w-auto object-contain" 
        />
      </div>

      {/* Badge COD */}
      <div 
        className="bg-white border border-gray-200 px-3 py-1 rounded-md shadow-sm flex items-center justify-center h-8 gap-1.5 hover:border-gray-400 transition-colors cursor-default"
        title="Thanh toán khi nhận hàng"
      >
        <BsTruck className="text-gray-700 text-sm" />
        <span className="text-[11px] font-extrabold text-gray-700 tracking-wide uppercase mt-0.5">COD</span>
      </div>
    </div>
  );
}