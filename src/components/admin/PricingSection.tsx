import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DollarSign, Save, Loader2, CheckCircle,
    Tag, Percent, Calendar, ToggleLeft, ToggleRight, X, Zap
} from "lucide-react";
import {
    Pricing, Discount,
    getPricing, updatePricing, updateDiscount,
    createInitialPricing, DEFAULT_DISCOUNT,
    calcDiscountedPrice, isDiscountActive
} from "../../services/pricingService";
import HeartLoader from "../HeartLoader";

// ── Styled input ──────────────────────────────────────

const Field = ({
    label, value, onChange, type = "text", placeholder = "", accent = "purple", prefix
}: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; accent?: string; prefix?: string;
}) => (
    <div className="space-y-1.5">
        <label className="text-xs text-slate-400 font-cairo">{label}</label>
        <div className="relative">
            {prefix && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-cairo">
                    {prefix}
                </span>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 ${prefix ? "pr-10" : ""} bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-${accent}-500/40 focus:border-${accent}-500/40 transition-all font-cairo`}
            />
        </div>
    </div>
);

// ── Main Component ─────────────────────────────────────

export const PricingSection = () => {
    const [pricing, setPricing] = useState<Pricing>({
        basic: 0, medium: 0, premium: 0,
        discount: DEFAULT_DISCOUNT,
        updatedAt: new Date(),
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingPrices, setIsSavingPrices] = useState(false);
    const [isSavingDiscount, setIsSavingDiscount] = useState(false);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);

    const [localPrices, setLocalPrices] = useState({ basic: "", medium: "", premium: "" });
    const [localDiscount, setLocalDiscount] = useState<Discount>(DEFAULT_DISCOUNT);

    const flash = (msg: string) => {
        setShowSuccess(msg);
        setTimeout(() => setShowSuccess(null), 3000);
    };

    const fetchPricing = async () => {
        try {
            setIsLoading(true);
            await createInitialPricing();
            const data = await getPricing();
            if (data) {
                setPricing(data);
                setLocalPrices({
                    basic: data.basic?.toString() || "",
                    medium: data.medium?.toString() || "",
                    premium: data.premium?.toString() || "",
                });
                setLocalDiscount(data.discount ?? DEFAULT_DISCOUNT);
            }
        } catch (error) {
            console.error("Error fetching pricing:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchPricing(); }, []);

    const handleSavePrices = async () => {
        setIsSavingPrices(true);
        try {
            await updatePricing({
                basic: Number(localPrices.basic) || 0,
                medium: Number(localPrices.medium) || 0,
                premium: Number(localPrices.premium) || 0,
                discount: pricing.discount,
            });
            flash("✅ تم حفظ الأسعار بنجاح!");
            await fetchPricing();
        } catch (error) {
            console.error("Error updating pricing:", error);
        } finally {
            setIsSavingPrices(false);
        }
    };

    const handleSaveDiscount = async () => {
        setIsSavingDiscount(true);
        try {
            await updateDiscount(localDiscount);
            flash("✅ تم حفظ الخصم بنجاح!");
            await fetchPricing();
        } catch (error) {
            console.error("Error updating discount:", error);
        } finally {
            setIsSavingDiscount(false);
        }
    };

    const discountActive = isDiscountActive(localDiscount);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <HeartLoader />
            </div>
        );
    }

    const packages = [
        { key: "basic", label: "الباقة البسيطة", color: "blue", letter: "B" },
        { key: "medium", label: "الباقة المتوسطة", color: "purple", letter: "M" },
        { key: "premium", label: "الباقة الشاملة", color: "pink", letter: "P" },
    ];

    return (
        <div className="space-y-8" dir="rtl">

            {/* ── Page Header ── */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-600/10 border border-green-500/30 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                    <h2 className="text-xl font-tajawal font-bold text-white">التحكم في الأسعار</h2>
                    <p className="text-xs text-slate-400 font-cairo">تحديث أسعار الباقات والخصومات</p>
                </div>
            </div>

            {/* ════════════════════════════════════════
                Section 1 — Package Prices
            ════════════════════════════════════════ */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-6 space-y-5">
                <h3 className="text-white font-tajawal font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    أسعار الباقات
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {packages.map((pkg) => {
                        const currentPrice = (pricing as any)[pkg.key] as number;
                        const discountedPrice = calcDiscountedPrice(currentPrice, pricing.discount);
                        const hasDiscount = isDiscountActive(pricing.discount) && discountedPrice !== currentPrice;

                        return (
                            <motion.div
                                key={pkg.key}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4 space-y-3"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 bg-${pkg.color}-500/20 rounded-lg flex items-center justify-center`}>
                                        <span className={`text-${pkg.color}-400 font-bold text-sm`}>{pkg.letter}</span>
                                    </div>
                                    <span className="font-tajawal text-sm font-semibold text-white">{pkg.label}</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-cairo">السعر الأصلي (جنيه)</label>
                                    <input
                                        type="number"
                                        value={(localPrices as any)[pkg.key]}
                                        onChange={(e) => setLocalPrices((p) => ({ ...p, [pkg.key]: e.target.value }))}
                                        placeholder="0"
                                        className={`w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-${pkg.color}-500/40 transition-all font-cairo`}
                                    />
                                </div>

                                {/* Price preview */}
                                <div className={`p-2.5 rounded-lg ${hasDiscount ? "bg-green-500/10 border border-green-500/20" : `bg-${pkg.color}-500/10 border border-${pkg.color}-500/20`}`}>
                                    {hasDiscount ? (
                                        <div className="space-y-0.5">
                                            <p className="text-slate-400 text-xs line-through font-cairo">{currentPrice} جنيه</p>
                                            <p className="text-green-400 font-bold text-sm font-tajawal">{discountedPrice} جنيه</p>
                                            <span className="text-[10px] text-green-400/70 font-cairo">وفرت {currentPrice - discountedPrice} جنيه</span>
                                        </div>
                                    ) : (
                                        <p className={`text-${pkg.color}-400 text-sm font-bold font-tajawal`}>{currentPrice} جنيه</p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSavePrices}
                        disabled={isSavingPrices}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-tajawal font-semibold rounded-xl transition-all disabled:opacity-50 text-sm"
                    >
                        {isSavingPrices ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        حفظ الأسعار
                    </button>
                </div>
            </div>

            {/* ════════════════════════════════════════
                Section 2 — Discount Settings
            ════════════════════════════════════════ */}
            <div className={`border rounded-2xl p-6 space-y-5 transition-all duration-300 ${discountActive
                ? "bg-gradient-to-br from-orange-500/10 to-red-500/5 border-orange-500/30"
                : "bg-slate-800/30 border-slate-700/40"
                }`}>

                {/* Discount Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <h3 className="text-white font-tajawal font-semibold flex items-center gap-2">
                        <Tag className="w-4 h-4 text-orange-400" />
                        إعدادات الخصم
                        {discountActive && (
                            <span className="text-[11px] font-cairo font-normal bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                                نشط الآن
                            </span>
                        )}
                    </h3>

                    {/* Toggle */}
                    <button
                        onClick={() => setLocalDiscount((p) => ({ ...p, enabled: !p.enabled }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-cairo font-medium transition-all ${localDiscount.enabled
                            ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
                            : "bg-slate-700/40 border-slate-600/40 text-slate-400 hover:text-slate-300"
                            }`}
                    >
                        {localDiscount.enabled
                            ? <><ToggleRight className="w-4 h-4" /> الخصم مفعّل</>
                            : <><ToggleLeft className="w-4 h-4" /> الخصم معطّل</>
                        }
                    </button>
                </div>

                {/* Discount Fields */}
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity duration-300 ${localDiscount.enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>

                    {/* Percentage */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-cairo flex items-center gap-1">
                            <Percent className="w-3 h-3" /> نسبة الخصم (%)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min={1} max={99}
                                value={localDiscount.percentage}
                                onChange={(e) => setLocalDiscount((p) => ({ ...p, percentage: Number(e.target.value) }))}
                                placeholder="20"
                                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all font-cairo"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-sm">%</span>
                        </div>
                        {localDiscount.percentage > 0 && (
                            <p className="text-[11px] text-orange-400/70 font-cairo">
                                مثال: السعر 500 جنيه → {Math.round(500 * (1 - localDiscount.percentage / 100))} جنيه
                            </p>
                        )}
                    </div>

                    {/* Label */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-cairo flex items-center gap-1">
                            <Tag className="w-3 h-3" /> اسم العرض
                        </label>
                        <input
                            type="text"
                            value={localDiscount.label}
                            onChange={(e) => setLocalDiscount((p) => ({ ...p, label: e.target.value }))}
                            placeholder="مثال: عرض عيد الأم 🌸"
                            className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all font-cairo"
                        />
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-cairo flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> تاريخ انتهاء العرض
                            <span className="text-slate-600">(اختياري)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="datetime-local"
                                value={localDiscount.expiresAt || ""}
                                onChange={(e) => setLocalDiscount((p) => ({ ...p, expiresAt: e.target.value || null }))}
                                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all font-cairo"
                            />
                            {localDiscount.expiresAt && (
                                <button
                                    onClick={() => setLocalDiscount((p) => ({ ...p, expiresAt: null }))}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-3 h-3 text-slate-400" />
                                </button>
                            )}
                        </div>
                        {localDiscount.expiresAt && (
                            <p className="text-[11px] text-slate-500 font-cairo">
                                ينتهي: {new Date(localDiscount.expiresAt).toLocaleString("ar-EG")}
                            </p>
                        )}
                    </div>
                </div>

                {/* Live Preview */}
                {localDiscount.enabled && localDiscount.percentage > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4"
                    >
                        <p className="text-xs text-orange-400/80 font-cairo font-semibold mb-3 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" /> معاينة مباشرة للخصم:
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            {packages.map((pkg) => {
                                const orig = Number((localPrices as any)[pkg.key]) || (pricing as any)[pkg.key];
                                const discounted = Math.round(orig * (1 - localDiscount.percentage / 100));
                                return (
                                    <div key={pkg.key} className="text-center">
                                        <p className="text-[11px] text-slate-400 font-cairo">{pkg.label}</p>
                                        <p className="text-slate-500 line-through text-xs font-cairo">{orig} ج</p>
                                        <p className="text-orange-400 font-bold font-tajawal">{discounted} ج</p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={handleSaveDiscount}
                        disabled={isSavingDiscount}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-tajawal font-semibold rounded-xl transition-all disabled:opacity-50 text-sm"
                    >
                        {isSavingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                        حفظ الخصم
                    </button>
                </div>
            </div>

            {/* Note */}
            <div className="bg-slate-800/20 rounded-xl p-4 border border-slate-700/20">
                <p className="text-slate-500 text-xs font-cairo">
                    💡 تغيير الأسعار والخصم سيؤثر مباشرةً على صفحة الأسعار في الموقع. الخصم يُطبَّق تلقائياً على جميع الباقات.
                    إذا حددت تاريخ انتهاء، سينتهي الخصم تلقائياً عند انقضاء الوقت.
                </p>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 60 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3.5 bg-green-500/90 backdrop-blur-xl rounded-xl shadow-lg z-50"
                    >
                        <CheckCircle className="w-5 h-5 text-white" />
                        <span className="text-white font-cairo text-sm">{showSuccess}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PricingSection;
