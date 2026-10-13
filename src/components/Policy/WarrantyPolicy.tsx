export default function WarrantyPolicy() {
  return (
    <>
      <p className="font-bold text-gray-800">1. Thời Gian Bảo Hành:</p>
      <ul className="list-disc list-inside pl-4 space-y-2">
        <li><span className="font-semibold">365 ngày</span> đối với tất cả sản phẩm quần áo (áo, quần).</li>
        <li><span className="font-semibold">180 ngày</span> đối với các sản phẩm phụ kiện (balo, túi xách, kính mắt, nón...).</li>
        <li>Thời gian bảo hành được tính từ ngày mua hàng ghi trên hóa đơn.</li>
      </ul>

      <p className="font-bold text-gray-800 pt-4">2. Điều Kiện Bảo Hành:</p>
      <ul className="list-disc list-inside pl-4 space-y-2">
        <li>Sản phẩm bị lỗi kỹ thuật do nhà sản xuất như: bung chỉ, hỏng khóa kéo, tuột cúc, lỗi hình in (bong tróc, nứt vỡ không do tác động bên ngoài).</li>
        <li>Sản phẩm còn nguyên tem, mác và hóa đơn mua hàng.</li>
        <li>Sản phẩm không bị hư hỏng do các yếu tố bên ngoài (giặt ủi sai cách, va quệt, tác động của hóa chất...).</li>
      </ul>

      <p className="font-bold text-gray-800 pt-4">3. Các Trường Hợp Không Được Bảo Hành:</p>
      <ul className="list-disc list-inside pl-4 space-y-2">
        <li>Sản phẩm đã quá thời gian bảo hành.</li>
        <li>Sản phẩm bị hư hỏng do người sử dụng: hao mòn tự nhiên, giặt tẩy sai quy cách, bị biến dạng do nhiệt độ cao.</li>
        <li>Sản phẩm đã qua sửa chữa ở nơi khác không phải là cửa hàng của chúng tôi.</li>
      </ul>
      <p className="pt-4 italic">Để được hỗ trợ bảo hành, quý khách vui lòng mang sản phẩm và hóa đơn đến cửa hàng gần nhất hoặc liên hệ hotline <span className="font-semibold">0359 490 221</span>.</p>
    </>
  );
}