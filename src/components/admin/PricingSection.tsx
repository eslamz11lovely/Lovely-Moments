import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Save, Loader2, CheckCircle } from "lucide-react";
import { Pricing, getPricing, updatePricing, createInitialPricing } from "../../services/pricingService";
import HeartLoader from "../HeartLoader";

export const PricingSection = () => {
    const [pricing, setPricing] = useState<Pricing>({
        basic: 0,
        medium: 0,
        premium: 0,
        updatedAt: new Date(),
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [localPrices, setLocalPrices] = useState({
        basic: "",
        medium: "",
        premium: "",
    });

    const fetchPricing = async () => {
        try {
            setIsLoading(true);
            // Create initial pricing if not exists
            await createInitialPricing();

            const data = await getPricing();
            if (data) {
                setPricing(data);
                setLocalPrices({
                    basic: data.basic?.toString() || "",
                    medium: data.medium?.toString() || "",
                    premium: data.premium?.toString() || "",
                });
            }
        } catch (error) {
            console.error("Error fetching pricing:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPricing();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updatePricing({
                basic: Number(localPrices.basic) || 0,
                medium: Number(localPrices.medium) || 0,
                premium: Number(localPrices.premium) || 0,
            });

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);

            await fetchPricing();
        } catch (error) {
            console.error("Error updating pricing:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setLocalPrices((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <HeartLoader />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">التحكم في الأسعار</h2>
                    <p className="text-slate-400">تحديث أسعار الباقات</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">العملة: الجنيه المصري</span>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Package */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-blue-400 font-bold">B</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold">باقة الويب البسيطة</h3>
                            <p className="text-slate-400 text-sm">Basic Package</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-slate-400 text-sm">السعر (جنيه)</label>
                        <input
                            type="number"
                            value={localPrices.basic}
                            onChange={(e) => handleInputChange("basic", e.target.value)}
                            placeholder="أدخل السعر"
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <p className="text-blue-400 text-sm">
                            السعر الحالي: <span className="font-bold">{pricing.basic} جنيه</span>
                        </p>
                    </div>
                </motion.div>

                {/* Medium Package */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-purple-400 font-bold">M</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold">باقة الويب المتوسطة</h3>
                            <p className="text-slate-400 text-sm">Medium Package</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-slate-400 text-sm">السعر (جنيه)</label>
                        <input
                            type="number"
                            value={localPrices.medium}
                            onChange={(e) => handleInputChange("medium", e.target.value)}
                            placeholder="أدخل السعر"
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="mt-4 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <p className="text-purple-400 text-sm">
                            السعر الحالي: <span className="font-bold">{pricing.medium} جنيه</span>
                        </p>
                    </div>
                </motion.div>

                {/* Premium Package */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-pink-400 font-bold">P</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold">باقة الويب الشاملة</h3>
                            <p className="text-slate-400 text-sm">Premium Package</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-slate-400 text-sm">السعر (جنيه)</label>
                        <input
                            type="number"
                            value={localPrices.premium}
                            onChange={(e) => handleInputChange("premium", e.target.value)}
                            placeholder="أدخل السعر"
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="mt-4 p-3 bg-pink-500/10 rounded-xl border border-pink-500/20">
                        <p className="text-pink-400 text-sm">
                            السعر الحالي: <span className="font-bold">{pricing.premium} جنيه</span>
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            حفظ الأسعار
                        </>
                    )}
                </motion.button>
            </div>

            {/* Success Animation */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 bg-green-500/90 backdrop-blur-xl rounded-xl shadow-lg"
                    >
                        <CheckCircle className="w-6 h-6 text-white" />
                        <span className="text-white font-medium">تم حفظ الأسعار بنجاح!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info */}
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <p className="text-slate-400 text-sm">
                    💡 ملاحظة: تغيير الأسعار هنا سيؤثر مباشرة على صفحة الأسعار في الموقع الرئيسي.
                </p>
            </div>
        </div>
    );
};

export default PricingSection;
