import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CheckCircle2, Copy, Check, CreditCard, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { addOrder } from "../services/ordersService";
import { subscribeToPricing, Pricing, calcDiscountedPrice, isDiscountActive } from "../services/pricingService";
import { sendTelegramNotification } from "../services/telegramService";

// ─── Form field types ──────────────────────────────────────────────────────────
interface FormState {
  name: string;
  phone: string;
  occasion: string;
  customOccasion?: string;
  package: string;
  details: string;
}

// ─── Animated label-input wrapper ─────────────────────────────────────────────
const FloatingField = ({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45, ease: "easeOut" }}
    className="relative group"
  >
    <label className="block text-xs font-semibold mb-1.5 font-cairo tracking-wide transition-colors duration-200 group-focus-within:text-primary"
      style={{ color: error ? "hsl(0,84%,60%)" : "var(--muted-foreground)" }}>
      {label}
    </label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.p
          key="err"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="text-xs mt-1 font-cairo"
          style={{ color: "hsl(0,84%,60%)" }}
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
    {hint && !error && (
      <p className="text-[10px] mt-1 font-cairo text-muted-foreground/70">{hint}</p>
    )}
  </motion.div>
);

// ─── Packages ──────────────────────────────────────────────────────────────
const defaultPackages = [
  { key: "premium", name: "الباقة الشاملة", emoji: "👑" },
  { key: "medium", name: "الباقة المتوسطة", emoji: "💎" },
  { key: "basic", name: "الباقة البسيطة", emoji: "💝" },
];

