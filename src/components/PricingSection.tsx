import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { subscribeToPricing, Pricing } from "../services/pricingService";

const defaultPlans = [
  {
    name: "الباقة الشاملة",
    pages: "4 صفحات",
    price: "899",
    key: "premium",
    popular: true,
    emoji: "👑",
    features: ["تصميم احترافي فاخر", "باسورد خاص", "رسالة مخصصة", "صور + فيديوهات + ذكريات + أغاني"],
  },
  {
    name: "الباقة المتوسطة",
    pages: "3 صفحات",
    price: "499",
    key: "medium",
    popular: false,
    emoji: "💎",
    features: ["تصميم أنيق ومميز", "باسورد خاص", "رسالة مخصصة", "صور + فيديوهات + ذكريات + أغاني"],
  },
  {
    name: "الباقة البسيطة",
    pages: "صفحتين",
    price: "299",
    key: "basic",
    popular: false,
    emoji: "💝",
    features: ["تصميم خفيف وجميل", "باسورد", "صورة أو فيديو أو أغنية", "مع رسالتك"],
  },
];

const PricingSection = () => {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToPricing(
      (pricing) => {
        if (pricing) setPricing(pricing);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
    return () => unsubscribe();
  }, []);

  const getPrice = (key: string) => {
    if (!pricing) return defaultPlans.find(p => p.key === key)?.price || "0";
    return (pricing as any)[key]?.toString() || "0";
  };

  const plans = defaultPlans.map(plan => ({
    ...plan,
    price: getPrice(plan.key)
  }));

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-7 h-7 text-purple-500 animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-4xl font-bold font-tajawal mb-2">
            💎 اختار باقتك
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            كل باقة متصممة عشان تخلي هديتك مميزة
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative glass-card rounded-2xl overflow-hidden transition-all duration-300 ${plan.popular
                  ? "ring-2 ring-primary/50 shadow-lg shadow-primary/10"
                  : "hover:border-primary/20"
                }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
              )}

              <div className="p-5 md:p-6 flex flex-col h-full">
                {/* Plan header */}
                <div className="text-center mb-4">
                  {plan.popular && (
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold mb-3"
                      style={{
                        background: "var(--gradient-primary)",
                        color: "white",
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      الأكثر طلبًا
                    </motion.div>
                  )}

                  <div className="text-2xl mb-1.5">{plan.emoji}</div>
                  <h3 className="font-bold text-base md:text-lg font-tajawal">{plan.name}</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">{plan.pages}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-4 py-3 rounded-xl bg-muted/30">
                  <span className="text-3xl md:text-4xl font-bold gradient-text">{plan.price}</span>
                  <span className="text-muted-foreground text-sm mr-1">جنيه</span>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-foreground/80">
                      <Check
                        className={`shrink-0 mt-0.5 ${plan.popular ? "text-primary" : "text-emerald-500/70"}`}
                        size={14}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => navigate("/order")}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${plan.popular
                      ? "glow-button text-primary-foreground"
                      : "glass-card text-foreground hover:text-primary border border-primary/20 hover:border-primary/40"
                    }`}
                >
                  اختار الباقة
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
