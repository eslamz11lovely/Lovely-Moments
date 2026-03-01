import { motion } from "framer-motion";
import {
  Lock,
  Link2,
  Lightbulb,
  Timer,
  Gift,
  Share2,
  ShieldCheck,
  Zap,
  Pencil,
} from "lucide-react";

/* ─── Feature data ───────────────────────────────────────────────────── */
const topFeatures = [
  {
    icon: Lock,
    title: "خصوصية تامة",
    desc: "موقعكم محمي بكلمة سر، إنتو س اللي تقدروا تشوفوه.",
    color: "hsl(270,60%,55%)",
    glow: "hsla(270,60%,55%,0.3)",
    bg: "hsla(270,60%,55%,0.12)",
  },
  {
    icon: Link2,
    title: "رابط خاص بيكم",
    desc: "لينك دايم ومميز ليكم لوحدكم.",
    color: "hsl(35,90%,55%)",
    glow: "hsla(35,90%,55%,0.3)",
    bg: "hsla(35,90%,55%,0.1)",
  },
];

const highlightFeature = {
  icon: Lightbulb,
  title: "تنفيذ أي فكرة",
  desc: "عندك فكرة معينة؟ بنصممهالك من الصفر.",
  color: "hsl(270,60%,62%)",
  glow: "hsla(270,60%,62%,0.4)",
  bg: "hsla(270,60%,55%,0.15)",
  featured: true,
};

const midFeatures = [
  {
    icon: Timer,
    title: "استلام سريع",
    desc: "⏱",
    color: "hsl(35,90%,55%)",
    glow: "hsla(35,90%,55%,0.3)",
    bg: "hsla(35,90%,55%,0.1)",
    small: true,
  },
  {
    icon: Gift,
    title: "هدية رقمية مختلفة",
    desc: "🎁",
    color: "hsl(270,60%,55%)",
    glow: "hsla(270,60%,55%,0.3)",
    bg: "hsla(270,60%,55%,0.12)",
    small: true,
  },
];

const wideFeature = {
  icon: Share2,
  title: "بنفع تبعتو تطبيق أو لينك حسب اختيارك",
  desc: "",
  color: "hsl(340,82%,62%)",
  glow: "hsla(340,82%,62%,0.3)",
  bg: "hsla(340,82%,62%,0.1)",
};

const bottomFeatures = [
  {
    icon: Pencil,
    title: "تعديل حر",
    desc: "",
    color: "hsl(40,90%,55%)",
    glow: "hsla(40,90%,55%,0.3)",
    bg: "hsla(40,90%,55%,0.1)",
  },
  {
    icon: Zap,
    title: "رد سريع",
    desc: "",
    color: "hsl(50,95%,55%)",
    glow: "hsla(50,95%,55%,0.3)",
    bg: "hsla(50,95%,55%,0.1)",
  },
  {
    icon: ShieldCheck,
    title: "ضمان جودة",
    desc: "",
    color: "hsl(270,60%,55%)",
    glow: "hsla(270,60%,55%,0.3)",
    bg: "hsla(270,60%,55%,0.12)",
  },
];

/* ─── Reusable card ──────────────────────────────────────────────────── */
interface CardProps {
  icon: React.ElementType;
  title: string;
  desc?: string;
  color: string;
  glow: string;
  bg: string;
  featured?: boolean;
  small?: boolean;
  delay?: number;
}

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
  color,
  glow,
  bg,
  featured,
  small,
  delay = 0,
}: CardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="glass-card rounded-2xl p-5 flex items-center gap-4 cursor-default relative overflow-hidden"
    style={{
      border: featured
        ? `2px dashed ${color}`
        : "1px solid var(--glass-border)",
      boxShadow: featured ? `0 0 28px ${glow}` : undefined,
    }}
  >
    {/* Icon badge */}
    <div
      className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
      style={{ background: bg, boxShadow: `0 0 14px ${glow}` }}
    >
      <Icon size={22} style={{ color }} strokeWidth={1.8} />
    </div>

    {!small && (
      <div className="flex flex-col gap-0.5 text-right flex-1">
        <h3
          className="font-bold font-tajawal text-[15px] leading-snug"
          style={{ color: featured ? color : "var(--foreground)" }}
        >
          {title}
        </h3>
        {desc && (
          <p className="text-xs text-muted-foreground font-cairo leading-relaxed">
            {desc}
          </p>
        )}
      </div>
    )}

    {small && (
      <span className="font-bold font-tajawal text-sm" style={{ color: "var(--foreground)" }}>
        {title}
      </span>
    )}
  </motion.div>
);

/* ─── Main section ───────────────────────────────────────────────────── */
const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-xl mx-auto md:max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-tajawal mb-2">
            ليه <span className="gradient-text">Lovely Moments</span>؟ 💎
          </h2>
          <p className="text-muted-foreground font-cairo text-sm">
            مميزات بتخلي هديتك فعلاً مختلفة
          </p>
        </motion.div>

        {/* ── Row 1: two tall cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {topFeatures.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.1} />
          ))}
        </div>

        {/* ── Row 2: featured wide card ── */}
        <div className="mb-4">
          <FeatureCard {...highlightFeature} delay={0.2} />
        </div>

        {/* ── Row 3: two small icon cards ── */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {midFeatures.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={0.3 + i * 0.1} />
          ))}
        </div>

        {/* ── Row 4: full-width share card ── */}
        <div className="mb-4">
          <FeatureCard {...wideFeature} delay={0.4} />
        </div>

        {/* ── Row 5: three small cards ── */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {bottomFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.5 + i * 0.08 }}
              whileHover={{ y: -4, scale: 1.04 }}
              className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 cursor-default"
              style={{ border: "1px solid var(--glass-border)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-1"
                style={{ background: f.bg, boxShadow: `0 0 12px ${f.glow}` }}
              >
                <f.icon size={20} style={{ color: f.color }} strokeWidth={1.8} />
              </div>
              <span className="text-[11px] font-bold font-tajawal text-center leading-tight">
                {f.title}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Delivery note */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl px-6 py-4 text-center"
          style={{ border: "1px solid hsla(340,82%,62%,0.2)" }}
        >
          <p className="text-sm font-cairo text-muted-foreground">
            نقدر ننفذ الهدية كـ{" "}
            <span className="text-primary font-bold">لينك</span> •{" "}
            <span className="text-secondary font-bold">تطبيق</span> •{" "}
            <span className="text-accent font-bold">QR Code</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
