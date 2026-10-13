import bgImg from '../../assets/img/login/biaLogin.jpg';

export default function AuthBanner() {
  return (
    <div className="hidden lg:block lg:w-1/2 relative h-full overflow-hidden bg-rose-50">
      <img 
        src={bgImg} 
        alt="Beauty Banner" 
        className="w-full h-full object-cover"
      />
    </div>
  );
}