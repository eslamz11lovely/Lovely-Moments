import PageTransition from "@/components/PageTransition";
import FeaturesSection from "@/components/FeaturesSection";
import SocialLinks from "@/components/SocialLinks";

const FeaturesPage = () => (
  <PageTransition>
    <div className="pb-32 md:pb-0">
      <FeaturesSection />
      <SocialLinks />
    </div>
  </PageTransition>
);

export default FeaturesPage;
