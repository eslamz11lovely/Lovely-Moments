import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 300);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollUp = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    key="scroll-top"
                    onClick={scrollUp}
                    aria-label="العودة لأعلى"
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    whileHover={{ scale: 1.12, y: -3 }}
                    whileTap={{ scale: 0.92 }}
                    className="fixed z-50 bottom-24 left-4 md:bottom-8 md:left-6 w-11 h-11 rounded-full flex items-center justify-center"
                    style={{
                        background: "var(--glass-bg)",
                        border: "1px solid hsla(340,82%,62%,0.35)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        boxShadow:
                            "0 0 18px hsla(340,82%,62%,0.3), 0 4px 16px hsla(0,0%,0%,0.3)",
                    }}
                >
                    {/* Subtle inner glow ring */}
                    <motion.span
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{ border: "1px solid hsla(340,82%,62%,0.2)" }}
                        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.08, 1] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <ArrowUp
                        size={18}
                        style={{ color: "hsl(340,82%,62%)" }}
                        strokeWidth={2.2}
                    />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTop;
