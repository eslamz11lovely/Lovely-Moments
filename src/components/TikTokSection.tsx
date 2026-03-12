import { useState, useEffect } from "react";
import { getSiteSettings, SiteSettings } from "../services/settingsService";

const TikTokSection = () => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        getSiteSettings().then(setSettings);
    }, []);

    const tiktokLink = settings?.tiktokLink || "https://tiktok.com/";

    return (
        <section className="py-24 px-4">
            <div className="max-w-5xl mx-auto text-center">
                <div className="mb-8">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#25F4EE] via-[#FE2C55] to-[#000000] rounded-full p-[2px] mb-6">
                        <div className="w-full h-full bg-background rounded-full flex items-center justify-center group hover:bg-[#FE2C55] transition-colors duration-500">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 group-hover:text-white transition-colors duration-500">
                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.28 6.28 0 005.4 15.6a6.28 6.28 0 006.28 6.28A6.27 6.27 0 0018 15.6V9.24a8.16 8.16 0 004.77 1.52v-3.4H22.7a5.57 5.57 0 01-3.11-.67z" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold font-tajawal mb-4">
                        شاهد <span className="gradient-text">أعمالنا</span> على التيك توك 📱
                    </h2>
                    <p className="text-muted-foreground text-base md:text-lg font-cairo max-w-lg mx-auto">
                        تابعنا عشان تشوف التفاصيل والكواليس وتستلهم أفكار جديدة لهديتك الجاية! ✨
                    </p>
                </div>

                <a
                    href={tiktokLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 font-bold font-tajawal text-lg md:text-xl px-10 py-4 rounded-full text-white transition-opacity duration-300 hover:opacity-90"
                    style={{ background: "linear-gradient(90deg, #FE2C55, #25F4EE)" }}
                >
                    تابعنا الآن
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </a>
            </div>
        </section>
    );
};

export default TikTokSection;
