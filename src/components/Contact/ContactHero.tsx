const heroBgImg = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=2070&q=80&auto=format&fit=crop';

export default function ContactHero() {
  return (
    <section className="relative flex items-center justify-center text-center w-full min-h-[250px] h-[35vh]">
      {/* Ảnh nền mỹ phẩm */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${heroBgImg})` }}
      ></div>
      {/* Lớp phủ đen / hồng tối sang trọng */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/60"></div>
      {/* Nội dung chữ */}
      <div className="relative z-10 container mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold uppercase mb-3 text-white tracking-[2px]">
          Liên Hệ Với Chúng Tôi
        </h1>
        <p className="text-base md:text-xl text-rose-100 tracking-[1px] opacity-95">
          Hoàng Bảo Cosmetics luôn sẵn sàng lắng nghe và đồng hành cùng làn da của bạn
        </p>
      </div>
    </section>
  );
}