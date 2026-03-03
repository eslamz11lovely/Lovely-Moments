import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { subscribeToSettings, type Announcement } from "../services/settingsService";

// ── Style presets ─────────────────────────────────────

const STYLES: Record<
    Announcement["style"],
    { bar: React.CSSProperties; shimmer: string; textClass: string }
> = {
    gradient: {
        bar: {
            background:
                "linear-gradient(90deg, hsl(340,82%,38%) 0%, hsl(280,68%,33%) 50%, hsl(340,82%,38%) 100%)",
        },
        shimmer: "from-transparent via-white/15 to-transparent",
        textClass: "text-white",
    },
    golden: {
        bar: {
            background:
                "linear-gradient(90deg, hsl(35,80%,33%) 0%, hsl(45,90%,40%) 50%, hsl(35,80%,33%) 100%)",
        },
        shimmer: "from-transparent via-yellow-100/20 to-transparent",
        textClass: "text-amber-100",
    },
    pink: {
        bar: {
            background:
                "linear-gradient(90deg, hsl(330,78%,36%) 0%, hsl(350,74%,44%) 50%, hsl(330,78%,36%) 100%)",
        },
        shimmer: "from-transparent via-pink-100/15 to-transparent",
        textClass: "text-pink-100",
    },
    blue: {
        bar: {
            background:
                "linear-gradient(90deg, hsl(220,80%,33%) 0%, hsl(200,85%,38%) 50%, hsl(220,80%,33%) 100%)",
        },
        shimmer: "from-transparent via-sky-100/15 to-transparent",
        textClass: "text-sky-100",
    },
    green: {
        bar: {
            background:
                "linear-gradient(90deg, hsl(150,60%,26%) 0%, hsl(160,65%,33%) 50%, hsl(150,60%,26%) 100%)",
        },
        shimmer: "from-transparent via-emerald-100/15 to-transparent",
        textClass: "text-emerald-100",
    },
};

// ── Marquee Track ─────────────────────────────────────
// Seamless RTL marquee — text scrolls LEFT → RIGHT (Arabic reading direction).
// Two identical halves animate together; jump-back is invisible.

const MarqueeTrack = ({
    announcement,
    textClass,
}: {
    announcement: Announcement;
    textClass: string;
}) => {
    // Speed: longer text → longer duration so it's always readable
    const duration = Math.max(20, announcement.text.length * 0.5);

    // One repeating unit
    const Unit = ({ idx }: { idx: number }) => (
        <span
            dir="rtl"
            className="inline-flex items-center gap-3 px-8 whitespace-nowrap flex-shrink-0"
            key={idx}
        >
            {/* Bouncing emoji */}
            <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
                className="text-base select-none"
            >
                {announcement.emoji}
            </motion.span>

            {/* Arabic text — RTL */}
            <span dir="rtl" className={`text-xs sm:text-sm font-cairo font-medium ${textClass}`}>
                {announcement.text}
            </span>

            {/* Optional CTA */}
            {announcement.link && announcement.linkLabel && (
                <a
                    href={announcement.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-xs font-cairo font-bold underline underline-offset-2 ${textClass} opacity-90 hover:opacity-100 transition-opacity`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {announcement.linkLabel}
                    <ExternalLink className="w-3 h-3" />
                </a>
            )}

            {/* Separator */}
            <span className={`opacity-25 select-none ${textClass}`}>❤️</span>
        </span>
    );

    /*
     * ✅ GAPLESS RTL marquee — scrolls LEFT → RIGHT for Arabic:
     *
     *  We render TWO identical halves inside a flex wrapper.
     *  The CSS animation slides from translateX(0%) → translateX(50%).
     *  Because both halves are identical, the jump-back is invisible.
     *
     *  We use 6 Units per half (12 total) so even very short text on
     *  small mobile screens never leaves the bar empty.
     */
    const REPEATS = 6;

    const marqueeKeyframes = `
@keyframes announcement-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(50%); }
}`;

    return (
        <>
            <style>{marqueeKeyframes}</style>
            <div className="overflow-hidden w-full">
                <div
                    style={{
                        display: "flex",
                        width: "max-content",
                        animation: `announcement-scroll ${duration}s linear infinite`,
                    }}
                >
                    {/* First half */}
                    {Array.from({ length: REPEATS }, (_, i) => (
                        <Unit key={`a-${i}`} idx={i} />
                    ))}
                    {/* Second half — identical clone */}
                    {Array.from({ length: REPEATS }, (_, i) => (
                        <Unit key={`b-${i}`} idx={i} />
                    ))}
                </div>
            </div>
        </>
    );
};

// ── Main Component ────────────────────────────────────

const AnnouncementBar = () => {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);

    useEffect(() => {
        const unsub = subscribeToSettings((settings) => {
            const ann = settings?.announcement;
            setAnnouncement(ann?.enabled && ann?.text?.trim() ? ann : null);
        });
        return () => unsub();
    }, []);

    const preset = STYLES[announcement?.style ?? "gradient"];

    return (
        <AnimatePresence>
            {announcement && (
                <motion.div
                    key="announcement-bar"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden relative"
                    style={preset.bar}
                >
                    {/* Shimmer sweep */}
                    <motion.div
                        className={`absolute inset-0 w-1/3 pointer-events-none bg-gradient-to-r ${preset.shimmer}`}
                        animate={{ x: ["-100%", "400%"] }}
                        transition={{
                            duration: 2.8,
                            repeat: Infinity,
                            ease: "linear",
                            repeatDelay: 2,
                        }}
                    />

                    {/* Scrolling text */}
                    <div className="py-2.5 relative">
                        <MarqueeTrack announcement={announcement} textClass={preset.textClass} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AnnouncementBar;
