import { motion } from "framer-motion";

const testimonials = [
    {
        name: "سارة أحمد",
        text: "هدية مختلفة ومميزة جداً! فرحت صاحبتي بيها أوي 💕",
        rating: 5,
    },
    {
        name: "محمد علي",
        text: "خدمة ممتازة وتصميم راقي، الكل اتبسط من الهدية 🎁",
        rating: 5,
    },
    {
        name: "نورهان خالد",
        text: "أحلى حاجة عملتها لخطيبي في عيد ميلاده، شكراً Lovely Moments ❤️",
        rating: 5,
    },
    {
        name: "أحمد حسن",
        text: "فكرة إبداعية وتنفيذ احترافي، هكرر التجربة أكيد ✨",
        rating: 5,
    },
    {
        name: "ياسمين وليد",
        text: "من أجمل الهدايا اللي قدمتها في حياتي، الكل سألني عليها 🌹",
        rating: 5,
    },
    {
        name: "كريم محمود",
        text: "سهولة في الطلب وسرعة في التنفيذ، تجربة رائعة 👏",
        rating: 5,
    },
];

/* ── Duplicate for seamless loop ── */
const doubled = [...testimonials, ...testimonials];

const StarIcon = () => (
    <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-3.5 h-3.5 text-amber-400"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const TestimonialsSection = () => (
    <section className="py-20 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto">
            {/* ── Title ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <h2 className="text-3xl md:text-4xl font-bold font-tajawal mb-3">
                    آراء{" "}
                    <span className="gradient-text">عملائنا</span>
                </h2>
                <p className="text-muted-foreground font-cairo text-sm md:text-base">
                    اللي جربوا Lovely Moments بيقولوا إيه 💬
                </p>
            </motion.div>

            {/* ── Marquee (pure CSS) ── */}
            <div className="relative">
                {/* Fade edges */}
                <div
                    className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 z-10"
                    style={{
                        background:
                            "linear-gradient(to right, hsl(var(--background)), transparent)",
                    }}
                />
                <div
                    className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 z-10"
                    style={{
                        background:
                            "linear-gradient(to left, hsl(var(--background)), transparent)",
                    }}
                />

                <div className="testimonial-marquee-wrapper">
                    <div className="testimonial-marquee-track">
                        {doubled.map((t, i) => (
                            <div
                                key={i}
                                className="testimonial-card glass-card rounded-2xl p-5 flex-shrink-0 w-72 md:w-80 select-none"
                                style={{
                                    border: "1px solid var(--glass-border)",
                                }}
                            >
                                {/* Stars */}
                                <div className="flex gap-0.5 mb-3">
                                    {Array.from({ length: t.rating }).map(
                                        (_, s) => (
                                            <StarIcon key={s} />
                                        )
                                    )}
                                </div>

                                {/* Quote */}
                                <p className="font-cairo text-sm leading-relaxed text-foreground/85 mb-4">
                                    "{t.text}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                        style={{
                                            background:
                                                "var(--gradient-primary)",
                                        }}
                                    >
                                        {t.name.charAt(0)}
                                    </div>
                                    <span className="font-tajawal text-sm font-semibold">
                                        {t.name}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default TestimonialsSection;
