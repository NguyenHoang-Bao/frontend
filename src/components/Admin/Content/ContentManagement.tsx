import React, { useState } from 'react';
import {
  FileText,
  Edit,
  ExternalLink,
  Eye,
  CheckCircle,
  X,
  Save,
  Info
} from 'lucide-react';

interface ContentManagementProps {
  subTab?: 'pages';
}

interface PolicyItem {
  id: string;
  title: string;
  location: string;
  slug?: string;
  type: 'route' | 'modal';
  updatedAt: string;
  updatedBy: string;
  status: 'Đang áp dụng' | 'Bản nháp';
  summary: string;
  content: string;
}

const DEFAULT_POLICIES: PolicyItem[] = [
  {
    id: 'about',
    title: 'Giới thiệu về Hoàng Bảo Cosmetics',
    location: 'Trang riêng biệt (Menu & Footer)',
    slug: '/about',
    type: 'route',
    updatedAt: '20/09/2026',
    updatedBy: 'Admin (Chủ Shop)',
    status: 'Đang áp dụng',
    summary: 'Câu chuyện thương hiệu, sứ mệnh mang mỹ phẩm chính hãng và giá trị đến phái đẹp.',
    content: `Hoàng Bảo Cosmetics khởi nguồn từ niềm đam mê đem đến những giải pháp chăm sóc da an toàn, chính hãng và minh bạch nhất cho phụ nữ Việt Nam. Chúng tôi cam kết 100% sản phẩm có nguồn gốc xuất xứ rõ ràng, đầy đủ hóa đơn chứng từ và tem kiểm định chất lượng.`
  },
  {
    id: 'contact',
    title: 'Liên hệ & Bản đồ cửa hàng',
    location: 'Trang riêng biệt (Menu & Footer)',
    slug: '/contact',
    type: 'route',
    updatedAt: '18/09/2026',
    updatedBy: 'Admin (Chủ Shop)',
    status: 'Đang áp dụng',
    summary: 'Thông tin địa chỉ showroom Tân Phú, hotline hỗ trợ 24/7, email liên hệ và form góp ý.',
    content: `Chi nhánh Tân Phú: 140 Lê Trọng Tấn, P. Tây Thạnh, Q. Tân Phú, TP. Hồ Chí Minh.\nHotline tư vấn & phản ánh dịch vụ: 0359 490 221 (8:30 - 22:00 hàng ngày).\nEmail liên hệ: hbao4142@gmail.com.`
  },
  {
    id: 'policy_return',
    title: 'Chính sách đổi trả hàng trong 07 ngày',
    location: 'Popup Modal (Chân trang Footer)',
    slug: 'modal:return',
    type: 'modal',
    updatedAt: '15/09/2026',
    updatedBy: 'Admin (Chủ Shop)',
    status: 'Đang áp dụng',
    summary: 'Quy định đổi sản phẩm lỗi do nhà sản xuất trong vòng 7 ngày kể từ khi nhận hàng.',
    content: `1. Thời gian hỗ trợ đổi trả: Trong vòng 07 ngày kể từ khi nhận hàng theo đối soát đơn vị vận chuyển.\n2. Điều kiện: Sản phẩm còn nguyên bao bì, chưa bóc tem seal niêm phong, không móp méo hay có dấu hiệu sử dụng.\n3. Các mặt hàng ưu đãi thanh lý hoặc xả kho cận date không áp dụng chính sách đổi trả.`
  },
  {
    id: 'policy_warranty',
    title: 'Chính sách bảo hành & Cam kết chính hãng',
    location: 'Popup Modal (Chân trang Footer)',
    slug: 'modal:warranty',
    type: 'modal',
    updatedAt: '12/09/2026',
    updatedBy: 'Admin (Chủ Shop)',
    status: 'Đang áp dụng',
    summary: 'Cam kết bồi hoàn 200% nếu phát hiện hàng giả, hàng nhái kém chất lượng.',
    content: `1. Cam kết chính hãng: Bồi hoàn 200% giá trị đơn hàng nếu phát hiện hàng giả, hàng không rõ nguồn gốc.\n2. Đối với thiết bị làm đẹp (máy rửa mặt, máy massage): Bảo hành 12 tháng theo chính sách của hãng tại Việt Nam.`
  },
  {
    id: 'policy_shipping',
    title: 'Chính sách giao hàng & COD toàn quốc',
    location: 'Popup Modal (Chân trang Footer)',
    slug: 'modal:shipping',
    type: 'modal',
    updatedAt: '10/09/2026',
    updatedBy: 'Admin (Chủ Shop)',
    status: 'Đang áp dụng',
    summary: 'Thời gian vận chuyển 1-3 ngày, hỗ trợ đồng kiểm và thanh toán tiền mặt khi nhận hàng.',
    content: `1. Phạm vi áp dụng: Toàn quốc qua các đơn vị đối tác vận chuyển GHTK, GHN, Viettel Post.\n2. Thời gian: Nội thành TP.HCM (24h - 48h), các tỉnh thành khác (2 - 4 ngày làm việc).\n3. Đồng kiểm: Khách hàng được quyền kiểm tra ngoại quan gói hàng trước khi thanh toán COD.`
  },
  {
    id: 'policy_privacy',
    title: 'Chính sách bảo mật thông tin khách hàng',
    location: 'Popup Modal (Chân trang Footer)',
    slug: 'modal:privacy',
    type: 'modal',
    updatedAt: '05/09/2026',
    updatedBy: 'Admin (Chủ Shop)',
    status: 'Đang áp dụng',
    summary: 'Bảo mật tuyệt đối số điện thoại, địa chỉ và lịch sử đơn hàng của khách hàng.',
    content: `1. Mục đích thu thập: Chỉ sử dụng số điện thoại và địa chỉ để giao hàng và gửi mã ưu đãi khách hàng thân thiết.\n2. Cam kết không chia sẻ dữ liệu cá nhân cho bên thứ ba ngoại trừ đơn vị giao hàng để hoàn thành đơn.`
  }
];

