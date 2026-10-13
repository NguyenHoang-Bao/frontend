import React, { useState } from 'react';
import { Menu, Layout, Sliders } from 'lucide-react';

interface InterfaceManagementProps {
  subTab?: 'menu' | 'layout' | 'theme';
}

export default function InterfaceManagement({ subTab = 'menu' }: InterfaceManagementProps) {
  const [currentSubTab, setCurrentSubTab] = useState<'menu' | 'layout' | 'theme'>(subTab);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-2 text-xs text-[#333] font-sans">
      {savedNotice && (
        <div className="fixed top-3 right-3 z-50 bg-[#333] text-white text-xs px-3 py-1.5 border border-[#111]">
          Đã lưu cấu hình.
        </div>
      )}

      {/* Header bar kiểu tab cổ điển */}
      <div className="bg-white p-2 border border-[#ccc] flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-bold text-xs text-[#333]">
            {currentSubTab === 'menu' && 'Cấu hình Menu'}
            {currentSubTab === 'layout' && 'Cấu hình Bố cục trang chủ'}
            {currentSubTab === 'theme' && 'Tùy chỉnh giao diện'}
          </span>
          <span className="text-[#777] ml-2 text-[11px]">(Dành cho Admin tổng quản)</span>
        </div>

        <div className="flex border border-[#ccc] bg-[#f9f9f9]">
          <button
            onClick={() => setCurrentSubTab('menu')}
            className={`px-3 py-1 text-xs cursor-pointer border-r border-[#ccc] ${
              currentSubTab === 'menu' ? 'bg-[#333] text-white font-bold' : 'text-[#333] hover:bg-[#e6e6e6]'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setCurrentSubTab('layout')}
            className={`px-3 py-1 text-xs cursor-pointer border-r border-[#ccc] ${
              currentSubTab === 'layout' ? 'bg-[#333] text-white font-bold' : 'text-[#333] hover:bg-[#e6e6e6]'
            }`}
          >
            Bố cục trang chủ
          </button>
          <button
            onClick={() => setCurrentSubTab('theme')}
            className={`px-3 py-1 text-xs cursor-pointer ${
              currentSubTab === 'theme' ? 'bg-[#333] text-white font-bold' : 'text-[#333] hover:bg-[#e6e6e6]'
            }`}
          >
            Màu sắc & Logo
          </button>
        </div>
      </div>

      {/* Nội dung */}
      {currentSubTab === 'menu' && (
        <div className="bg-white p-3 border border-[#ccc] space-y-2">
          <p className="font-bold border-b border-[#eee] pb-1">Cấu trúc các mục Menu chính:</p>
          <div className="space-y-1">
            {[
              { title: 'Trang chủ', link: '/', active: true, children: [] },
              { title: 'Sản phẩm mỹ phẩm', link: '/products', active: true, children: ['Chăm sóc da', 'Trang điểm', 'Chăm sóc cơ thể'] },
              { title: 'Khuyến mãi / Sale', link: '/sale', active: true, children: [] },
              { title: 'Trắc nghiệm da (Quiz)', link: '/skin-quiz', active: true, children: [] },
              { title: 'Giới thiệu', link: '/about', active: true, children: [] },
              { title: 'Liên hệ', link: '/contact', active: true, children: [] }
            ].map((m, i) => (
              <div key={i} className="p-2 border border-[#eee] bg-[#fafafa] flex items-center justify-between">
                <div>
                  <span className="font-bold mr-2">{i + 1}. {m.title}</span>
                  <span className="text-[#888] font-mono text-[11px]">{m.link}</span>
                  {m.children.length > 0 && (
                    <div className="text-[#555] text-[11px] mt-0.5">
                      Menu con: {m.children.join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#3c763d]">[Hiển thị]</span>
                  <button className="text-[#337ab7] hover:underline cursor-pointer">Sửa</button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSave}
              className="px-3.5 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white font-medium cursor-pointer"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {currentSubTab === 'layout' && (
        <div className="bg-white p-3 border border-[#ccc] space-y-2">
          <p className="font-bold border-b border-[#eee] pb-1">Bố cục các khối Trang chủ:</p>
          <div className="space-y-1">
            {[
              { name: '1. Banner Video & Hero Section', status: 'Bật' },
              { name: '2. Danh Mục Sản Phẩm Nổi Bật', status: 'Bật' },
              { name: '3. Khối Flash Sale', status: 'Bật' },
              { name: '4. Top Sản Phẩm Bán Chạy', status: 'Bật' },
              { name: '5. Cẩm Nang Làm Đẹp', status: 'Bật' },
              { name: '6. Chân trang (Footer)', status: 'Bật' }
            ].map((block, idx) => (
              <div key={idx} className="p-2 border border-[#eee] bg-[#fafafa] flex items-center justify-between">
                <span className="font-medium">{block.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#3c763d]">[{block.status}]</span>
                  <button className="text-[#337ab7] hover:underline cursor-pointer">Cấu hình</button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSave}
              className="px-3.5 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white font-medium cursor-pointer"
            >
              Lưu bố cục
            </button>
          </div>
        </div>
      )}

      {currentSubTab === 'theme' && (
        <div className="bg-white p-3 border border-[#ccc] space-y-2">
          <p className="font-bold border-b border-[#eee] pb-1">Tùy biến nhận diện thương hiệu:</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium">Tông màu chủ đạo:</label>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#e11d48] border border-[#ccc]"></span>
                <span className="text-[#555]">#E11D48 (Màu chuẩn shop)</span>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Khẩu hiệu:</label>
              <input
                type="text"
                defaultValue="Mỹ phẩm chính hãng nâng tầm sắc đẹp"
                className="w-full h-7 px-2 border border-[#ccc] bg-white text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSave}
              className="px-3.5 py-1 text-xs bg-[#337ab7] hover:bg-[#286090] text-white font-medium cursor-pointer"
            >
              Lưu thiết lập
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
