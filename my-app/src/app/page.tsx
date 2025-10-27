
import  Navigation from "@/app/(module)/Home/components/layout/Navigation";
import HeroSection from "@/app/(module)/Home/components/sections/HeroSection";
import FeaturesSection from "@/app/(module)/Home/components/sections/FeaturesSection";
import TestimonialsSection from "@/app/(module)/Home/components/sections/TestimonialsSection";
import Footer from "@/app/(module)/Home/components/layout/Footer";
export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
  