import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, Phone, Mail, Lock, CheckCircle2, AlertCircle, Megaphone, ToggleLeft, ToggleRight, Eye } from "lucide-react";
import { getDatabase } from "../../services/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import HeartLoader from "../HeartLoader";
import { type Announcement, DEFAULT_ANNOUNCEMENT } from "../../services/settingsService";

interface SiteSettings {
    siteName: string;
    adminEmail: string;
    adminPhone: string;
    whatsappLink: string;
    facebookLink: string;
    instagramLink: string;
    tiktokLink: string;
    announcement?: Announcement;
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
    const [isSavingAnn, setIsSavingAnn] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);
    const [ann, setAnn] = useState<Announcement>(DEFAULT_ANNOUNCEMENT);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const db = getDatabase();
                const docRef = doc(db, "settings", "general");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSettings({ ...settings, ...data });
                    if (data.announcement) setAnn(data.announcement);
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
                announcement: ann,
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

                {/* ══ Announcement Bar Card ════════════════ */}
                <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 md:p-8">
                    <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                <Megaphone className="w-4 h-4 text-orange-400" />
                            </span>
                            شريط الإعلانات
                            {ann.enabled && (
                                <span className="text-[11px] font-cairo font-normal bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                                    نشط الآن
                                </span>
                            )}
                        </h3>

                        {/* Enable / Disable Toggle */}
                        <button
                            type="button"
                            onClick={() => setAnn(p => ({ ...p, enabled: !p.enabled }))}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-cairo font-medium transition-all ${ann.enabled
                                    ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
                                    : "bg-slate-700/40 border-slate-600/40 text-slate-400 hover:text-slate-300"
                                }`}
                        >
                            {ann.enabled
                                ? <><ToggleRight className="w-4 h-4" /> الشريط مفعّل</>
                                : <><ToggleLeft className="w-4 h-4" /> الشريط معطّل</>}
                        </button>
                    </div>

                    <div className={`space-y-5 transition-opacity duration-300 ${ann.enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>

                        {/* Text */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300">نص الإعلان</label>
                            <textarea
                                rows={2}
                                value={ann.text}
                                onChange={e => setAnn(p => ({ ...p, text: e.target.value }))}
                                placeholder="مثال: عيد الأم قرب — احجز هديتك الآن واستمتع بخصم خاص لمدة محدودة 🌸"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white text-sm font-cairo resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Emoji */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-300">إيموجي (emoji)</label>
                                <input
                                    type="text"
                                    value={ann.emoji}
                                    onChange={e => setAnn(p => ({ ...p, emoji: e.target.value }))}
                                    placeholder="🎉"
                                    maxLength={4}
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white text-center text-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                                />
                            </div>

                            {/* Style */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-300">لون الشريط</label>
                                <div className="flex gap-2 flex-wrap">
                                    {([
                                        { key: "gradient", label: "بنفسجي", bg: "bg-gradient-to-r from-pink-700 to-purple-700" },
                                        { key: "golden", label: "ذهبي", bg: "bg-gradient-to-r from-yellow-700 to-amber-600" },
                                        { key: "pink", label: "وردي", bg: "bg-gradient-to-r from-pink-700 to-rose-600" },
                                        { key: "blue", label: "أزرق", bg: "bg-gradient-to-r from-blue-700 to-sky-600" },
                                        { key: "green", label: "أخضر", bg: "bg-gradient-to-r from-emerald-800 to-teal-700" },
                                    ] as const).map(s => (
                                        <button
                                            key={s.key}
                                            type="button"
                                            onClick={() => setAnn(p => ({ ...p, style: s.key }))}
                                            className={`${s.bg} text-white text-xs font-cairo px-3 py-1.5 rounded-lg transition-all ${ann.style === s.key ? "ring-2 ring-white/60 scale-105" : "opacity-60 hover:opacity-80"
                                                }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Optional Link */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-slate-500 font-cairo">رابط اختياري (CTA)</label>
                                <input
                                    type="url"
                                    value={ann.link || ""}
                                    onChange={e => setAnn(p => ({ ...p, link: e.target.value }))}
                                    dir="ltr"
                                    placeholder="https://..."
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all text-left"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-slate-500 font-cairo">نص الزر (CTA label)</label>
                                <input
                                    type="text"
                                    value={ann.linkLabel || ""}
                                    onChange={e => setAnn(p => ({ ...p, linkLabel: e.target.value }))}
                                    placeholder="احجز الآن ←"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                                />
                            </div>
                        </div>

                        {/* Live Preview */}
                        {ann.text && (
                            <div className="space-y-1.5">
                                <p className="text-xs text-slate-500 font-cairo flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> معاينة مباشرة:
                                </p>
                                <div
                                    className="relative overflow-hidden rounded-xl py-2 px-10 text-white text-center text-xs font-cairo"
                                    style={{
                                        background: ann.style === "gradient" ? "linear-gradient(90deg,hsl(340,82%,40%),hsl(280,70%,35%),hsl(340,82%,40%))" :
                                            ann.style === "golden" ? "linear-gradient(90deg,hsl(35,80%,35%),hsl(45,90%,40%),hsl(35,80%,35%))" :
                                                ann.style === "pink" ? "linear-gradient(90deg,hsl(330,80%,38%),hsl(350,75%,45%),hsl(330,80%,38%))" :
                                                    ann.style === "blue" ? "linear-gradient(90deg,hsl(220,80%,35%),hsl(200,85%,40%),hsl(220,80%,35%))" :
                                                        "linear-gradient(90deg,hsl(150,60%,28%),hsl(160,65%,35%),hsl(150,60%,28%))"
                                    }}
                                >
                                    {ann.emoji} {ann.text} {ann.linkLabel && <span className="underline ml-1">{ann.linkLabel}</span>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Save Announcement */}
                    <div className="flex justify-end mt-5">
                        <button
                            type="button"
                            disabled={isSavingAnn}
                            onClick={async () => {
                                setIsSavingAnn(true);
                                try {
                                    const db = getDatabase();
                                    await setDoc(doc(db, "settings", "general"), {
                                        ...settings,
                                        announcement: ann,
                                        updatedAt: serverTimestamp()
                                    }, { merge: true });
                                    setMessage({ text: "✅ تم حفظ شريط الإعلان بنجاح!", type: "success" });
                                    setTimeout(() => setMessage(null), 3000);
                                } catch { setMessage({ text: "حدث خطأ!", type: "error" }); }
                                finally { setIsSavingAnn(false); }
                            }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-tajawal font-semibold rounded-xl transition-all disabled:opacity-50 text-sm"
                        >
                            {isSavingAnn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                            حفظ الإعلان
                        </button>
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
