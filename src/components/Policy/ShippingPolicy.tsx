export default function ShippingPolicy() {
  return (
    <>
      <p className="font-bold text-gray-800">1. Phí Vận Chuyển:</p>
      <ul className="list-disc list-inside pl-4 space-y-2">
        <li><span className="font-semibold">Đồng giá 25.000đ</span> cho tất cả các đơn hàng nội thành TP.HCM.</li>
        <li><span className="font-semibold">Đồng giá 35.000đ</span> cho các đơn hàng ngoại thành và các tỉnh khác.</li>
        <li><span className="font-semibold">Miễn phí vận chuyển</span> cho các đơn hàng có giá trị từ 500.000đ trở lên.</li>
      </ul>

      <p className="font-bold text-gray-800 pt-4">2. Thời Gian Giao Hàng (Dự Kiến):</p>
      <ul className="list-disc list-inside pl-4 space-y-2">
        <li><span className="font-semibold">Nội thành TP.HCM:</span> 1-2 ngày làm việc.</li>
        <li><span className="font-semibold">Các tỉnh thành khác:</span> 3-5 ngày làm việc.</li>
        <li>Thời gian giao hàng không bao gồm Chủ Nhật và các ngày lễ, Tết.</li>
      </ul>

      <p className="font-bold text-gray-800 pt-4">3. Kiểm Tra Hàng:</p>
      <p>Quý khách được quyền kiểm tra sản phẩm trước khi thanh toán (đồng kiểm). Vui lòng quay video quá trình mở hàng để làm bằng chứng nếu có phát sinh khiếu nại về sau.</p>
    </>
  );
}