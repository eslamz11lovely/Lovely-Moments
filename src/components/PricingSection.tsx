import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles, Tag, Clock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  subscribeToPricing, Pricing,
  calcDiscountedPrice, isDiscountActive
} from "../services/pricingService";

// ── Countdown Timer ────────────────────────────────────

const useCountdown = (expiresAt: string | null) => {
  const calc = useCallback(() => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    return { h, m, s, total: diff };
  }, [expiresAt]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [expiresAt, calc]);

  return time;
};

// ── Countdown Display ──────────────────────────────────

const CountdownBadge = ({ expiresAt }: { expiresAt: string }) => {
  const time = useCountdown(expiresAt);
  if (!time) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 text-orange-400 font-cairo text-xs">
      <Clock className="w-3.5 h-3.5 animate-pulse" />
      <span>ينتهي بعد:</span>
      <div className="flex gap-1 font-bold" dir="ltr">
        {time.h > 0 && <span>{pad(time.h)}:{pad(time.m)}:{pad(time.s)}</span>}
        {time.h === 0 && <span>{pad(time.m)}:{pad(time.s)}</span>}
      </div>
    </div>
  );
};

// ── Discount Banner ────────────────────────────────────

const DiscountBanner = ({ label, percentage, expiresAt }: {
  label: string; percentage: number; expiresAt: string | null
}) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-2xl border border-orange-500/40 bg-gradient-to-r from-orange-500/15 via-red-500/10 to-orange-500/15 px-5 py-4 mb-8"
  >
    {/* Animated shimmer */}
    <motion.div
      animate={{ x: ["-100%", "200%"] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
    />

    <div className="relative flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-tajawal font-bold text-white text-base">
              {label || "عرض خاص"}
            </span>
            <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-cairo font-bold px-2.5 py-1 rounded-full">
              <Tag className="w-3 h-3" />
              خصم {percentage}%
            </span>
          </div>
          <p className="text-orange-300/80 text-xs font-cairo mt-0.5">
            الخصم يُطيق تلقائياً على جميع الباقات
          </p>
        </div>
      </div>

      {expiresAt && <CountdownBadge expiresAt={expiresAt} />}
    </div>
  </motion.div>
);

// ── Plans config ───────────────────────────────────────

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

// ── Main Pricing Section ───────────────────────────────

const PricingSection = () => {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToPricing(
      (p) => { if (p) setPricing(p); setIsLoading(false); },
      () => setIsLoading(false)
    );
    return () => unsubscribe();
  }, []);

  const getOriginalPrice = (key: string): number => {
    if (!pricing) return Number(defaultPlans.find((p) => p.key === key)?.price || 0);
    return (pricing as any)[key] as number || 0;
  };

  const discount = pricing?.discount;
  const discountOn = discount ? isDiscountActive(discount) : false;

  const plans = defaultPlans.map((plan) => {
    const original = getOriginalPrice(plan.key);
    const final = discountOn && discount
      ? calcDiscountedPrice(original, discount)
      : original;
    return { ...plan, originalPrice: original, finalPrice: final, hasDiscount: discountOn && final !== original };
  });

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

        {/* ── Section Header ── */}
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

        {/* ── Discount Banner ── */}
        <AnimatePresence>
          {discountOn && discount && (
            <DiscountBanner
              label={discount.label}
              percentage={discount.percentage}
              expiresAt={discount.expiresAt}
            />
          )}
        </AnimatePresence>

        {/* ── Cards ── */}
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
              {/* Popular stripe */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
              )}

              {/* Discount corner ribbon */}
              {plan.hasDiscount && (
                <div className="absolute top-3 left-3 z-10">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold font-cairo px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Tag className="w-2.5 h-2.5" />
                    -{discount?.percentage}%
                  </div>
                </div>
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
                      style={{ background: "var(--gradient-primary)", color: "white" }}
                    >
                      <Sparkles className="w-3 h-3" />
                      الأكثر طلبًا
                    </motion.div>
                  )}

                  <div className="text-2xl mb-1.5">{plan.emoji}</div>
                  <h3 className="font-bold text-base md:text-lg font-tajawal">{plan.name}</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">{plan.pages}</p>
                </div>

                {/* ── Price Display ── */}
                <div className="text-center mb-4 py-3 rounded-xl bg-muted/30 relative">
                  <AnimatePresence mode="wait">
                    {plan.hasDiscount ? (
                      <motion.div
                        key="discounted"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {/* Original price - strikethrough */}
                        <div className="flex items-center justify-center gap-1.5 mb-0.5">
                          <span className="text-muted-foreground/60 text-sm line-through font-cairo">
                            {plan.originalPrice}
                          </span>
                          <span className="text-muted-foreground/50 text-xs font-cairo">جنيه</span>
                        </div>
                        {/* New discounted price */}
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl md:text-4xl font-bold text-orange-400">
                            {plan.finalPrice}
                          </span>
                          <span className="text-muted-foreground text-sm mr-1 font-cairo">جنيه</span>
                        </div>
                        <p className="text-green-400/80 text-[11px] font-cairo mt-1">
                          💰 وفرت {plan.originalPrice - plan.finalPrice} جنيه
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="normal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <span className="text-3xl md:text-4xl font-bold gradient-text">
                          {plan.finalPrice}
                        </span>
                        <span className="text-muted-foreground text-sm mr-1 font-cairo">جنيه</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
