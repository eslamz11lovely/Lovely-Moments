// NotificationBanner - Beautiful notification activation banner for Admin Dashboard
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, BellRing, Volume2, VolumeX, X, Check, AlertTriangle } from "lucide-react";
import { useOrderNotifications } from "../../hooks/useOrderNotifications";

export const NotificationBanner = () => {
    const {
        status,
        showBanner,
        soundEnabled,
        enableNotifications,
        handleDisable,
        toggleSound,
        dismissBanner,
    } = useOrderNotifications();

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleEnable = async () => {
        setIsLoading(true);
        setErrorMsg(null);

        const error = await enableNotifications();
        if (error) {
            setErrorMsg(error);
        }
        setIsLoading(false);
    };

    // ── Enabled State: Compact status bar with controls ──────
    if (status === "enabled") {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 relative overflow-hidden rounded-2xl p-[1px]"
            >
                {/* Border gradient */}
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-green-500/20 to-emerald-500/30" />

                <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
                    {/* Status indicator */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center ring-1 ring-emerald-500/20">
                                <BellRing className="w-4 h-4 text-emerald-400" />
                            </div>
                            {/* Pulse animation */}
                            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-300">
                                الإشعارات مفعّلة
                            </p>
                            <p className="text-xs text-slate-500">
                                سيتم تنبيهك عند وصول طلبات جديدة
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {/* Sound Toggle */}
                        <button
                            onClick={toggleSound}
                            className={`p-2 rounded-lg transition-all duration-200 ${soundEnabled
                                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                    : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                                }`}
                            title={soundEnabled ? "كتم صوت الإشعار" : "تشغيل صوت الإشعار"}
                        >
                            {soundEnabled ? (
                                <Volume2 className="w-4 h-4" />
                            ) : (
                                <VolumeX className="w-4 h-4" />
                            )}
                        </button>

                        {/* Disable */}
                        <button
                            onClick={handleDisable}
                            className="p-2 rounded-lg bg-slate-800 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                            title="إيقاف الإشعارات"
                        >
                            <BellOff className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // ── Denied State ─────────────────────────────────────────
    if (status === "denied") {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 relative overflow-hidden rounded-2xl p-[1px]"
            >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-amber-500/30" />
                <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center ring-1 ring-amber-500/20 shrink-0">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-sm text-amber-300">
                        تم حظر الإشعارات من المتصفح. للتفعيل، اضغط على أيقونة القفل بجانب الرابط في الأعلى واسمح بالإشعارات.
                    </p>
                </div>
            </motion.div>
        );
    }

    // ── Banner: Activation prompt ────────────────────────────
    if (!showBanner) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
                className="mb-6 relative overflow-hidden rounded-2xl p-[1px]"
            >
                {/* Animated border gradient */}
                <span className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-pink-500/30 to-purple-500/40 animate-pulse" />

                <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl p-5">
                    {/* Close button */}
                    <button
                        onClick={dismissBanner}
                        className="absolute top-3 left-3 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all duration-200"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Icon */}
                        <div className="relative shrink-0">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center ring-1 ring-purple-500/30">
                                <Bell className="w-7 h-7 text-purple-400" />
                            </div>
                            {/* Decorative sparkle */}
                            <motion.div
                                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="absolute -top-1 -left-1 w-4 h-4 text-yellow-400"
                            >
                                ✨
                            </motion.div>
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-white mb-1">
                                تفعيل إشعارات الطلبات الجديدة 🔔
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                فعّل الإشعارات ليصلك تنبيه فوري على سطح المكتب عند استلام أي طلب جديد. لن يفوتك أي طلب!
                            </p>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleEnable}
                            disabled={isLoading}
                            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        >
                            {isLoading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                    <span>جاري التفعيل...</span>
                                </>
                            ) : (
                                <>
                                    <Bell className="w-4 h-4" />
                                    <span>تفعيل الإشعارات</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Error message */}
                    <AnimatePresence>
                        {errorMsg && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2"
                            >
                                ⚠️ {errorMsg}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NotificationBanner;
