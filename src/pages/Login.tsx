import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Loader2 } from "lucide-react";
import AuthBanner from "../components/Auth/AuthBanner";
// ĐÂY LÀ CHỖ M LÀM ĐỂ HỌC:
// Import hàm loginApi từ file apiClient.ts tập trung
// Thay vì viết fetch() thủ công mỗi trang, mình dùng hàm đã đóng gói sẵn
import {
  loginApi,
  loginGoogleApi,
  loginFacebookApi,
} from "../services/apiClient";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // ĐÂY LÀ CHỖ M LÀM ĐỂ HỌC:
      // Gọi loginApi() - hàm này nằm trong apiClient.ts
      // Bên trong hàm đó sẽ tự gọi fetch() tới 'http://localhost:8080/api/auth/login'
      // Backend trả về { token, user } - hàm loginApi đã xử lý lỗi và parse JSON sẵn
      const data = await loginApi({
        phoneNumber: formData.email, // Field "email" trên form thực ra là "phoneNumber" gửi lên backend
        password: formData.password,
      });

      // Lưu token vào localStorage để dùng cho các request sau (apiClient.ts sẽ tự đọc)
      localStorage.setItem("token", data.token);
      // Lưu thông tin user để hiển thị tên, role trên UI
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      // Nếu là ADMIN thì vào trang quản trị, user thường thì về trang chủ
      if (data.user?.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCustomLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (!tokenResponse.access_token) {
        setError("Không nhận được token xác thực từ Google.");
        return;
      }
      setError("");
      setIsLoading(true);

      try {
        // Gửi Access Token của Google sang Backend Spring Boot
        const data = await loginGoogleApi(tokenResponse.access_token);

        // Lưu JWT Token vào localStorage
        localStorage.setItem("token", data.accessToken);

        // Lưu thông tin user để hiển thị avatar, tên
        const isAdmin = data.roles?.some((r: string) => r.includes("ADMIN"));
        const currentUser = {
          id: data.idUser,
          fullName: data.fullName,
          email: data.email,
          roles: data.roles,
          avatar: data.avatar,
          role: isAdmin ? "ADMIN" : "CUSTOMER",
        };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } catch (err: any) {
        setError(err.message || "Đăng nhập Google thất bại");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError("Đăng nhập Google thất bại hoặc bạn đã hủy."),
  });

  // Tự động tải SDK chính hãng của Facebook khi vào trang Login
  useEffect(() => {
    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/vi_VN/sdk.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    (window as any).fbAsyncInit = function () {
      (window as any).FB.init({
        appId: "1406066701717025",
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
    };
  }, []);
  //handle FACEBOOK
  const handleFacebookSuccess = async (response: any) => {
    if (!response.accessToken) {
      setError("Không nhận được mã xác thực từ Facebook.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      // 1. Gửi Access Token của Facebook lên backend Spring Boot
      const data = await loginFacebookApi(response.accessToken);

      // 2. Lưu JWT Token
      localStorage.setItem("token", data.accessToken);

      // 3. Lưu thông tin user
      const isAdmin = data.roles?.some((r: string) => r.includes("ADMIN"));
      const currentUser = {
        id: data.idUser,
        fullName: data.fullName,
        email: data.email,
        roles: data.roles,
        avatar: data.avatar,
        role: isAdmin ? "ADMIN" : "CUSTOMER",
      };
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Đăng nhập Facebook thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    const FB = (window as any).FB;
    if (!FB) {
      setError("Đang kết nối tới Facebook, vui lòng bấm lại sau 2 giây...");
      return;
    }

    FB.login(
      (response: any) => {
        if (response.authResponse?.accessToken) {
          handleFacebookSuccess(response.authResponse);
        } else {
          setError("Đăng nhập Facebook thất bại hoặc bạn đã hủy.");
        }
      },
      { scope: "public_profile,email" },
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Nửa Trái: Banner 1 hình ảnh */}
      <AuthBanner />

      {/* Nửa Phải: Form Đăng Nhập */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative py-6 px-6 sm:px-10 overflow-hidden h-full">
        <Link
          to="/"
          className="absolute top-6 right-6 text-gray-400 hover:text-rose-600 transition-colors"
        >
          <X size={28} />
        </Link>

        <div className="w-full max-w-md my-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase mb-6">
            Đăng Nhập
          </h2>

          {error && (
            <div className="text-red-500 mb-4 text-sm font-medium">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                name="email"
                id="login-email"
                className="peer w-full bg-transparent border-0 border-b border-gray-300 text-gray-900 focus:outline-none focus:border-rose-500 focus:ring-0 placeholder-transparent py-2 transition-colors"
                placeholder="Số điện thoại / Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label
                htmlFor="login-email"
                className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-rose-600"
              >
                Số điện thoại / Email
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                name="password"
                id="login-password"
                className="peer w-full bg-transparent border-0 border-b border-gray-300 text-gray-900 focus:outline-none focus:border-rose-500 focus:ring-0 placeholder-transparent py-2 transition-colors"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label
                htmlFor="login-password"
                className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-rose-600"
              >
                Mật khẩu
              </label>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-500 hover:text-rose-600 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-bold py-3 uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
            </button>

            <div className="text-center mt-6 text-sm text-gray-500">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-rose-500 font-semibold hover:text-rose-700 transition-colors ml-1"
              >
                Đăng ký ngay
              </Link>
            </div>

            {/* Đường phân cách HOẶC */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400 font-medium">
                  Hoặc
                </span>
              </div>
            </div>
            {/* Khung 2 nút đăng nhập mạng xã hội - Chuẩn HTML Button, 100% full width, không bao giờ lệch */}
            <div className="w-full space-y-3">
              {/* Nút Đăng nhập Google (Tự vẽ giao diện chuẩn, ăn theo w-full như form) */}
              <button
                type="button"
                onClick={() => handleGoogleCustomLogin()}
                className="w-full h-[42px] px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded border border-gray-300 text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Đăng nhập bằng Google</span>
              </button>

              {/* Nút Đăng nhập Facebook (Đồng bộ tuyệt đối kích thước h-[42px] và w-full) */}
              <button
                type="button"
                onClick={handleFacebookLogin}
                className="w-full h-[42px] px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium rounded text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Tiếp tục với Facebook</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
