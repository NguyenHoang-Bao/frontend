import { useState, useEffect, useCallback } from 'react';
import {
  getUserProfileApi,
  updateUserProfileApi,
  changePasswordApi,
  UserProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '../services/userService';
import { getMyOrdersApi, OrderResponse } from '../services/apiClient';

export interface UseCustomerProfileReturn {
  profile: UserProfile | null;
  orders: OrderResponse[];
  isLoadingProfile: boolean;
  isLoadingOrders: boolean;
  isUpdatingProfile: boolean;
  isChangingPassword: boolean;
  profileError: string | null;
  passwordError: string | null;
  ordersError: string | null;
  profileSuccess: string | null;
  passwordSuccess: string | null;
  updateProfile: (data: UpdateProfilePayload) => Promise<boolean>;
  changePassword: (data: ChangePasswordPayload) => Promise<boolean>;
  reloadProfile: () => Promise<void>;
  reloadOrders: () => Promise<void>;
}

export function useCustomerProfile(): UseCustomerProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return {
        idUser: parsed.idUser || parsed.id || 0,
        username: parsed.username || '',
        fullName: parsed.name || parsed.fullName || '',
        email: parsed.email || '',
        phoneNumber: parsed.phone || parsed.phoneNumber || '',
        avatar: parsed.avatar || '',
        loyaltyPoints: parsed.loyaltyPoints ?? 0,
        authProvider: parsed.authProvider || 'LOCAL',
        enabled: parsed.enabled ?? true,
        emailVerified: parsed.emailVerified ?? false,
        roles: parsed.roles || (parsed.role ? [parsed.role] : ['CUSTOMER']),
      };
    } catch {
      return null;
    }
  });

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // 1. Tải thông tin Profile từ Backend API
  const reloadProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setIsLoadingProfile(true);
    setProfileError(null);
    try {
      const serverProfile = await getUserProfileApi();
      setProfile(serverProfile);

      // Đồng bộ thông tin mới nhất vào localStorage để Navbar đồng bộ
      const currentStored = localStorage.getItem('currentUser');
      const baseObj = currentStored ? JSON.parse(currentStored) : {};
      const updatedLocal = {
        ...baseObj,
        idUser: serverProfile.idUser,
        name: serverProfile.fullName,
        fullName: serverProfile.fullName,
        email: serverProfile.email,
        phone: serverProfile.phoneNumber,
        phoneNumber: serverProfile.phoneNumber,
        avatar: serverProfile.avatar,
        loyaltyPoints: serverProfile.loyaltyPoints,
        roles: serverProfile.roles,
        role: serverProfile.roles.some((r) => r.includes('ADMIN')) ? 'ADMIN' : 'CUSTOMER',
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedLocal));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tải thông tin hồ sơ từ máy chủ.';
      setProfileError(msg);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  // 2. Tải danh sách đơn hàng cá nhân
  const reloadOrders = useCallback(async () => {
    const token = localStorage.getItem('token');
    setIsLoadingOrders(true);
    setOrdersError(null);

    // Ưu tiên gọi API Backend nếu đã đăng nhập và có token
    if (token) {
      try {
        const pageData = await getMyOrdersApi(0, 50);
        setOrders(pageData.content || []);
        setIsLoadingOrders(false);
        return;
      } catch (err) {
        console.warn('Không thể tải đơn hàng từ API Backend, đang fallback về localStorage:', err);
      }
    }

    // Fallback: Tìm đơn hàng trong localStorage
    try {
      const phone = profile?.phoneNumber || '';
      const localPhoneOrders = phone ? localStorage.getItem(`orders_${phone}`) : null;
      if (localPhoneOrders) {
        setOrders(JSON.parse(localPhoneOrders));
      } else {
        const all = localStorage.getItem('all_placed_orders');
        if (all) {
          const parsed = JSON.parse(all);
          const userOrders = parsed.filter(
            (o: { phone?: string; customerName?: string }) =>
              (phone && o.phone === phone) || (profile?.fullName && o.customerName === profile.fullName)
          );
          setOrders(userOrders);
        } else {
          setOrders([]);
        }
      }
    } catch (e) {
      setOrdersError('Không thể đọc dữ liệu lịch sử đơn hàng.');
    } finally {
      setIsLoadingOrders(false);
    }
  }, [profile?.phoneNumber, profile?.fullName]);

  // Khởi chạy khi component mount
  useEffect(() => {
    reloadProfile();
  }, [reloadProfile]);

  useEffect(() => {
    reloadOrders();
  }, [reloadOrders]);

  // 3. Cập nhật hồ sơ
  const updateProfile = useCallback(
    async (data: UpdateProfilePayload): Promise<boolean> => {
      setIsUpdatingProfile(true);
      setProfileError(null);
      setProfileSuccess(null);

      try {
        const updated = await updateUserProfileApi(data);
        setProfile(updated);

        // Lưu vào localStorage
        const currentStored = localStorage.getItem('currentUser');
        const baseObj = currentStored ? JSON.parse(currentStored) : {};
        const updatedLocal = {
          ...baseObj,
          idUser: updated.idUser,
          name: updated.fullName,
          fullName: updated.fullName,
          email: updated.email,
          phone: updated.phoneNumber,
          phoneNumber: updated.phoneNumber,
          avatar: updated.avatar,
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedLocal));
        window.dispatchEvent(new Event('storage'));

        setProfileSuccess('Cập nhật hồ sơ thành công!');
        setTimeout(() => setProfileSuccess(null), 4000);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Cập nhật hồ sơ thất bại!';
        setProfileError(msg);
        return false;
      } finally {
        setIsUpdatingProfile(false);
      }
    },
    []
  );

  // 4. Đổi mật khẩu
  const changePassword = useCallback(
    async (data: ChangePasswordPayload): Promise<boolean> => {
      setIsChangingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      if (data.newPassword !== data.confirmPassword) {
        setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp!');
        setIsChangingPassword(false);
        return false;
      }

      try {
        await changePasswordApi(data);
        setPasswordSuccess('Đổi mật khẩu thành công!');
        setTimeout(() => setPasswordSuccess(null), 4000);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Đổi mật khẩu thất bại!';
        setPasswordError(msg);
        return false;
      } finally {
        setIsChangingPassword(false);
      }
    },
    []
  );

  return {
    profile,
    orders,
    isLoadingProfile,
    isLoadingOrders,
    isUpdatingProfile,
    isChangingPassword,
    profileError,
    passwordError,
    ordersError,
    profileSuccess,
    passwordSuccess,
    updateProfile,
    changePassword,
    reloadProfile,
    reloadOrders,
  };
}
