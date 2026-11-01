// ============================================================
// addressService.ts  –  Quản lý Sổ Địa Chỉ chuẩn Shopee
// ============================================================

export interface UserAddress {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  label?: 'Nhà riêng' | 'Văn phòng';
  isDefault?: boolean;
}

const STORAGE_PREFIX = 'user_addresses_';

// Tạo key lưu trữ cho từng user
function getUserKey(user: any): string {
  if (!user) return 'guest';
  return String(user.id || user.idUser || user.phone || user.phoneNumber || user.email || 'guest');
}

export const addressService = {
  // Lấy danh sách địa chỉ của user
  getAddresses: (user: any): UserAddress[] => {
    const key = `${STORAGE_PREFIX}${getUserKey(user)}`;
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Lỗi khi đọc địa chỉ từ localStorage:', e);
    }
    return [];
  },

  // Lưu danh sách địa chỉ
  saveAddresses: (user: any, addresses: UserAddress[]) => {
    const key = `${STORAGE_PREFIX}${getUserKey(user)}`;
    try {
      localStorage.setItem(key, JSON.stringify(addresses));
    } catch (e) {
      console.error('Lỗi khi lưu địa chỉ vào localStorage:', e);
    }
  },

  // Khởi tạo địa chỉ mặc định từ thông tin tài khoản nếu user chưa có địa chỉ nào
  initSampleAddressesIfEmpty: (user: any): UserAddress[] => {
    if (!user) return [];
    const currentList = addressService.getAddresses(user);
    if (currentList.length > 0) return currentList;

    const fullName = user.name || user.fullName || 'Nguyễn Hoàng Bảo';
    const phone = user.phone || user.phoneNumber || '0359490221';
    const defaultStreet = user.address || '140 Lê Trọng Tấn';

    const defaultAddresses: UserAddress[] = [
      {
        id: `addr-${Date.now()}-1`,
        fullName,
        phone,
        province: 'Hồ Chí Minh',
        district: 'Tân Phú',
        ward: 'Tây Thạnh',
        address: defaultStreet.includes('Lê Trọng Tấn') ? defaultStreet : `${defaultStreet}`,
        label: 'Nhà riêng',
        isDefault: true
      },
      {
        id: `addr-${Date.now()}-2`,
        fullName,
        phone,
        province: 'Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Bến Nghé',
        address: 'Số 123 Lê Lợi, Tòa nhà Vincom Center',
        label: 'Văn phòng',
        isDefault: false
      }
    ];

    addressService.saveAddresses(user, defaultAddresses);
    return defaultAddresses;
  },

  // Lấy địa chỉ mặc định
  getDefaultAddress: (user: any): UserAddress | null => {
    const list = addressService.initSampleAddressesIfEmpty(user);
    const def = list.find(a => a.isDefault);
    return def || (list.length > 0 ? list[0] : null);
  },

  // Thêm địa chỉ mới
  addAddress: (user: any, data: Omit<UserAddress, 'id'>): UserAddress => {
    const list = addressService.getAddresses(user);
    const newId = `addr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Nếu đây là địa chỉ đầu tiên hoặc được tick làm mặc định, bỏ mặc định các địa chỉ cũ
    const isFirst = list.length === 0;
    const shouldBeDefault = isFirst || Boolean(data.isDefault);

    const updatedList: UserAddress[] = list.map(item => ({
      ...item,
      isDefault: shouldBeDefault ? false : Boolean(item.isDefault)
    }));

    const newAddress: UserAddress = {
      ...data,
      id: newId,
      isDefault: shouldBeDefault
    };

    updatedList.unshift(newAddress);
    addressService.saveAddresses(user, updatedList);
    return newAddress;
  },

  // Cập nhật địa chỉ
  updateAddress: (user: any, updatedData: UserAddress) => {
    const list = addressService.getAddresses(user);
    const updatedList = list.map(item => {
      if (item.id === updatedData.id) {
        return updatedData;
      }
      // Nếu địa chỉ này được đặt làm mặc định thì bỏ mặc định của các địa chỉ khác
      if (updatedData.isDefault) {
        return { ...item, isDefault: false };
      }
      return item;
    });

    addressService.saveAddresses(user, updatedList);
  },

  // Xóa địa chỉ
  deleteAddress: (user: any, addressId: string) => {
    const list = addressService.getAddresses(user);
    let updatedList = list.filter(item => item.id !== addressId);

    // Nếu xóa trúng địa chỉ mặc định, đặt địa chỉ đầu tiên còn lại làm mặc định
    if (updatedList.length > 0 && !updatedList.some(a => a.isDefault)) {
      updatedList[0].isDefault = true;
    }

    addressService.saveAddresses(user, updatedList);
  },

  // Đặt làm mặc định
  setDefault: (user: any, addressId: string) => {
    const list = addressService.getAddresses(user);
    const updatedList = list.map(item => ({
      ...item,
      isDefault: item.id === addressId
    }));
    addressService.saveAddresses(user, updatedList);
  }
};
