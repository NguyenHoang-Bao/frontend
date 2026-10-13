/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Đặt Be Vietnam Pro làm font mặc định cho toàn trang
        sans: ['"Be Vietnam Pro"', "sans-serif"],
        // Tạo một font 'art' riêng để sử dụng cho các đoạn văn nghệ thuật
        art: ['"Lora"', "serif"],
      },
      colors: {
        // Bổ sung bảng màu chủ đạo mới kiểu pastel nhẹ nhàng (Vibe Lam Thảo)
        primary: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e", // Màu hồng đào chủ đạo (dùng cho nút bấm, logo)
          600: "#e11d48",
          700: "#be123c",
        },
        // Màu nền mặc định siêu nhạt thay vì trắng tinh
        appBg: "#fafafa",
      },
    },
  },
  plugins: [],
};
