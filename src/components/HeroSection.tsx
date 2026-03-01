import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      <div className="text-center max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-tajawal leading-tight mb-6">
            خليك مختلف… واهدي لحظة{" "}
            <span className="gradient-text">تعيش مش تتنسي</span>{" "}
            🎁💙
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          مش مجرد هدية… دي تجربة رقمية كاملة وذكرى بتفضل عايشة
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button
            onClick={() => navigate("/order")}
            className="glow-button text-primary-foreground font-bold text-lg px-10 py-4 rounded-full"
          >
            اطلب هديتك دلوقتي 🎁
          </button>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
