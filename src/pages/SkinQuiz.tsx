import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Droplets,
  Sun,
  Moon,
  ShieldCheck,
  Heart,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShoppingBag,
  BookmarkCheck,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
  Zap,
  Info
} from 'lucide-react';
import productsData from '../data/products.json';
import { CartContext } from '../context/CartContext';
import { getImageUrl } from '../utils/imageHelper';

// Kiểu dữ liệu cho câu hỏi
interface QuizAnswer {
  q1: 'oily' | 'dry' | 'combination' | 'normal' | '';
  q2: 'acne' | 'pigmentation' | 'aging' | 'sensitive' | '';
  q3: 'beginner' | 'experienced' | '';
  q4: 'budget' | 'standard' | 'premium' | '';
}

interface RoutineProduct {
  stepName: string;
  stepNumber: number;
  timeOfDay: 'morning' | 'evening';
  reason: string;
  product: {
    id: number;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    image: string;
    capacity?: string;
    slug?: string;
  };
}

interface DiagnosisResult {
  skinTypeTitle: string;
  skinTypeSubtitle: string;
  summary: string;
  keyIngredients: string[];
  avoidIngredients: string[];
  doctorTips: string[];
  morningRoutine: RoutineProduct[];
  eveningRoutine: RoutineProduct[];
}

