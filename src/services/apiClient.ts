// ============================================================
// apiClient.ts  –  Trái tim kết nối Frontend ↔ Backend
// ============================================================
// ĐÂY LÀ CHỖ M LÀM ĐỂ HỌC (1/5):
//   - Tất cả URL của API backend được đặt ở đây
//   - Mọi hàm gọi API đều tự động đính kèm JWT Token vào header
// ============================================================

// ─── Địa chỉ gốc của Backend Spring Boot ────────────────────
// Khi deploy thật (Vercel/Render) thì cấu hình biến môi trường VITE_API_BASE_URL
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// ─── Hàm tiện ích: lấy JWT token từ localStorage ─────────────
// Login thành công thì backend trả về token, frontend lưu vào localStorage['token']
function getToken(): string | null {
  return localStorage.getItem('token');
}

// ─── Hàm fetch có kèm Authorization header ───────────────────
// Đây là hàm gốc - tất cả các hàm bên dưới đều dùng nó
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Nếu có token thì tự động đính vào header "Authorization: Bearer <token>"
  // Backend Spring Security sẽ đọc header này để xác thực người dùng
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Nếu server trả về lỗi (4xx, 5xx) thì đọc message và throw lỗi
  if (!response.ok) {
    let message = `Lỗi ${response.status}`;
    try {
      const errData = await response.json();
      // Backend trả về dạng ApiResponse { success, message, data }
      message = errData.message || message;
    } catch {
      // bỏ qua nếu body không phải JSON
    }
    throw new Error(message);
  }

  // Trả về dữ liệu thật từ backend (kiểu T mà mình chỉ định)
  return response.json() as Promise<T>;
}

// ============================================================
// ĐÂY LÀ CHỖ M LÀM ĐỂ HỌC (2/5): CÁC API AUTH
// ============================================================

export interface LoginRequest {
  phoneNumber: string; // Backend nhận trường này (không phải "email")
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string;
    address?: string;
  };
}

