import HeroCarousel from '../components/Home/HeroCarousel';
import Services from '../components/Home/Services';
import FlashSale from '../components/Home/FlashSale';
import FeaturedCategoriesAndBrand from '../components/Home/FeaturedCategoriesAndBrand';
import NewArrivals from '../components/Home/NewArrivals';
import ShopBySkinType from '../components/Home/ShopBySkinType';
import StoryVideoBanner from '../components/Home/StoryVideoBanner';
import BeautyPhilosophy from '../components/Home/BeautyPhilosophy';
import FAQ from '../components/Home/FAQ';
import SkinQuizBanner from '../components/Home/SkinQuizBanner';

export default function Home() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <HeroCarousel />

      <FlashSale />

      <FeaturedCategoriesAndBrand />
      <BeautyPhilosophy />

      <NewArrivals />

      <ShopBySkinType />

      <StoryVideoBanner />

      {/* Trắc nghiệm chẩn đoán da & Routine K-Beauty */}
      <SkinQuizBanner />

      <Services />

      <FAQ />
    </main>
  );
}