// ─── Main component ────────────────────────────────────────────────────────────
const OrderSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    occasion: "",
    customOccasion: "",
    package: "",
    details: "",
  });

  // ── Fetch pricing from DB ─────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribeToPricing(
      (p) => { if (p) setPricing(p); },
      () => { }
    );
    return () => unsubscribe();
  }, []);

  const discount = pricing?.discount;
  const discountOn = discount ? isDiscountActive(discount) : false;

  // Returns the final (discounted if applicable) price as number
  const getFinalPrice = (key: string): number => {
    if (!pricing) return 0;
    const original = (pricing as any)[key] as number || 0;
    if (discountOn && discount) return calcDiscountedPrice(original, discount);
    return original;
  };

  // Returns original price as number
  const getOriginalPrice = (key: string): number => {
    if (!pricing) return 0;
    return (pricing as any)[key] as number || 0;
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "الاسم مطلوب";
    if (!form.phone.trim()) e.phone = "رقم الموبايل مطلوب";
    else if (!/^01[0-9]{9}$/.test(form.phone.trim())) e.phone = "رقم موبايل مش صحيح";
    if (!form.occasion.trim()) e.occasion = "اختار نوع المناسبة";
    if (form.occasion === "other" && !form.customOccasion?.trim()) e.customOccasion = "اكتب نوع المناسبة الخاصة بك";
    if (!form.package.trim()) e.package = "اختار الباقة المناسبة";
    if (!form.details.trim()) e.details = "اكتب تفاصيل الهدية";
    setErrors(e);

    if (Object.keys(e).length > 0) {
      toast.error("يرجى مراجعة البيانات وتصحيح الأخطاء الموضحة", {
        position: "top-center"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // Store price value in the package field
      const originalPrice = getOriginalPrice(form.package);
      const finalPrice = getFinalPrice(form.package);
      const hasDiscount = discountOn && finalPrice !== originalPrice;
      const packageLabel = hasDiscount
        ? `${defaultPackages.find(p => p.key === form.package)?.name} – ${finalPrice} جنيه (خصم ${discount?.percentage}% من ${originalPrice} جنيه)`
        : `${defaultPackages.find(p => p.key === form.package)?.name} – ${finalPrice} جنيه`;
      const finalOccasion = form.occasion === "other" ? form.customOccasion || "أخرى" : form.occasion;

      const result = await addOrder({
        name: form.name,
        phone: form.phone,
        occasion: finalOccasion,
        details: form.details,
        package: packageLabel,
        status: "جديد",
      });

      // Send Telegram notification (fire-and-forget — never blocks UI)
      sendTelegramNotification({
        customerName: form.name,
        phone: form.phone,
        customerCode: result.orderCode,
        occasionType: finalOccasion,
        packageName: packageLabel,
        giftDetails: form.details,
      });

      setOrderCode(result.orderCode);
      setSubmitted(true);
      toast.success("تم إرسال طلبك بنجاح!", { position: "top-center" });
    } catch (error: any) {
      toast.error("عذراً، حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(orderCode);
      } else {
        // Fallback for insecure context (e.g. testing on local network)
        const textArea = document.createElement("textarea");
        textArea.value = orderCode;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
        } catch (error) {
          console.error("Fallback copy failed", error);
        } finally {
          textArea.remove();
        }
      }
      setCopied(true);
      toast.success("تم نسخ الكود بنجاح", { position: "top-center" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("فشل نسخ الكود، برجاء طباعته/نسخه يدوياً", { position: "top-center" });
      console.error(err);
    }
  };

  // ── Shared input styles ───────────────────────────────────────────────────
  const inputCls = (field: string) =>
    `w-full rounded-xl px-4 py-3 text-sm font-cairo text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-300 ${errors[field]
      ? "border-2 border-destructive focus:ring-2 focus:ring-destructive/30"
      : "border border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
    }`;

  const fieldBg = {
    background: "hsl(var(--input))",
    color: "hsl(var(--foreground))",
    backdropFilter: "blur(8px)",
  };

  const optionStyle = {
    background: "hsl(var(--card))",
    color: "hsl(var(--foreground))",
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <section id="order" className="py-20 px-4 pb-32 md:pb-20">
      <div className="max-w-xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-4xl font-bold font-tajawal mb-2">
            اطلب هديتك دلوقتي 🎁
          </h2>
          <p className="text-muted-foreground text-sm">
            املأ البيانات وهنتواصل معاك في أسرع وقت
          </p>
        </motion.div>

        {/* Success state */}
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="glass-card rounded-2xl p-8 md:p-10 text-center relative overflow-hidden"
              style={{
                border: "1px solid hsla(340,82%,62%,0.25)",
                boxShadow: "0 0 40px hsla(340,82%,62%,0.1)",
              }}
            >
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ border: "2px solid hsla(340,82%,62%,0.2)" }}
                animate={{ opacity: [1, 0], scale: [1, 1.03] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                className="flex justify-center mb-4"
              >
                <CheckCircle2 size={52} style={{ color: "hsl(340,82%,62%)" }} strokeWidth={1.5} />
              </motion.div>

              <motion.div
                className="text-3xl mb-3"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                🎉
              </motion.div>

              <h3 className="text-xl font-bold mb-2 font-tajawal gradient-text">
                تم إرسال طلبك بنجاح!
              </h3>
              <p className="text-muted-foreground font-cairo text-sm mb-5">
                شكراً على ثقتك في Lovely Moments 💕
                <br />
                هنتواصل معاك في أقرب وقت.
              </p>

              {/* Order Code */}
              <div className="glass-card rounded-xl p-4 mb-4" style={{ border: "1px solid hsla(340,82%,62%,0.2)" }}>
                <p className="text-xs text-muted-foreground mb-2 font-cairo">كود الطلب الخاص بك:</p>
                <div className="flex items-center justify-center gap-3">
                  <span
                    className="text-xl md:text-2xl font-bold tracking-widest font-mono"
                    style={{
                      background: "linear-gradient(135deg, hsl(340, 82%, 62%), hsl(270, 60%, 55%))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                    dir="ltr"
                  >
                    {orderCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all glass-card hover:border-primary/30"
                    style={{ border: "1px solid var(--glass-border)" }}
                  >
                    {copied ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span className="text-emerald-400">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-2 font-cairo">
                  احتفظ بهذا الكود لمتابعة طلبك معنا
                </p>
              </div>
            </motion.div>
          ) : (
            /* ── Form ──────────────────────────────────────────────────────── */
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="glass-card rounded-2xl p-6 md:p-8 space-y-5"
              style={{ border: "1px solid var(--glass-border)" }}
            >
              {/* Name */}
              <FloatingField label="الاسم *" error={errors.name}>
                <input
                  type="text"
                  placeholder="اسمك الكريم"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={inputCls("name")}
                  style={fieldBg}
                  maxLength={30}
                />
              </FloatingField>

              {/* Phone */}
              <FloatingField
                label="رقم الموبايل (واتساب) *"
                error={errors.phone}
                hint={
                  <span className="flex items-center gap-1">
                    ℹ️ لازم الرقم يكون عليه واتساب عشان نقدر نتواصل معاك
                  </span>
                }
              >
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={inputCls("phone")}
                  style={fieldBg}
                  dir="ltr"
                />
              </FloatingField>

              {/* Occasion */}
              <FloatingField label="نوع المناسبة *" error={errors.occasion}>
                <select
                  value={form.occasion}
                  onChange={(e) => handleChange("occasion", e.target.value)}
                  className={inputCls("occasion")}
                  style={fieldBg}
                >
                  <option value="" style={optionStyle}>اختار المناسبة</option>
                  <option value="birthday" style={optionStyle}>عيد ميلاد 🎂</option>
                  <option value="anniversary" style={optionStyle}>ذكرى زواج 💍</option>
                  <option value="valentine" style={optionStyle}>فالنتاين ❤️</option>
                  <option value="graduation" style={optionStyle}>تخرج 🎓</option>
                  <option value="newyear" style={optionStyle}>رأس السنة 🎆</option>
                  <option value="reconciliation" style={optionStyle}>صلح 🤍</option>
                  <option value="other" style={optionStyle}>مناسبة تانية 🎉</option>
                </select>
              </FloatingField>

              {/* Custom Occasion */}
              <AnimatePresence>
                {form.occasion === "other" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2">
                      <FloatingField label="اكتب المناسبة الخاصة بك *" error={errors.customOccasion}>
                        <input
                          type="text"
                          placeholder="مثال: ترقية في الشغل..."
                          value={form.customOccasion}
                          onChange={(e) => handleChange("customOccasion", e.target.value)}
                          className={inputCls("customOccasion")}
                          style={fieldBg}
                          maxLength={50}
                        />
                      </FloatingField>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Package — from DB with discount */}
              <FloatingField label="اختار الباقة *" error={errors.package}>
                <select
                  value={form.package}
                  onChange={(e) => handleChange("package", e.target.value)}
                  className={inputCls("package")}
                  style={fieldBg}
                >
                  <option value="" style={optionStyle}>اختار الباقة المناسبة ليك</option>
                  {defaultPackages.map(pkg => {
                    const original = getOriginalPrice(pkg.key);
                    const final = getFinalPrice(pkg.key);
                    const hasDisc = discountOn && final !== original;
                    return (
                      <option key={pkg.key} value={pkg.key} style={optionStyle}>
                        {pkg.emoji} {pkg.name}
                        {original > 0
                          ? hasDisc
                            ? ` – ${final} جنيه (كان ${original})`
                            : ` – ${original} جنيه`
                          : ""}
                      </option>
                    );
                  })}
                </select>
              </FloatingField>

              {/* Discount hint under select */}
              {discountOn && discount && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl"
                >
                  <Tag className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <p className="text-xs font-cairo text-orange-400">
                    <span className="font-bold">خصم {discount.percentage}%</span>
                    {discount.label ? ` — ${discount.label}` : ""} مطبق على جميع الباقات 🎉
                  </p>
                </motion.div>
              )}

              {/* Package Info Note */}
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                <p className="text-[10px] text-muted-foreground/60 font-cairo">
                  عايز تعرف تفاصيل الباقات؟{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/pricing")}
                    className="text-primary hover:underline font-bold"
                  >
                    اطلع على صفحة الأسعار ←
                  </button>
                </p>
              </div>

              {/* Selected Package Badge */}
              <AnimatePresence>
                {form.package && (() => {
                  const selectedPkg = defaultPackages.find(p => p.key === form.package);
                  const orig = getOriginalPrice(form.package);
                  const final = getFinalPrice(form.package);
                  const hasDisc = discountOn && final !== orig;
                  return (
                    <motion.div
                      key="pkg-badge"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="glass-card rounded-xl px-4 py-3 space-y-1"
                      style={{
                        border: hasDisc ? "1px solid hsla(30,90%,55%,0.3)" : "1px solid hsla(340,82%,62%,0.2)",
                        background: hasDisc ? "hsla(30,90%,55%,0.06)" : "hsla(340,82%,62%,0.05)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">✅</span>
                        <p className="text-xs font-cairo text-foreground/80">
                          اخترت:{" "}
                          <span className="font-bold text-foreground">
                            {selectedPkg?.emoji} {selectedPkg?.name || form.package}
                          </span>
                        </p>
                        {hasDisc && discount && (
                          <span className="mr-auto inline-flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <Tag className="w-2.5 h-2.5" />
                            -{discount.percentage}%
                          </span>
                        )}
                      </div>
                      {orig > 0 && (
                        <div className="flex items-baseline gap-2 pr-7">
                          {hasDisc && (
                            <span className="text-muted-foreground/50 text-xs line-through font-cairo">{orig} جنيه</span>
                          )}
                          <span className={`font-bold text-sm font-tajawal ${hasDisc ? "text-orange-400" : "text-foreground"}`}>
                            {final} جنيه
                          </span>
                          {hasDisc && (
                            <span className="text-green-400 text-[11px] font-cairo">وفرت {orig - final} جنيه 💰</span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Details */}
              <FloatingField label="تفاصيل الهدية *" error={errors.details}>
                <textarea
                  placeholder="قولنا عايز الهدية تكون شكلها إزاي..."
                  value={form.details}
                  onChange={(e) => handleChange("details", e.target.value)}
                  rows={3}
                  className={inputCls("details")}
                  style={fieldBg}
                  maxLength={500}
                />
                <div className="text-left mt-1 text-[10px] text-muted-foreground">
                  {form.details.length} / 500
                </div>
              </FloatingField>



              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
                className="w-full glow-button text-white font-bold font-tajawal py-3.5 rounded-xl flex items-center justify-center gap-3 text-sm relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  boxShadow: loading
                    ? "none"
                    : "0 0 25px hsla(340,82%,62%,0.35), 0 6px 16px hsla(0,0%,0%,0.2)",
                }}
              >
                {/* Shimmer */}
                {!loading && (
                  <motion.span
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, hsla(0,0%,100%,0.12) 50%, transparent 100%)",
                    }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                  />
                )}

                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    <span>ابعت الطلب</span>
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center text-muted-foreground text-xs mt-8 font-cairo">
          💕 Lovely Moments - أول منصة للهدايا الرقمية في مصر
        </p>
      </div>
    </section>
  );
};

export default OrderSection;