// POST /api/auth/login
export async function loginApi(body: LoginRequest): Promise<AuthResponse> {
  // Backend trả về ApiResponse<AuthResponse> nên cần lấy .data
  const res = await apiFetch<{ data: AuthResponse }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

// POST /api/auth/register
export async function registerApi(body: RegisterRequest): Promise<void> {
  await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ============================================================
// ĐÂY LÀ CHỖ M LÀM ĐỂ HỌC (3/5): CÁC API SẢN PHẨM
// ============================================================

export interface BackendProduct {
  idProduct: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  thumbnail?: string;
  images?: string[];
  inStock: boolean;
  sku?: string;
  capacity?: string;
  rating?: number;
  reviewCount?: number;
  category?: { id: number; name: string; slug: string };
  brand?: { id: number; name: string };
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // trang hiện tại (0-based)
  size: number;
}

// GET /api/products  –  lấy danh sách sản phẩm có phân trang + tìm kiếm
export async function getProductsApi(params?: {
  keyword?: string;
  categoryId?: number;
  brandId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}): Promise<PageResponse<BackendProduct>> {
  const query = new URLSearchParams();
  if (params?.keyword) query.set('keyword', params.keyword);
  if (params?.categoryId) query.set('categoryId', String(params.categoryId));
  if (params?.brandId) query.set('brandId', String(params.brandId));
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.size !== undefined) query.set('size', String(params.size));
  if (params?.sortBy) query.set('sortBy', params.sortBy);
  if (params?.sortDir) query.set('sortDir', params.sortDir);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await apiFetch<{ data: PageResponse<BackendProduct> }>(`/products${queryString}`);
  return res.data;
}

// GET /api/products/:id  –  lấy chi tiết 1 sản phẩm
export async function getProductByIdApi(id: number): Promise<BackendProduct> {
  const res = await apiFetch<{ data: BackendProduct }>(`/products/${id}`);
  return res.data;
}

// POST /api/products  –  tạo sản phẩm mới (cần token ADMIN)
export async function createProductApi(body: Partial<BackendProduct>): Promise<BackendProduct> {
  const res = await apiFetch<{ data: BackendProduct }>('/products', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

// PUT /api/products/:id  –  cập nhật sản phẩm (cần token ADMIN)
export async function updateProductApi(id: number, body: Partial<BackendProduct>): Promise<BackendProduct> {
  const res = await apiFetch<{ data: BackendProduct }>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.data;
}

// DELETE /api/products/:id  –  xóa sản phẩm (cần token ADMIN)
export async function deleteProductApi(id: number): Promise<void> {
  await apiFetch(`/products/${id}`, { method: 'DELETE' });
}

// ============================================================
// ĐÂY LÀ CHỖ M LÀM ĐỂ HỌC (4/5): CÁC API DANH MỤC
// ============================================================

export interface BackendCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  banner?: string;
  featured?: boolean;
}

// GET /api/categories  –  lấy tất cả danh mục (public, không cần token)
export async function getCategoriesApi(): Promise<BackendCategory[]> {
  const res = await apiFetch<{ data: BackendCategory[] }>('/categories');
  return res.data;
}

// POST /api/categories  –  tạo danh mục mới (cần token ADMIN)
export async function createCategoryApi(body: Partial<BackendCategory>): Promise<BackendCategory> {
  const res = await apiFetch<{ data: BackendCategory }>('/categories', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

// PUT /api/categories/:id  –  cập nhật danh mục (cần token ADMIN)
export async function updateCategoryApi(id: number, body: Partial<BackendCategory>): Promise<BackendCategory> {
  const res = await apiFetch<{ data: BackendCategory }>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.data;
}

// DELETE /api/categories/:id  –  xóa danh mục (cần token ADMIN)
export async function deleteCategoryApi(id: number): Promise<void> {
  await apiFetch(`/categories/${id}`, { method: 'DELETE' });
}

// ============================================================
// ĐÂY LÀ CHỖ M LÀM ĐỂ HỌC (5/5): CÁC API ĐƠN HÀNG & DASHBOARD
// ============================================================

export type BackendPaymentMethod = 'COD' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY' | 'CASH';

export interface OrderItemRequest {
  idVariant: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerName: string;
  phoneNumber: string;
  deliveryAddress: string;
  paymentMethod: BackendPaymentMethod;
  note?: string;
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  idOrderDetail?: number;
  idVariant?: number;
  productName: string;
  capacity?: string;
  sku?: string;
  quantity: number;
  price: number;
  isReviewed?: boolean;
}

export interface OrderResponse {
  idOrder?: number;
  orderCode: string;
  idUser?: number;
  customerName?: string;
  phoneNumber?: string;
  deliveryAddress?: string;
  orderType?: string;
  totalProductPrice?: number;
  shippingFee?: number;
  totalAmount?: number;
  total?: number;
  paymentMethod?: BackendPaymentMethod | string;
  status: string;
  note?: string;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface PaymentQrResponse {
  orderCode: string;
  totalAmount: number;
  qrCodeUrl: string;
  bankId: string;
  accountNumber: string;
  accountName: string;
  content: string;
  paymentMethod: string;
}

export interface PaymentStatusResponse {
  orderCode: string;
  isPaid: boolean;
  status: string;
  totalAmount?: number;
  transactionId?: string;
  paymentMethod?: string;
}

// POST /api/orders  –  đặt hàng (có thể không cần đăng nhập)
export async function createOrderApi(body: CreateOrderRequest): Promise<OrderResponse> {
  const res = await apiFetch<{ data: OrderResponse }>('/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

// GET /api/orders/my-orders  –  lấy đơn hàng của user đã đăng nhập
export async function getMyOrdersApi(page = 0, size = 10): Promise<PageResponse<OrderResponse>> {
  const res = await apiFetch<{ data: PageResponse<OrderResponse> }>(`/orders/my-orders?page=${page}&size=${size}`);
  return res.data;
}

// GET /api/orders/:orderCode  –  tra cứu đơn theo mã
export async function getOrderByCodeApi(orderCode: string): Promise<OrderResponse> {
  const res = await apiFetch<{ data: OrderResponse }>(`/orders/${orderCode}`);
  return res.data;
}

// GET /api/payment/vietqr/:orderCode  –  lấy mã QR chuyển khoản VietQR cho đơn hàng
export async function getVietQrApi(orderCode: string): Promise<PaymentQrResponse> {
  const res = await apiFetch<{ data: PaymentQrResponse }>(`/payment/vietqr/${orderCode}`);
  return res.data;
}

// GET /api/payment/check-status/:orderCode  –  kiểm tra trạng thái thanh toán đơn hàng (polling)
export async function checkPaymentStatusApi(orderCode: string): Promise<PaymentStatusResponse> {
  const res = await apiFetch<{ data: PaymentStatusResponse }>(`/payment/check-status/${orderCode}`);
  return res.data;
}

// ─── Dashboard API (chỉ dành cho ADMIN) ──────────────────────
export interface DashboardOverviewData {
  totalRevenue: number;
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  pendingOrdersCount: number;
}

// GET /api/admin/dashboard/overview
export async function getDashboardOverviewApi(): Promise<DashboardOverviewData> {
  const res = await apiFetch<{ data: DashboardOverviewData }>('/admin/dashboard/overview');
  return res.data;
}


// ============================================================
// CẤU TRÚC DỮ LIỆU CHUNG CHO OAUTH (GOOGLE, FACEBOOK, APPLE)
// ============================================================
export interface OAuthResponse {
  accessToken: string;
  tokenType: string;
  idUser: number;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
  roles: string[];
}
// ─── 1. Google OAuth ─────────────────────────────────────────
// POST /api/auth/google - Gửi Google ID Token lên backend
export async function loginGoogleApi(idToken: string): Promise<OAuthResponse> {
  const res = await apiFetch<{ data: OAuthResponse }>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
  return res.data;
}
// ─── 2. Facebook OAuth ───────────────────────────────────────
// POST /api/auth/facebook - Gửi Facebook Access Token lên backend
export async function loginFacebookApi(accessToken: string): Promise<OAuthResponse> {
  const res = await apiFetch<{ data: OAuthResponse }>('/auth/facebook', {
    method: 'POST',
    body: JSON.stringify({ accessToken }),
  });
  return res.data;
}