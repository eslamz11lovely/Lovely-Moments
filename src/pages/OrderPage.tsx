import PageTransition from "@/components/PageTransition";
import OrderSection from "@/components/OrderSection";
import SocialLinks from "@/components/SocialLinks";

const OrderPage = () => (
  <PageTransition>
    <div className="pb-32 md:pb-0">
      <OrderSection />
      <SocialLinks />
    </div>
  </PageTransition>
);

export default OrderPage;
