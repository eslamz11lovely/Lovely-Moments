import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Phone, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { getDatabase } from "../../services/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import HeartLoader from "../HeartLoader";

interface SiteSettings {
    siteName: string;
    adminEmail: string;
    adminPhone: string;
    whatsappLink: string;
    facebookLink: string;
    instagramLink: string;
    tiktokLink: string;
}

export const SettingsSection = () => {
    const [settings, setSettings] = useState<SiteSettings>({
        siteName: "Lovely Moments",
        adminEmail: "admin@lovelylink.com",
        adminPhone: "01093130120",
        whatsappLink: "",
        facebookLink: "",
        instagramLink: "",
        tiktokLink: "",
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const db = getDatabase();
                const docRef = doc(db, "settings", "general");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setSettings({ ...settings, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (field: keyof SiteSettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setMessage(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const db = getDatabase();
            await setDoc(doc(db, "settings", "general"), {
                ...settings,
                updatedAt: serverTimestamp()
            });

            setMessage({ text: "تم حفظ الإعدادات بنجاح!", type: "success" });

            // Auto hide message
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage({ text: "حدث خطأ أثناء حفظ الإعدادات", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <HeartLoader />
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">الإعدادات</h2>
                    <p className="text-slate-400">إدارة إعدادات الموقع وبيانات التواصل</p>
                </div>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center gap-3 ${message.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border border-red-500/20 text-red-400"
                        }`}
                >
                    {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="font-medium text-sm">{message.text}</p>
                </motion.div>
            )}

            <form onSubmit={handleSave} className="space-y-6">

                {/* ── General Info Card ──────────────────────── */}
                <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 md:p-8">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">📝</span>
                        معلومات أساسية
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Site Name */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-300">اسم الموقع</label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => handleChange("siteName", e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Lovely Moments"
                            />
                        </div>

                        {/* Admin Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-emerald-400" />
                                رقم الإدارة (واتساب)
                            </label>
                            <input
                                type="tel"
                                value={settings.adminPhone}
                                onChange={(e) => handleChange("adminPhone", e.target.value)}
                                dir="ltr"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-left"
                                placeholder="010XXXXXXXX"
                            />
                            <p className="text-xs text-slate-500 mt-1">يُستخدم لاستقبال الطلبات ورسائل الدعم</p>
                        </div>

                        {/* Admin Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-400" />
                                بريد الإدارة
                            </label>
                            <input
                                type="email"
                                value={settings.adminEmail}
                                onChange={(e) => handleChange("adminEmail", e.target.value)}
                                dir="ltr"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left"
                                placeholder="admin@example.com"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Social Links Card ──────────────────────── */}
                <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 md:p-8">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">🔗</span>
                        روابط التواصل الاجتماعي
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* WhatsApp Link */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">رابط واتساب المباشر</label>
                            <input
                                type="url"
                                value={settings.whatsappLink}
                                onChange={(e) => handleChange("whatsappLink", e.target.value)}
                                dir="ltr"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-left"
                                placeholder="https://wa.me/..."
                            />
                        </div>

                        {/* Facebook Link */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">رابط فيسبوك</label>
                            <input
                                type="url"
                                value={settings.facebookLink}
                                onChange={(e) => handleChange("facebookLink", e.target.value)}
                                dir="ltr"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left"
                                placeholder="https://facebook.com/..."
                            />
                        </div>

                        {/* Instagram Link */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">رابط انستجرام</label>
                            <input
                                type="url"
                                value={settings.instagramLink}
                                onChange={(e) => handleChange("instagramLink", e.target.value)}
                                dir="ltr"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-left"
                                placeholder="https://instagram.com/..."
                            />
                        </div>

                        {/* TikTok Link */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">رابط تيك توك</label>
                            <input
                                type="url"
                                value={settings.tiktokLink}
                                onChange={(e) => handleChange("tiktokLink", e.target.value)}
                                dir="ltr"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-left"
                                placeholder="https://tiktok.com/@..."
                            />
                        </div>
                    </div>
                </div>

                {/* ── Security / Submit ──────────────────────── */}
                <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex gap-4 items-start flex-1">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                            <Lock className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-base text-white font-bold mb-1">أمان النظام</p>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                                لتغيير بيانات تسجيل الدخول (كلمة السر والبريد)، يرجى التواصل مع فريق الدعم الفني حرصاً على حماية استقرار وأمان لوحة التحكم.
                            </p>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isSaving}
                        whileHover={!isSaving ? { scale: 1.02, boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" } : {}}
                        whileTap={!isSaving ? { scale: 0.98 } : {}}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto shadow-lg shadow-purple-500/20"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSaving ? "جاري الحفظ..." : "حفظ التغييرات الآن"}
                    </motion.button>
                </div>

            </form>
        </div>
    );
};

export default SettingsSection;
