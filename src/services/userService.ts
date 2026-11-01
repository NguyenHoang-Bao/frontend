import { apiFetch } from './apiClient';

export interface UserProfile {
  idUser: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  loyaltyPoints?: number;
  authProvider: string;
  enabled: boolean;
  emailVerified: boolean;
  roles: string[];
}

export interface UpdateProfilePayload {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

// GET /api/users/profile - Lấy hồ sơ tài khoản hiện tại
export async function getUserProfileApi(): Promise<UserProfile> {
  const res = await apiFetch<ApiResponseWrapper<UserProfile>>('/users/profile');
  return res.data;
}

// PUT /api/users/profile - Cập nhật thông tin tài khoản
export async function updateUserProfileApi(payload: UpdateProfilePayload): Promise<UserProfile> {
  const res = await apiFetch<ApiResponseWrapper<UserProfile>>('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

// PUT /api/users/change-password - Đổi mật khẩu
export async function changePasswordApi(payload: ChangePasswordPayload): Promise<void> {
  await apiFetch<ApiResponseWrapper<null>>('/users/change-password', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
