import PageTransition from "@/components/PageTransition";
import PricingSection from "@/components/PricingSection";

const PricingPage = () => (
  <PageTransition>
    <div className="pb-32 md:pb-0">
      <PricingSection />
    </div>
  </PageTransition>
);

export default PricingPage;