export default function ContentManagement({ subTab = 'pages' }: ContentManagementProps) {
  // Policies State (có lưu vào localStorage để giữ tính chân thực)
  const [policies, setPolicies] = useState<PolicyItem[]>(() => {
    const saved = localStorage.getItem('hb_store_policies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_POLICIES;
      }
    }
    return DEFAULT_POLICIES;
  });

  // Modal chỉnh sửa Policy
  const [editingPolicy, setEditingPolicy] = useState<PolicyItem | null>(null);
  const [previewPolicy, setPreviewPolicy] = useState<PolicyItem | null>(null);

  // Lưu chỉnh sửa chính sách
  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;

    const updated = policies.map((p) =>
      p.id === editingPolicy.id
        ? {
            ...editingPolicy,
            updatedAt: new Date().toLocaleDateString('vi-VN'),
            updatedBy: 'Admin (Chủ Shop)'
          }
        : p
    );

    setPolicies(updated);
    localStorage.setItem('hb_store_policies', JSON.stringify(updated));
    setEditingPolicy(null);
  };

  return (
    <div className="space-y-2 text-xs text-[#333] font-sans">
      {/* THANH ĐIỀU HƯỚNG TỔNG QUAN NỘI DUNG */}
      <div className="bg-white p-2.5 border border-[#ccc] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#222d32] text-white">
            <FileText size={15} />
          </div>
          <div>
            <h2 className="font-bold text-xs text-[#333] uppercase">
              Nội Dung Các Chính Sách & Thông Tin Cửa Hàng
            </h2>
            <p className="text-[11px] text-[#777]">
              Cập nhật văn bản điều khoản, bảo hành và giới thiệu hiển thị trên website
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#555] bg-[#f9f9f9] px-3 py-1.5 border border-[#ccc]">
          <span className="font-bold text-[#222d32]">{policies.length}</span>
          <span>văn bản chính sách đang kích hoạt</span>
        </div>
      </div>

      {/* DANH SÁCH CHÍNH SÁCH & GIỚI THIỆU */}
      <div className="space-y-2">
        {/* Hộp ghi chú kiến trúc */}
        <div className="bg-[#f0f8ff] border border-[#bce8f1] text-[#31708f] p-2.5 flex items-start gap-2 rounded-none">
          <Info size={15} className="text-[#31708f] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong className="font-bold text-[#245269]">Lưu ý kiến trúc Website:</strong> Các trang thông tin
            giới thiệu và chính sách hoạt động theo cấu trúc định tuyến cố định của ứng dụng (Menu chính, Footer và Popup
            Modal). Quản trị viên chỉ có quyền <strong>chỉnh sửa nội dung điều khoản văn bản</strong> và thông tin hiển thị,
            không có thao tác &ldquo;Thêm trang mới&rdquo; tùy tiện để tránh tạo URL rác làm gãy giao diện website.
          </div>
        </div>

        <div className="bg-white border border-[#ccc]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#fcfcfc] border-b border-[#ccc] text-[#555]">
                <th className="py-2 px-2.5 font-normal border-r border-[#eee] w-10 text-center">STT</th>
                <th className="py-2 px-2.5 font-normal border-r border-[#eee] w-64">Tên chính sách / Trang</th>
                <th className="py-2 px-2.5 font-normal border-r border-[#eee] w-52">Vị trí hiển thị trên Web</th>
                <th className="py-2 px-2.5 font-normal border-r border-[#eee]">Tóm tắt nội dung</th>
                <th className="py-2 px-2.5 font-normal border-r border-[#eee] w-28 text-center">Cập nhật cuối</th>
                <th className="py-2 px-2.5 font-normal border-r border-[#eee] w-24 text-center">Trạng thái</th>
                <th className="py-2 px-2.5 font-normal text-right w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee]">
              {policies.map((policy, idx) => (
                <tr key={policy.id} className="hover:bg-[#f9f9f9]">
                  <td className="py-2 px-2.5 text-center text-gray-400 font-mono text-[11px] border-r border-[#eee]">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2.5 font-bold text-slate-800 border-r border-[#eee]">
                    <div className="flex items-center gap-1.5">
                      <FileText size={13} className="text-[#3c8dbc]" />
                      <span>{policy.title}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2.5 text-gray-600 border-r border-[#eee]">
                    <span className="inline-block px-1.5 py-0.5 bg-slate-100 rounded text-[11px] font-mono">
                      {policy.location}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-gray-500 border-r border-[#eee] max-w-sm">
                    <span className="line-clamp-1" title={policy.summary}>
                      {policy.summary}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-center text-gray-600 border-r border-[#eee] text-[11px]">
                    <div>{policy.updatedAt}</div>
                    <div className="text-[10px] text-gray-400">{policy.updatedBy}</div>
                  </td>
                  <td className="py-2 px-2.5 text-center border-r border-[#eee]">
                    <span className="inline-flex items-center gap-1 text-[#3c763d] font-medium text-[11px]">
                      <CheckCircle size={11} /> {policy.status}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {policy.type === 'route' ? (
                        <a
                          href={policy.slug}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-blue-600 cursor-pointer"
                          title="Xem trực tiếp trên Web"
                        >
                          <ExternalLink size={13} />
                        </a>
                      ) : (
                        <button
                          onClick={() => setPreviewPolicy(policy)}
                          className="p-1 text-gray-400 hover:text-blue-600 cursor-pointer"
                          title="Xem trước nội dung Popup"
                        >
                          <Eye size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingPolicy(policy)}
                        className="px-2 py-0.5 text-xs bg-[#f4f4f4] hover:bg-[#e6e6e6] border border-[#ccc] text-slate-700 flex items-center gap-1 cursor-pointer font-medium"
                        title="Sửa nội dung điều khoản"
                      >
                        <Edit size={11} />
                        <span>Chỉnh sửa</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CHỈNH SỬA NỘI DUNG CHÍNH SÁCH */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#ccc] shadow-lg max-w-xl w-full p-4 space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-[#eee] pb-2">
              <h3 className="font-bold text-xs uppercase text-slate-800">
                Chỉnh Sửa Văn Bản Điều Khoản: {editingPolicy.title}
              </h3>
              <button
                onClick={() => setEditingPolicy(null)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Tiêu đề chính sách / trang:
                </label>
                <input
                  type="text"
                  value={editingPolicy.title}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
                  className="w-full h-8 px-2 text-xs border border-[#ccc] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Tóm tắt ngắn (Hiển thị xem nhanh):
                </label>
                <input
                  type="text"
                  value={editingPolicy.summary}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, summary: e.target.value })}
                  className="w-full h-8 px-2 text-xs border border-[#ccc] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Nội dung điều khoản chi tiết (Hiển thị cho khách hàng):
                </label>
                <textarea
                  rows={6}
                  value={editingPolicy.content}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, content: e.target.value })}
                  className="w-full p-2 text-xs border border-[#ccc] font-sans leading-relaxed focus:outline-none"
                  placeholder="Nhập nội dung các điều khoản, gạch đầu dòng..."
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#eee]">
                <span className="text-[11px] text-gray-500">
                  Vị trí: <strong>{editingPolicy.location}</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPolicy(null)}
                    className="px-3 py-1.5 border border-[#ccc] text-xs hover:bg-[#f4f4f4] cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#222d32] hover:bg-black text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Save size={13} />
                    <span>Lưu Cập Nhật</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: XEM TRƯỚC NỘI DUNG CHÍNH SÁCH POPUP */}
      {previewPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#ccc] shadow-lg max-w-lg w-full p-4 space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-[#eee] pb-2">
              <h3 className="font-bold text-xs uppercase text-slate-800">{previewPolicy.title}</h3>
              <button
                onClick={() => setPreviewPolicy(null)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-[#eee] text-xs text-gray-700 whitespace-pre-line leading-relaxed max-h-80 overflow-y-auto font-sans">
              {previewPolicy.content}
            </div>

            <div className="text-right pt-2 border-t border-[#eee]">
              <button
                onClick={() => setPreviewPolicy(null)}
                className="px-3 py-1.5 bg-[#f4f4f4] hover:bg-[#e6e6e6] border border-[#ccc] text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
