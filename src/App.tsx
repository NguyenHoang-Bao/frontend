import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import PosScreen from './pages/PosScreen';
import WarehouseScreen from './pages/WarehouseScreen';
import DesktopHeader from './components/layout/DesktopHeader';
import { UserProfile } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('hb_desktop_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'POS' | 'WAREHOUSE'>('POS');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hb_desktop_user', JSON.stringify(currentUser));
      // Tách biệt tuyệt đối theo vai trò
      if (currentUser.role === 'WAREHOUSE_MANAGER') {
        setActiveTab('WAREHOUSE');
      } else {
        setActiveTab('POS');
      }
    } else {
      localStorage.removeItem('hb_desktop_user');
      localStorage.removeItem('hb_desktop_token');
    }
  }, [currentUser]);

  const handleTabChange = (tab: 'POS' | 'WAREHOUSE') => {
    if (currentUser?.role === 'STAFF' && tab === 'WAREHOUSE') {
      alert('Tài khoản nhân viên bán hàng không có quyền truy cập quản lý kho!');
      return;
    }
    if (currentUser?.role === 'WAREHOUSE_MANAGER' && tab === 'POS') {
      alert('Tài khoản thủ kho không có quyền truy cập bán hàng POS!');
      return;
    }
    setActiveTab(tab);
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      setCurrentUser(null);
    }
  };

  // Nếu chưa đăng nhập -> Hiển thị Login
  if (!currentUser) {
    return <Login onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#222d32] font-sans select-none">
      {/* THANH TOP BAR DESKTOP */}
      <DesktopHeader
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />

      {/* MÀN HÌNH CHÍNH (POS HOẶC KHO) */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {currentUser.role === 'WAREHOUSE_MANAGER' ? (
          <WarehouseScreen currentUser={currentUser} />
        ) : currentUser.role === 'STAFF' ? (
          <PosScreen currentUser={currentUser} />
        ) : activeTab === 'POS' ? (
          <PosScreen currentUser={currentUser} />
        ) : (
          <WarehouseScreen currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}
