export default function ReturnPolicy() {
  return (
    <div className="text-gray-700 space-y-6">
      {/* Section 1 */}
      <div>
        <p className="font-bold text-gray-900 mb-2">1. Thời Gian Đổi Trả:</p>
        <ul className="list-disc list-inside pl-2 space-y-1">
          <li>
            Hỗ trợ đổi trả trong vòng <span className="font-semibold text-gray-900">07 ngày</span> kể từ ngày nhận hàng.
          </li>
        </ul>
      </div>

      {/* Section 2 */}
      <div>
        <p className="font-bold text-gray-900 mb-2">2. Điều Kiện Đổi Trả:</p>
        <ul className="list-disc list-inside pl-2 space-y-1">
          <li>Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng, giặt ủi.</li>
          <li>Sản phẩm còn đầy đủ tem, mác, nhãn và bao bì gốc.</li>
          <li>Sản phẩm không bị dơ bẩn, không có mùi lạ, không bị hư hỏng bởi các tác nhân bên ngoài.</li>
          <li>Áp dụng đổi sang sản phẩm khác có giá trị bằng hoặc cao hơn (khách hàng bù phần chênh lệch).</li>
          <li>Mỗi hóa đơn chỉ được hỗ trợ đổi hàng 1 lần duy nhất.</li>
        </ul>
      </div>

      {/* Section 3 */}
      <div>
        <p className="font-bold text-gray-900 mb-2">3. Các Trường Hợp Không Áp Dụng Đổi Trả:</p>
        <ul className="list-disc list-inside pl-2 space-y-1">
          <li>Sản phẩm trong các chương trình giảm giá, khuyến mãi, thanh lý.</li>
          <li>Sản phẩm đã quá thời gian đổi trả (quá 07 ngày).</li>
          <li>Sản phẩm không đáp ứng đủ các điều kiện đổi trả ở mục 2.</li>
        </ul>
      </div>

      {/* Footer Note */}
      <p className="pt-2 italic text-gray-600">
        Chúng tôi không hỗ trợ trả hàng và hoàn tiền trong mọi trường hợp. Xin cảm ơn quý khách!
      </p>
    </div>
  );
}