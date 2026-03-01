import { motion } from "framer-motion";

const features = [
    {
        icon: "✍️",
        title: "تصميم باسم الشخص",
        description: "كل هدية بتتصمم خصيصاً بالاسم اللي تختاره، بأسلوب بصري راقي ومميز.",
        color: "hsla(340,82%,62%,0.15)",
        border: "hsla(340,82%,62%,0.2)",
    },
    {
        icon: "🎙️",
        title: "رسالة خاصة بصوتك أو كلماتك",
        description: "سجّل صوتك أو اكتب من قلبك — وإحنا نحوّلها لتجربة ما حدش هيقدر ينساها.",
        color: "hsla(270,60%,55%,0.15)",
        border: "hsla(270,60%,55%,0.2)",
    },
    {
        icon: "🎬",
        title: "صور وفيديوهات وأغاني",
        description: "أضف الصور المفضلة، الأغاني، والفيديوهات اللي بتحكي قصتكم بشكل سينمائي.",
        color: "hsla(350,70%,50%,0.15)",
        border: "hsla(350,70%,50%,0.2)",
    },
];

const WhatWeDoSection = () => (
    <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">

            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold text-center mb-4 font-tajawal"
            >
                🛠️ بنعمل إيه؟
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center text-muted-foreground max-w-xl mx-auto mb-12 font-cairo text-sm leading-relaxed"
            >
                بنصمم هدايا رقمية شخصية ومميزة لكل المناسبات 🎂🤝🎉💑❤️
                <br />
                تجربة كاملة مش مجرد رسالة.
            </motion.p>

            <div className="grid md:grid-cols-3 gap-5">
                {features.map((f, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.45, delay: idx * 0.12, ease: "easeOut" }}
                        className="glass-card rounded-2xl p-6 flex flex-col gap-3 cursor-default group hover:-translate-y-1 transition-transform duration-300"
                        style={{
                            background: f.color,
                            border: `1px solid ${f.border}`,
                        }}
                    >
                        <span className="text-3xl">{f.icon}</span>
                        <h3 className="text-base font-bold font-tajawal">{f.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-cairo">
                            {f.description}
                        </p>
                        {/* Hover accent line — GPU Optimized: using transform scaleX instead of width */}
                        <div
                            className="h-[1px] w-full scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-500 ease-out rounded-full"
                            style={{ background: "var(--gradient-primary)" }}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

export default WhatWeDoSection;
