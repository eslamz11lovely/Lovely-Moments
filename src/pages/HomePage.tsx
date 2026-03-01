import PageTransition from "@/components/PageTransition";
import HeroSection from "@/components/HeroSection";
import WhatIsLovelySection from "@/components/WhatIsLovelySection";
import WhatWeDoSection from "@/components/WhatWeDoSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import TikTokSection from "@/components/TikTokSection";

const HomePage = () => (
  <PageTransition>
    <HeroSection />
    <WhatIsLovelySection />
    <WhatWeDoSection />
    <TestimonialsSection />
    <TikTokSection />
  </PageTransition>
);

export default HomePage;
