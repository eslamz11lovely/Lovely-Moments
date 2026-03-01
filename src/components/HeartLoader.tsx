import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface HeartLoaderProps {
    text?: string;
    className?: string;
    heartClassName?: string;
    textClassName?: string;
}

export const HeartLoader = ({
    text = "جاري التحميل...",
    className = "",
    heartClassName = "w-14 h-14",
    textClassName = "text-sm mt-6"
}: HeartLoaderProps) => {
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                }}
                transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative flex items-center justify-center"
            >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-pink-500/30 blur-2xl rounded-full scale-150 animate-pulse" />

                {/* Heart icon */}
                <Heart className={`${heartClassName} text-pink-500 fill-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] relative z-10`} />
            </motion.div>

            {text && (
                <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className={`text-pink-400 font-medium tracking-widest ${textClassName}`}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
};

export default HeartLoader;