export default function SkinQuiz() {
  const { addToCart, openCart } = useContext(CartContext);

  // Trạng thái hiện tại: 'intro' | 'quiz' | 'analyzing' | 'result'
  const [currentStep, setCurrentStep] = useState<'intro' | 'quiz' | 'analyzing' | 'result'>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);

  // Câu trả lời của người dùng
  const [answers, setAnswers] = useState<QuizAnswer>({
    q1: '',
    q2: '',
    q3: '',
    q4: ''
  });

  // Loading text khi đang phân tích
  const [analyzingText, setAnalyzingText] = useState('Đang đối chiếu chỉ số sinh học làn da...');

  // Kết quả chẩn đoán
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  // Tab Routine hiển thị: 'all' | 'morning' | 'evening'
  const [activeRoutineTab, setActiveRoutineTab] = useState<'morning' | 'evening'>('morning');

  // Danh sách ID sản phẩm được người dùng tích chọn mua
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  // Toast thông báo thêm giỏ hàng / lưu routine
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 4 Câu hỏi chính
  const questions = [
    {
      id: 'q1',
      title: 'Tình trạng da mặt của bạn khi vừa thức dậy vào buổi sáng?',
      subtitle: 'Bước này giúp chuyên gia xác định loại da biểu bì thực tế của bạn.',
      options: [
        {
          value: 'oily',
          icon: Droplets,
          label: 'Đổ dầu toàn bộ khuôn mặt',
          desc: 'Vùng trán, mũi, má và cằm đều bóng nhờn, lỗ chân lông to, cảm giác nặng da.'
        },
        {
          value: 'dry',
          icon: Sun,
          label: 'Khô ráp, căng kích và thiếu ẩm',
          desc: 'Bề mặt da sần sùi, căng rát khó chịu, dễ bong tróc vảy nhỏ ở khóe mũi hoặc miệng.'
        },
        {
          value: 'combination',
          icon: Sparkles,
          label: 'Chỉ bóng dầu vùng chữ T (Trán - Mũi - Cằm)',
          desc: 'Khu vực chữ T tiết nhiều dầu thừa, nhưng hai bên gò má lại khô ráo hoặc bình thường.'
        },
        {
          value: 'normal',
          icon: Heart,
          label: 'Bình thường, mềm mại và cân bằng',
          desc: 'Da mịn màng, độ ẩm vừa đủ, không bị đổ dầu quá nhiều và cũng không bị khô căng.'
        }
      ]
    },
    {
      id: 'q2',
      title: 'Vấn đề về da bạn muốn ưu tiên khắc phục nhất lúc này?',
      subtitle: 'Giúp phác thảo nhóm hoạt chất đặc trị chủ đạo mang lại hiệu quả cao nhất.',
      options: [
        {
          value: 'acne',
          icon: AlertCircle,
          label: 'Mụn bọc, mụn ẩn & Bít tắc nang lông',
          desc: 'Cần làm sạch sâu, gom cồi mụn, kháng viêm và kiểm soát dầu nhờn ngăn ngừa mụn mới.'
        },
        {
          value: 'pigmentation',
          icon: Sun,
          label: 'Thâm mụn, sạm nám & Da không đều màu',
          desc: 'Cần làm sáng mờ đốm nâu, phục hồi sắc tố tươi sáng và chống oxy hóa bề mặt da.'
        },
        {
          value: 'aging',
          icon: Clock,
          label: 'Lão hóa, nếp nhăn & Da kém săn chắc',
          desc: 'Cần tái tạo collagen tầng sâu, tăng độ đàn hồi và ngăn ngừa chảy xệ sinh học.'
        },
        {
          value: 'sensitive',
          icon: ShieldCheck,
          label: 'Da nhạy cảm, ửng đỏ & Tổn thương màng bảo vệ',
          desc: 'Cần làm dịu tức thì, cấp cứu phục hồi lớp màng lipid sinh học và hạn chế châm chích.'
        }
      ]
    },
    {
      id: 'q3',
      title: 'Bạn đã từng sử dụng qua các hoạt chất đặc trị (Treatment) chưa?',
      subtitle: 'Đảm bảo nồng độ sản phẩm an toàn tuyệt đối, không gây bùng phát kích ứng.',
      options: [
        {
          value: 'beginner',
          icon: HelpCircle,
          label: 'Chưa từng dùng / Mới bắt đầu làm quen',
          desc: 'Ưu tiên các công thức dịu nhẹ, nồng độ hoạt chất vừa phải, tập trung cấp ẩm phục hồi.'
        },
        {
          value: 'experienced',
          icon: Zap,
          label: 'Đã quen dùng (BHA, AHA, Retinol, Niacinamide)',
          desc: 'Làn da đã có khả năng thích nghi tốt, sẵn sàng cho các phác đồ cải thiện chuyên sâu.'
        }
      ]
    },
    {
      id: 'q4',
      title: 'Mức ngân sách bạn muốn đầu tư cho bộ sản phẩm này?',
      subtitle: 'Hệ thống sẽ cân đối chọn lọc các thương hiệu phù hợp nhất với túi tiền của bạn.',
      options: [
        {
          value: 'budget',
          icon: Heart,
          label: 'Tiết kiệm / Học sinh - Sinh viên',
          desc: 'Tối ưu chi phí (< 500.000₫/bộ), chọn các sản phẩm hiệu quả thực tế và bình dân.'
        },
        {
          value: 'standard',
          icon: Sparkles,
          label: 'Tiêu chuẩn / Hiệu quả da liễu tối ưu',
          desc: 'Mức giá hợp lý (500.000₫ - 1.200.000₫/bộ) từ các hãng dược mỹ phẩm quốc tế uy tín.'
        },
        {
          value: 'premium',
          icon: ShieldCheck,
          label: 'Chuyên sâu & Cao cấp',
          desc: 'Đầu tư chuyên nghiệp (> 1.200.000₫/bộ), công thức cao cấp mang lại biến chuyển nhanh chóng.'
        }
      ]
    }
  ];

  // Helper tìm sản phẩm trong products.json an toàn
  const findProductById = (id: number) => {
    return productsData.find((p: any) => p.id === id);
  };

  // Thuật toán tính toán và đề xuất phác đồ
  const generateDiagnosis = (ans: QuizAnswer): DiagnosisResult => {
    // 1. Phân loại da
    let skinTitle = 'Da Hỗn Hợp Thiên Dầu Nhạy Cảm';
    let skinSubtitle = 'Mất cân bằng tỷ lệ Dầu - Nước, cần thanh lọc nang lông và tái thiết màng ẩm';
    let summary = 'Làn da của bạn có sự phân bổ tuyến bã nhờn không đồng đều. Khi thiếu độ ẩm ở tầng hạ bì, các thụ thể sẽ kích thích tiết dầu bù trừ ở bề mặt, tạo môi trường thuận lợi cho vi khuẩn mụn bùng phát. Mục tiêu hàng đầu là làm sạch thông thoáng nhưng không gây khô rát biểu bì.';
    let keyIngs = ['Niacinamide (Vitamin B3)', 'Hyaluronic Acid đa tầng', 'Panthenol (B5)', 'Ceramide NP'];
    let avoidIngs = ['Cồn khô biến tính (Alcohol Denat)', 'Hương liệu tổng hợp nồng', 'Hạt scrub tẩy tế bào chết vật lý thô ráp'];
    let tips = [
      'Thực hiện rửa mặt bằng nước mát hoặc nước ấm dưới 34°C để tránh làm giãn mao mạch.',
      'Sử dụng kem chống nắng phổ rộng mỗi buổi sáng ngay cả khi làm việc trong văn phòng điều hòa.',
      'Không dùng tay chạm hay nặn các nốt mụn sưng viêm để tránh thâm sâu sau mụn.'
    ];

    if (ans.q1 === 'oily') {
      skinTitle = 'Da Dầu Dễ Bít Tắc & Xu Hướng Mụn';
      skinSubtitle = 'Tăng tiết bã nhờn quá mức, lỗ chân lông giãn nở và dễ bùng viêm';
      summary = 'Tuyến bã nhờn hoạt động quá công suất khiến bề mặt da luôn bóng dầu. Bã nhờn bị oxy hóa kết hợp bụi mịn dễ tạo thành mụn đầu đen và mụn ẩn. Phác đồ cần tập trung vào việc thanh lọc bã nhờn và củng cố hệ vi sinh màng da.';
      keyIngs = ['Salicylic Acid (BHA 1-2%)', 'Niacinamide 2-5%', 'Tràm trà (Tea Tree)', 'Kẽm PCA'];
      avoidIngs = ['Dầu khoáng nặng mặt (Mineral Oil đậm đặc)', 'Sáp dưỡng ẩm dày bí bách'];
    } else if (ans.q1 === 'dry') {
      skinTitle = 'Da Khô Thiếu Ẩm & Tổn Thương Hàng Rào Lipid';
      skinSubtitle = 'Suy giảm nhân tố giữ ẩm tự nhiên (NMF), dễ bong tróc và châm chích';
      summary = 'Làn da của bạn thiếu hụt Ceramide và acid béo tự nhiên, khiến độ ẩm thất thoát nhanh chóng qua biểu bì (TEWL). Cần khẩn trương nạp các chất ngậm nước đa phân tử và chất khóa ẩm sinh học để làm dịu cảm giác căng rát.';
      keyIngs = ['Ceramides 1, 3, 6-II', 'D-Panthenol (Vitamin B5)', 'Glycerin thực vật', 'Bơ hạt mỡ'];
      avoidIngs = ['Sữa rửa mặt tạo bọt kiềm cao (pH > 6.5)', 'Tẩy tế bào chết acid nồng độ cao liên tục'];
    } else if (ans.q1 === 'normal') {
      skinTitle = 'Da Thường Cân Bằng & Khỏe Mạnh';
      skinSubtitle = 'Tỷ lệ ẩm và dầu lý tưởng, cần duy trì hàng rào phòng vệ tự nhiên';
      summary = 'Bạn sở hữu nền da lý tưởng mà nhiều người mơ ước. Mục tiêu trọng tâm là bảo vệ hàng rào miễn dịch da trước ánh sáng xanh, tia cực tím và nuôi dưỡng độ căng bóng trẻ trung lâu dài.';
      keyIngs = ['Vitamin C dịu nhẹ', 'Hyaluronic Acid', 'Peptides sinh học', 'Kem chống nắng SPF 50+'];
      avoidIngs = ['Lạm dụng quá nhiều lớp dưỡng chất không cần thiết gây bết dính'];
    }

    // Tinh chỉnh theo vấn đề da (q2)
    if (ans.q2 === 'pigmentation') {
      skinSubtitle += ' • Đang có tình trạng thâm mụn & sắc tố không đều';
      keyIngs.unshift('Arbutin / Vitamin C dẫn xuất');
    } else if (ans.q2 === 'aging') {
      skinSubtitle += ' • Cần tăng sinh collagen & chống suy giảm tế bào';
      keyIngs.unshift('Bakuchiol / Phyto-Retinol');
    } else if (ans.q2 === 'sensitive') {
      skinSubtitle += ' • Cực kỳ nhạy cảm, dễ kích ứng đỏ rát';
      keyIngs.unshift('Rau má (Centella Asiatica tinh khiết)');
    }

    // 2. Map sản phẩm thật từ products.json
    // Sản phẩm dự phòng an toàn
    const pCetaphilCleanser = findProductById(4) || {
      id: 4,
      name: 'Sữa Rửa Mặt Dịu Nhẹ Cetaphil Gentle Skin Cleanser',
      brand: 'Cetaphil',
      price: 360000,
      image: 'cham-soc-toc-ca-nhan/cetaphil/sua-rua-mat/sua-rua-mat-cetaphil-gentle-skin-cleanser-1.jpg'
    };

    const pCeraveFoaming = findProductById(35) || {
      id: 35,
      name: 'Sữa Rửa Mặt Tạo Bọt Làm Sạch Sâu CeraVe Foaming Cleanser',
      brand: 'CeraVe',
      price: 380000,
      image: 'cham-soc-toc-ca-nhan/cetaphil/sua-rua-mat/sua-rua-mat-cetaphil-gentle-skin-cleanser-1.jpg'
    };

    const pCocoonCleansingWater = findProductById(38) || {
      id: 38,
      name: 'Nước Tẩy Trang Bí Đao Làm Sạch Dầu Mụn Cocoon',
      brand: 'Cocoon',
      price: 275000,
      image: 'cham-soc-toc-ca-nhan/cetaphil/sua-rua-mat/sua-rua-mat-cetaphil-gentle-skin-cleanser-1.jpg'
    };

    const pCeraveMicellar = findProductById(33) || {
      id: 33,
      name: 'Nước Tẩy Trang Cấp Ẩm Dịu Nhẹ CeraVe Micellar Water',
      brand: 'CeraVe',
      price: 320000,
      image: 'cham-soc-toc-ca-nhan/cetaphil/sua-rua-mat/sua-rua-mat-cetaphil-gentle-skin-cleanser-1.jpg'
    };

    const pCeraveSunscreen = findProductById(34) || {
      id: 34,
      name: 'Sữa Chống Nắng Khoáng Chất Vật Lý CeraVe Mineral SPF 50',
      brand: 'CeraVe',
      price: 450000,
      image: 'cham-soc-toc-ca-nhan/cetaphil/duong-am/hu-kem-duong-am-cetaphil-soothing-moisturizing-cream-2.jpg'
    };

    const pCeraveBlemish = findProductById(31) || {
      id: 31,
      name: 'Gel Giảm Mụn & Thông Thoáng Lỗ Chân Lông CeraVe Blemish Control',
      brand: 'CeraVe',
      price: 410000,
      image: 'cham-soc-toc-ca-nhan/cetaphil/duong-am/hu-kem-duong-am-cetaphil-soothing-moisturizing-cream-2.jpg'
    };

    const pCocoonRoseCream = findProductById(36) || {
      id: 36,
      name: 'Thạch Hoa Hồng Cấp Nước Khóa Ẩm Cocoon True Rose Cream',
      brand: 'Cocoon',
      price: 245000,
      image: 'cham-soc-toc-ca-nhan/cetaphil/duong-am/hu-kem-duong-am-cetaphil-soothing-moisturizing-cream-2.jpg'
    };

    const pCetaphilCream = findProductById(1) || findProductById(3) || {
      id: 1,
      name: 'Kem Dưỡng Ẩm Chuyên Sâu Cho Da Khô Cetaphil Cream',
      brand: 'Cetaphil',
      price: 435000,
      image: 'cham-soc-toc-ca-nhan/cetaphil/duong-am/hu-kem-duong-am-cetaphil-soothing-moisturizing-cream-2.jpg'
    };

    // Chọn sản phẩm làm sạch tùy theo dầu hay khô
    const selectedMorningCleanser = (ans.q1 === 'oily' || ans.q1 === 'combination') ? pCeraveFoaming : pCetaphilCleanser;
    const selectedEveningCleanser = selectedMorningCleanser;
    const selectedMakeupRemover = (ans.q1 === 'oily' || ans.q2 === 'acne') ? pCocoonCleansingWater : pCeraveMicellar;
    const selectedMoisturizer = (ans.q1 === 'oily' || ans.q1 === 'combination') ? pCocoonRoseCream : pCetaphilCream;

    // Routine sáng
    const morningRoutine: RoutineProduct[] = [
      {
        stepName: 'Bước 1: Làm Sạch Dịu Nhẹ',
        stepNumber: 1,
        timeOfDay: 'morning',
        reason: 'Rửa sạch dầu thừa và bã nhờn tích tụ suốt đêm mà không bào mòn màng ẩm sinh học.',
        product: {
          id: selectedMorningCleanser.id,
          name: selectedMorningCleanser.name,
          brand: selectedMorningCleanser.brand,
          price: selectedMorningCleanser.price,
          image: selectedMorningCleanser.image || selectedMorningCleanser.thumbnail || ''
        }
      },
      {
        stepName: 'Bước 2: Cấp Nước Đa Tầng',
        stepNumber: 2,
        timeOfDay: 'morning',
        reason: 'Cung cấp độ ẩm mỏng nhẹ giúp tế bào sừng ngậm nước, tạo hiệu ứng căng mịn cả ngày.',
        product: {
          id: selectedMoisturizer.id,
          name: selectedMoisturizer.name,
          brand: selectedMoisturizer.brand,
          price: selectedMoisturizer.price,
          image: selectedMoisturizer.image || selectedMoisturizer.thumbnail || ''
        }
      },
      {
        stepName: 'Bước 3: Chống Nắng Phổ Rộng',
        stepNumber: 3,
        timeOfDay: 'morning',
        reason: 'Lá chắn y khoa ngăn chặn 98% tác hại tia UVA/UVB, chống oxy hóa và ngăn ngừa sạm nám.',
        product: {
          id: pCeraveSunscreen.id,
          name: pCeraveSunscreen.name,
          brand: pCeraveSunscreen.brand,
          price: pCeraveSunscreen.price,
          image: pCeraveSunscreen.image || pCeraveSunscreen.thumbnail || ''
        }
      }
    ];

    // Routine tối
    const eveningRoutine: RoutineProduct[] = [
      {
        stepName: 'Bước 1: Tẩy Trang Sạch Sâu',
        stepNumber: 1,
        timeOfDay: 'evening',
        reason: 'Hòa tan hoàn toàn cặn kem chống nắng kháng nước, bụi mịn PM2.5 và bã nhờn cứng đầu.',
        product: {
          id: selectedMakeupRemover.id,
          name: selectedMakeupRemover.name,
          brand: selectedMakeupRemover.brand,
          price: selectedMakeupRemover.price,
          image: selectedMakeupRemover.image || selectedMakeupRemover.thumbnail || ''
        }
      },
      {
        stepName: 'Bước 2: Sữa Rửa Mặt Tinh Khiết',
        stepNumber: 2,
        timeOfDay: 'evening',
        reason: 'Lấy đi hoàn toàn lớp cặn bẩn còn sót lại sau tẩy trang, đưa độ pH da về chuẩn sinh lý 5.5.',
        product: {
          id: selectedEveningCleanser.id,
          name: selectedEveningCleanser.name,
          brand: selectedEveningCleanser.brand,
          price: selectedEveningCleanser.price,
          image: selectedEveningCleanser.image || selectedEveningCleanser.thumbnail || ''
        }
      },
      {
        stepName: 'Bước 3: Tinh Chất Phục Hồi & Điều Trị',
        stepNumber: 3,
        timeOfDay: 'evening',
        reason: 'Hoạt chất nồng độ tối ưu giúp kháng khuẩn, se khít lỗ chân lông và làm dịu biểu bì.',
        product: {
          id: pCeraveBlemish.id,
          name: pCeraveBlemish.name,
          brand: pCeraveBlemish.brand,
          price: pCeraveBlemish.price,
          image: pCeraveBlemish.image || pCeraveBlemish.thumbnail || ''
        }
      },
      {
        stepName: 'Bước 4: Kem Khóa Ẩm & Tái Tạo Màng Lipid',
        stepNumber: 4,
        timeOfDay: 'evening',
        reason: 'Khóa chặt các dưỡng chất của bước trước, phục hồi hàng rào bảo vệ da trong lúc bạn ngủ.',
        product: {
          id: selectedMoisturizer.id,
          name: selectedMoisturizer.name,
          brand: selectedMoisturizer.brand,
          price: selectedMoisturizer.price,
          image: selectedMoisturizer.image || selectedMoisturizer.thumbnail || ''
        }
      }
    ];

    return {
      skinTypeTitle: skinTitle,
      skinTypeSubtitle: skinSubtitle,
      summary,
      keyIngredients: keyIngs,
      avoidIngredients: avoidIngs,
      doctorTips: tips,
      morningRoutine,
      eveningRoutine
    };
  };

  // Chọn câu trả lời
  const handleSelectOption = (questionKey: 'q1' | 'q2' | 'q3' | 'q4', value: any) => {
    const updatedAnswers = { ...answers, [questionKey]: value };
    setAnswers(updatedAnswers);

    if (currentQuestionIdx < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIdx(prev => prev + 1);
      }, 250);
    } else {
      // Hoàn thành 4 câu ➔ Bắt đầu phân tích
      setCurrentStep('analyzing');
    }
  };

  // Hiệu ứng chờ phân tích (Analyzing screen)
  useEffect(() => {
    if (currentStep === 'analyzing') {
      const t1 = setTimeout(() => {
        setAnalyzingText('Đang đối chiếu thành phần hoạt chất tương thích...');
      }, 600);

      const t2 = setTimeout(() => {
        setAnalyzingText('Đang hoàn thiện phác đồ Routine Sáng & Tối từ kho hàng Hoàng Bảo...');
      }, 1200);

      const t3 = setTimeout(() => {
        const res = generateDiagnosis(answers);
        setDiagnosis(res);

        // Mặc định chọn tất cả sản phẩm
        const allIds = Array.from(
          new Set([
            ...res.morningRoutine.map(r => r.product.id),
            ...res.eveningRoutine.map(r => r.product.id)
          ])
        );
        setSelectedProductIds(allIds);

        setCurrentStep('result');
      }, 1800);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [currentStep, answers]);

  // Toggle chọn sản phẩm mua lẻ
  const toggleProductSelect = (id: number) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(item => item !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  // Tính tổng tiền các sản phẩm được chọn
  const getSelectedTotal = () => {
    if (!diagnosis) return { rawTotal: 0, discountedTotal: 0, count: 0 };
    const allProductsMap = new Map<number, any>();

    diagnosis.morningRoutine.forEach(r => allProductsMap.set(r.product.id, r.product));
    diagnosis.eveningRoutine.forEach(r => allProductsMap.set(r.product.id, r.product));

    let raw = 0;
    let count = 0;
    selectedProductIds.forEach(id => {
      const p = allProductsMap.get(id);
      if (p) {
        raw += p.price;
        count += 1;
      }
    });

    // Mua từ 3 món trở lên giảm 5%
    const discounted = count >= 3 ? Math.round(raw * 0.95) : raw;
    return { rawTotal: raw, discountedTotal: discounted, count };
  };

  // Thêm tất cả sản phẩm được chọn vào giỏ hàng
  const handleAddAllToCart = () => {
    if (!diagnosis || selectedProductIds.length === 0) return;

    const allProductsMap = new Map<number, any>();
    diagnosis.morningRoutine.forEach(r => allProductsMap.set(r.product.id, r.product));
    diagnosis.eveningRoutine.forEach(r => allProductsMap.set(r.product.id, r.product));

    let addedCount = 0;
    selectedProductIds.forEach(id => {
      const p = allProductsMap.get(id);
      if (p) {
        addToCart(p, undefined, 1);
        addedCount++;
      }
    });

    showToast(`Đã thêm ${addedCount} sản phẩm vào giỏ hàng thành công!`);
    openCart();
  };

  // Lưu phác đồ vào máy
  const handleSaveRoutineToLocal = () => {
    if (!diagnosis) return;
    try {
      localStorage.setItem('hb_saved_skin_routine', JSON.stringify({
        diagnosis,
        savedAt: new Date().toLocaleDateString('vi-VN')
      }));
      showToast('Đã lưu kết quả phác đồ vào trình duyệt của bạn!');
    } catch {
      showToast('Không thể lưu kết quả lúc này.');
    }
  };

  // Làm lại bài test
  const handleResetQuiz = () => {
    setAnswers({ q1: '', q2: '', q3: '', q4: '' });
    setCurrentQuestionIdx(0);
    setCurrentStep('intro');
    setDiagnosis(null);
  };

  const currentQ = questions[currentQuestionIdx];
  const { rawTotal, discountedTotal, count } = getSelectedTotal();

  return (
    <div className="min-h-screen bg-[#faf9f6] text-gray-800 font-sans pb-20 selection:bg-rose-100 selection:text-rose-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-gray-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-rose-500/30 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. MÀN HÌNH CHÀO MỪNG (INTRO SCREEN) ── */}
      {currentStep === 'intro' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 md:pt-16">
          <div className="text-center space-y-4 mb-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold tracking-wide uppercase">
              <Sparkles size={14} className="text-rose-500" />
              Chẩn Đoán Làn Da Chuẩn K-Beauty 60 Giây
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Khám Phá Làn Da Đích Thực &amp; <br />
              <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                Xây Dựng Phác Đồ Routine Cá Nhân Hóa
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Bạn băn khoăn không biết da mình thuộc loại nào hay nên dùng serum gì? Chỉ với 4 câu hỏi trắc nghiệm nhanh,
              hệ thống sẽ phân tích sinh học và đề xuất bộ sản phẩm chính hãng chuẩn xác nhất từ Hoàng Bảo Cosmetics.
            </p>
          </div>

          {/* 3 Lợi ích nổi bật */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">Chẩn Đoán Đúng 98%</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Xác định chính xác loại da, lượng bã nhờn và nguyên nhân cốt lõi gây nên mụn, thâm hay nhạy cảm.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                <Sun size={20} />
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">Routine Sáng &amp; Tối</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tối giản từng bước: Làm sạch, dưỡng ẩm, đặc trị và chống nắng phổ rộng dễ thực hiện hàng ngày.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                <ShoppingBag size={20} />
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">Giảm 5% Khi Mua Cả Bộ</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tự động kết nối sản phẩm chính hãng đang có sẵn trong kho, nhận ưu đãi combo độc quyền.
              </p>
            </div>
          </div>

          {/* Nút Bắt đầu */}
          <div className="text-center">
            <button
              onClick={() => setCurrentStep('quiz')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm rounded-full shadow-lg shadow-rose-200 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Bắt Đầu Kiểm Tra Da Ngay (Miễn Phí)</span>
              <ArrowRight size={16} />
            </button>
            <p className="text-[11px] text-gray-400 mt-3 font-medium">
              Hoàn toàn bảo mật • Không yêu cầu đăng ký tài khoản
            </p>
          </div>
        </div>
      )}

      {/* ── 2. MÀN HÌNH WIZARD TRẮC NGHIỆM (QUIZ STEPS) ── */}
      {currentStep === 'quiz' && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10">
          
          {/* Header & Thanh Tiến Trình */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
              <button
                onClick={() => {
                  if (currentQuestionIdx > 0) {
                    setCurrentQuestionIdx(prev => prev - 1);
                  } else {
                    setCurrentStep('intro');
                  }
                }}
                className="inline-flex items-center gap-1 hover:text-gray-900 cursor-pointer"
              >
                <ArrowLeft size={14} /> Quay lại
              </button>
              <span className="text-rose-600 font-bold">
                Câu {currentQuestionIdx + 1} / {questions.length}
              </span>
            </div>

            {/* Thanh tiến trình bo góc */}
            <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Tiêu đề câu hỏi */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 mb-1 block">
              BƯỚC {currentQuestionIdx + 1}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-2">
              {currentQ.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              {currentQ.subtitle}
            </p>

            {/* Danh sách các Option Card */}
            <div className="mt-6 space-y-3">
              {currentQ.options.map((opt, idx) => {
                const IconComponent = opt.icon;
                const isSelected = answers[currentQ.id as keyof QuizAnswer] === opt.value;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id as any, opt.value)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-4 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/70 shadow-sm ring-2 ring-rose-400/20'
                        : 'border-gray-200 bg-white hover:border-rose-300 hover:bg-rose-50/30'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <IconComponent size={20} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-gray-900 mb-0.5">{opt.label}</h4>
                        {isSelected && <Check size={16} className="text-rose-600 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ── 3. MÀN HÌNH CHỜ PHÂN TÍCH (ANALYZING LOADER) ── */}
      {currentStep === 'analyzing' && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="relative mb-6">
            {/* Vòng tròn loading xoay nhẹ K-Beauty */}
            <div className="w-20 h-20 rounded-full border-4 border-rose-100 border-t-rose-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={24} className="text-rose-500 animate-pulse" />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Chuyên Gia Đang Phân Tích Làn Da...
          </h3>
          <p className="text-xs sm:text-sm text-rose-600 font-medium animate-pulse max-w-md">
            {analyzingText}
          </p>
        </div>
      )}

      {/* ── 4. MÀN HÌNH KẾT QUẢ & PHÁC ĐỒ (RESULT PAGE) ── */}
      {currentStep === 'result' && diagnosis && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
          
          {/* Header kết quả */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Kết Quả Chẩn Đoán Sinh Học
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveRoutineToLocal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-300 hover:border-gray-900 text-gray-700 text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                <BookmarkCheck size={14} className="text-rose-500" />
                <span>Lưu Phác Đồ</span>
              </button>
              <button
                onClick={handleResetQuiz}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-300 hover:border-gray-900 text-gray-700 text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Làm Lại</span>
              </button>
            </div>
          </div>

          {/* THẺ HỒ SƠ LÀN DA (SKIN PROFILE CARD) */}
          <div className="bg-gradient-to-br from-rose-50 via-white to-pink-50 p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm mb-10">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-500 block">
                LOẠI DA CỦA BẠN:
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {diagnosis.skinTypeTitle}
              </h2>
              <p className="text-xs sm:text-sm text-rose-800 font-semibold">
                {diagnosis.skinTypeSubtitle}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-2 border-t border-rose-100">
                {diagnosis.summary}
              </p>
            </div>

            {/* Khối Hoạt chất nên dùng & nên tránh */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-rose-200/60">
              <div className="bg-white/80 p-4 rounded-2xl border border-emerald-100 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 size={14} className="text-emerald-600" /> Hoạt Chất Khuyên Dùng:
                </span>
                <ul className="space-y-1 text-xs text-gray-700">
                  {diagnosis.keyIngredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/80 p-4 rounded-2xl border border-rose-100 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5 mb-2">
                  <AlertCircle size={14} className="text-rose-500" /> Thành Phần Cần Tránh:
                </span>
                <ul className="space-y-1 text-xs text-gray-700">
                  {diagnosis.avoidIngredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* PHÁC ĐỒ ROUTINE SÁNG VÀ TỐI */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Phác Đồ Chăm Sóc Da Chuẩn Y Khoa
                </h3>
                <p className="text-xs text-gray-500">
                  Được thiết kế tinh gọn, tương thích sinh học với dòng sản phẩm chính hãng của Hoàng Bảo.
                </p>
              </div>

              {/* Tab chuyển đổi Sáng / Tối */}
              <div className="flex items-center p-1 bg-white border border-gray-200 rounded-full shadow-2xs self-start sm:self-auto">
                <button
                  onClick={() => setActiveRoutineTab('morning')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeRoutineTab === 'morning'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Sun size={14} />
                  <span>Buổi Sáng ({diagnosis.morningRoutine.length} bước)</span>
                </button>
                <button
                  onClick={() => setActiveRoutineTab('evening')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeRoutineTab === 'evening'
                      ? 'bg-indigo-900 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Moon size={14} />
                  <span>Buổi Tối ({diagnosis.eveningRoutine.length} bước)</span>
                </button>
              </div>
            </div>

            {/* Danh sách các bước trong Routine */}
            <div className="space-y-4">
              {(activeRoutineTab === 'morning' ? diagnosis.morningRoutine : diagnosis.eveningRoutine).map(
                (step, idx) => {
                  const isChecked = selectedProductIds.includes(step.product.id);
                  const imageUrl = getImageUrl(step.product.image, { width: 300, height: 300 });

                  return (
                    <div
                      key={idx}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isChecked
                          ? 'bg-white border-rose-200 shadow-sm'
                          : 'bg-gray-50/60 border-gray-200 opacity-70'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        
                        {/* Checkbox & Thông tin bước */}
                        <div className="flex items-start gap-3.5 flex-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleProductSelect(step.product.id)}
                            className="w-4 h-4 mt-1 rounded text-rose-600 focus:ring-rose-500 border-gray-300 cursor-pointer"
                            id={`prod-${step.product.id}-${idx}`}
                          />

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full inline-block">
                              {step.stepName}
                            </span>
                            <h4 className="font-bold text-sm sm:text-base text-gray-900">
                              {step.product.name}
                            </h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {step.reason}
                            </p>
                          </div>
                        </div>

                        {/* Giá tiền & Hình ảnh sản phẩm */}
                        <div className="flex items-center gap-4 self-end sm:self-auto shrink-0 pl-7 sm:pl-0">
                          <div className="text-right">
                            <span className="text-sm sm:text-base font-extrabold text-rose-600 block">
                              {step.product.price.toLocaleString('vi-VN')}₫
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                              Thương hiệu: {step.product.brand}
                            </span>
                          </div>

                          <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                            <img
                              src={imageUrl}
                              alt={step.product.name}
                              className="w-full h-full object-cover"
                              onError={(e: any) => {
                                e.target.src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&q=80';
                              }}
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* KHỐI TỔNG KẾT & CHỐT ĐƠN HÀNG (CONVERSION BOX) */}
          <div className="mt-10 bg-white p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                  <Sparkles size={13} />
                  Ưu Đãi Đặc Quyền Phác Đồ Trọn Bộ:
                </span>
                <h4 className="text-lg font-bold text-gray-900">
                  Đã chọn {count} sản phẩm cho chu trình chăm sóc da
                </h4>
                <p className="text-xs text-gray-500">
                  {count >= 3 ? (
                    <span className="text-emerald-600 font-semibold">
                      🎉 Bạn được áp dụng chiết khấu 5% khi mua từ 3 món trong Routine!
                    </span>
                  ) : (
                    'Chọn thêm sản phẩm để được áp dụng giảm giá Combo 5%.'
                  )}
                </p>
              </div>

              {/* Cột giá & Nút thêm giỏ */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-left sm:text-right">
                  {count >= 3 && (
                    <span className="text-xs text-gray-400 line-through block">
                      {rawTotal.toLocaleString('vi-VN')}₫
                    </span>
                  )}
                  <div className="text-2xl font-black text-rose-600">
                    {discountedTotal.toLocaleString('vi-VN')}₫
                  </div>
                </div>

                <button
                  type="button"
                  disabled={count === 0}
                  onClick={handleAddAllToCart}
                  className={`px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                    count > 0
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-rose-200 hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag size={16} />
                  <span>Thêm Tất Cả Vào Giỏ Hàng</span>
                </button>
              </div>

            </div>
          </div>

          {/* LỜI KHUYÊN TỪ CỐ VẤN */}
          <div className="mt-8 p-6 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-start gap-3.5">
            <Info size={18} className="text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600 space-y-1">
              <strong className="font-bold text-gray-900">Lời khuyên sử dụng phác đồ:</strong>
              <p>
                Hãy bắt đầu áp dụng phác đồ từ nồng độ và tần suất thấp (cách ngày trong tuần đầu tiên).
                Uống đủ 2 lít nước mỗi ngày và hạn chế thức khuya để hàng rào sinh học của da phục hồi tối ưu nhất.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
