import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getSiteSettings, SiteSettings } from "../services/settingsService";

const TikTokSection = () => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        getSiteSettings().then(setSettings);
    }, []);

    const tiktokLink = settings?.tiktokLink || "https://tiktok.com/";

    return (
        <section className="py-24 px-4 relative overflow-hidden">
            <div className="max-w-3xl mx-auto relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="glass-card rounded-[2rem] p-10 md:p-14"
                    style={{
                        border: "1px solid hsla(340,82%,62%,0.2)",
                        boxShadow: "0 20px 60px hsla(0,0%,0%,0.15)",
                    }}
                >
                    {/* Top shimmer line */}
                    <div
                        className="absolute top-0 left-8 right-8 h-px rounded-full"
                        style={{ background: "var(--gradient-primary)", opacity: 0.6 }}
                    />

                    {/* TikTok Icon Animation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-20 h-20 mx-auto bg-gradient-to-br from-[#25F4EE] via-[#FE2C55] to-[#000000] rounded-full p-[2px] mb-8"
                    >
                        <div className="w-full h-full bg-background rounded-full flex items-center justify-center relative overflow-hidden group hover:bg-[#FE2C55] transition-colors duration-500">
                            <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-10 h-10 group-hover:text-white transition-colors duration-500"
                            >
                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.28 6.28 0 005.4 15.6a6.28 6.28 0 006.28 6.28A6.27 6.27 0 0018 15.6V9.24a8.16 8.16 0 004.77 1.52v-3.4H22.7a5.57 5.57 0 01-3.11-.67z" />
                            </svg>
                        </div>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-3xl md:text-5xl font-bold font-tajawal mb-5 leading-tight"
                    >
                        شاهد <span className="gradient-text">أعمالنا</span> على التيك توك 📱
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="text-muted-foreground text-base md:text-lg mb-10 font-cairo leading-relaxed max-w-lg mx-auto"
                    >
                        تابعنا عشان تشوف التفاصيل والكواليس وتستلهم أفكار جديدة لهديتك الجاية! ✨
                    </motion.p>

                    <motion.a
                        href={tiktokLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="inline-flex items-center gap-3 font-bold font-tajawal text-lg md:text-xl px-12 py-5 rounded-[1.5rem] text-white overflow-hidden"
                        style={{
                            background: "linear-gradient(90deg, #FE2C55, #25F4EE)",
                            boxShadow: "0 8px 15px rgba(0,0,0,0.1)",
                        }}
                    >
                        تابعنا الآن
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
};

export default TikTokSection;
