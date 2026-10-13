import { useState, ChangeEvent, FormEvent } from 'react';
import { BsCheckCircleFill } from 'react-icons/bs';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form data:', formData);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="lg:w-7/12">
      <div className="p-6 md:p-8 rounded-lg border border-gray-200 bg-white shadow-sm">
        <h3 className="text-2xl font-bold mb-8 text-gray-900 uppercase">
          Gửi tin nhắn cho chúng tôi
        </h3>

        {isSubmitted ? (
          <div className="py-10 px-6 text-center rounded-lg bg-pink-50/50 border border-pink-200">
            <div className="w-12 h-12 bg-pink-500 text-white rounded-md flex items-center justify-center mx-auto mb-4 shadow-sm">
              <BsCheckCircleFill size={24} />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Đã gửi tin nhắn thành công!</h4>
            <p className="text-gray-600 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Cảm ơn bạn <span className="font-semibold text-gray-900">{formData.name}</span> đã liên hệ. Đội ngũ tư vấn của Hoàng Bảo Cosmetics sẽ liên hệ lại với bạn trong thời gian sớm nhất!
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-pink-600 bg-white border border-pink-300 rounded-md hover:bg-pink-50 transition-colors shadow-sm"
            >
              Gửi thêm tin nhắn khác
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  Họ và Tên <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 bg-white text-sm transition-colors"
                  placeholder="Họ và Tên của bạn"
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  Email của bạn <span className="text-pink-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 bg-white text-sm transition-colors"
                  placeholder="Email của bạn"
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  Số điện thoại <span className="text-pink-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 bg-white text-sm transition-colors"
                  placeholder="Số điện thoại"
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  Tiêu đề <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 bg-white text-sm transition-colors"
                  placeholder="Tiêu đề (VD: Tư vấn da, đơn hàng...)"
                  required
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  Nội dung lời nhắn <span className="text-pink-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 bg-white text-sm transition-colors resize-none"
                  placeholder="Nội dung lời nhắn hoặc tình trạng làn da bạn cần tư vấn..."
                  required
                ></textarea>
              </div>
              <div className="col-span-1 md:col-span-2 mt-2">
                <button
                  type="submit"
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md shadow-rose-200 cursor-pointer"
                >
                  Gửi Tin Nhắn
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}