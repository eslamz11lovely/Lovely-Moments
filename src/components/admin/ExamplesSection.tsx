import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Trash2,
    Eye,
    EyeOff,
    X,
    Plus,
    Loader2,
    CheckCircle,
    Edit,
    Image as ImageIcon,
    ExternalLink,
    Star,
    ArrowUpDown,
    Upload,
    AlertTriangle,
    GripVertical,
} from "lucide-react";
import {
    LiveExample,
    LiveExampleInput,
    subscribeToExamples,
    addExample,
    updateExample,
    deleteExample,
    toggleExampleVisibility,
    toggleExampleFeatured,
    uploadImage,
} from "../../services/examplesService";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ─── Helpers ────────────────────────────────────────

const formatDate = (timestamp: any): string => {
    if (!timestamp) return "غير محدد";
    if (timestamp instanceof Date) return timestamp.toLocaleDateString("ar-SA");
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleDateString("ar-SA");
    return "غير محدد";
};

// ─── Animated Toggle ────────────────────────────────

interface AnimatedToggleProps {
    enabled: boolean;
    onChange: () => void;
    enabledLabel: string;
    disabledLabel: string;
    enabledColor?: string;
}

const AnimatedToggle = ({ enabled, onChange, enabledLabel, disabledLabel, enabledColor = "bg-emerald-500" }: AnimatedToggleProps) => (
    <button
        type="button"
        onClick={onChange}
        className="flex items-center gap-2 group"
    >
        <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${enabled ? enabledColor : "bg-slate-600"}`}>
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                style={{ left: enabled ? "calc(100% - 22px)" : "2px" }}
            />
        </div>
        <span className={`text-xs transition-colors ${enabled ? "text-white" : "text-slate-500"}`}>
            {enabled ? enabledLabel : disabledLabel}
        </span>
    </button>
);

// ─── Form Data ──────────────────────────────────────

interface ExampleFormData {
    title: string;
    description: string;
    imageURL: string;
    websiteLink: string;
    isActive: boolean;
    isFeatured: boolean;
    order: number;
}

const initialFormData: ExampleFormData = {
    title: "",
    description: "",
    imageURL: "",
    websiteLink: "",
    isActive: true,
    isFeatured: false,
    order: 0,
};

// ─── Toast ──────────────────────────────────────────

interface ToastState {
    show: boolean;
    message: string;
    type: "success" | "error";
}

// ─── Component ──────────────────────────────────────

export const ExamplesSection = () => {
    const [examples, setExamples] = useState<LiveExample[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedExample, setSelectedExample] = useState<LiveExample | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<ExampleFormData>(initialFormData);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Show toast helper ─────────────────────────
    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
    };

    // ── Real-time subscription ────────────────────
    useEffect(() => {
        const unsubscribe = subscribeToExamples(
            (data) => {
                setExamples(data);
                setIsLoading(false);
            },
            (error) => {
                console.error("❌ [ExamplesSection] Subscription error:", error);
                setIsLoading(false);
                showToast("خطأ في تحميل البيانات", "error");
            }
        );
        return () => unsubscribe();
    }, []);

    // ── Handlers ──────────────────────────────────
    const handleAddNew = () => {
        const maxOrder = examples.length > 0 ? Math.max(...examples.map(e => e.order || 0)) + 1 : 1;
        setFormData({ ...initialFormData, order: maxOrder });
        setSelectedExample(null);
        setIsEditing(true);
    };

    const handleEdit = (example: LiveExample) => {
        setFormData({
            title: example.title || "",
            description: example.description || "",
            imageURL: example.imageURL || "",
            websiteLink: example.websiteLink || "",
            isActive: example.isActive ?? true,
            isFeatured: example.isFeatured ?? false,
            order: example.order ?? 0,
        });
        setSelectedExample(example);
        setIsEditing(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            showToast("الملف المحدد ليس صورة", "error");
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showToast("حجم الصورة أكبر من 10 ميجابايت", "error");
            return;
        }

        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            setFormData(prev => ({ ...prev, imageURL: url }));
            showToast("تم رفع الصورة بنجاح ✨");
        } catch (err: any) {
            console.error("❌ Image upload failed:", err);
            showToast(err.message || "فشل رفع الصورة", "error");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            showToast("الرجاء إدخال العنوان", "error");
            return;
        }
        if (!formData.websiteLink.trim()) {
            showToast("الرجاء إدخال رابط الموقع", "error");
            return;
        }

        setIsSaving(true);
        try {
            const payload: LiveExampleInput = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                imageURL: formData.imageURL.trim(),
                websiteLink: formData.websiteLink.trim(),
                isActive: formData.isActive,
                isFeatured: formData.isFeatured,
                order: Number(formData.order) || 0,
            };

            if (selectedExample) {
                await updateExample(selectedExample.id, payload);
                showToast("تم تعديل المثال بنجاح ✅");
            } else {
                await addExample(payload);
                showToast("تم إضافة المثال بنجاح 🎉");
            }

            setIsEditing(false);
            setFormData(initialFormData);
            setSelectedExample(null);
        } catch (error: any) {
            console.error("❌ Save error:", error);
            showToast("حدث خطأ في حفظ المثال", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleVisibility = async (example: LiveExample) => {
        try {
            await toggleExampleVisibility(example.id, !example.isActive);
            showToast(example.isActive ? "تم إخفاء المثال" : "تم إظهار المثال");
        } catch {
            showToast("خطأ في تغيير الحالة", "error");
        }
    };

    const handleToggleFeatured = async (example: LiveExample) => {
        try {
            await toggleExampleFeatured(example.id, !example.isFeatured);
            showToast(example.isFeatured ? "تم إزالة التمييز" : "تم تمييز المثال ✨");
        } catch {
            showToast("خطأ في تغيير التمييز", "error");
        }
    };

    const handleDelete = async (exampleId: string) => {
        try {
            await deleteExample(exampleId);
            showToast("تم حذف المثال بنجاح");
        } catch {
            showToast("خطأ في حذف المثال", "error");
        }
    };

    const filteredExamples = examples.filter(
        (example) =>
            example.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            example.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ── Loading Skeletons ─────────────────────────
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-40 bg-slate-700/50 rounded-lg animate-pulse" />
                    <div className="h-10 w-44 bg-slate-700/50 rounded-xl animate-pulse" />
                </div>
                <div className="h-12 w-80 bg-slate-700/50 rounded-xl animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-slate-800/50 rounded-2xl p-4 space-y-3 animate-pulse">
                            <div className="h-36 bg-slate-700/50 rounded-xl" />
                            <div className="h-5 w-3/4 bg-slate-700/50 rounded" />
                            <div className="h-4 w-1/2 bg-slate-700/50 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ═══ Header ═══════════════════════════════ */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Eye className="w-6 h-6 text-purple-400" />
                        أمثلة حية
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">إدارة الأمثلة الحية والمشاريع المعروضة</p>
                </div>

                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                >
                    <Plus className="w-5 h-5" />
                    إضافة مثال جديد
                </button>
            </div>



            {/* ═══ Examples Grid ═════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExamples.length > 0 ? (
                    filteredExamples.map((example, index) => (
                        <motion.div
                            key={example.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className={`group relative bg-slate-800/50 backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-300 ${example.isFeatured
                                ? "border-amber-500/40 shadow-lg shadow-amber-500/10"
                                : "border-slate-700/50"
                                } ${!example.isActive ? "opacity-50" : "hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10"}`}
                        >
                            {/* Featured badge */}
                            {example.isFeatured && (
                                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-amber-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white shadow-lg">
                                    <Star className="w-3 h-3 fill-white" />
                                    مميز
                                </div>
                            )}

                            {/* Order badge */}
                            <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full text-xs text-slate-300">
                                <GripVertical className="w-3 h-3" />
                                #{example.order || 0}
                            </div>

                            {/* Image */}
                            <div className="w-full h-40 bg-slate-900/50 overflow-hidden">
                                {example.imageURL ? (
                                    <img
                                        src={example.imageURL}
                                        alt={example.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-10 h-10 text-slate-600" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="text-white font-bold text-base mb-1 line-clamp-1">{example.title}</h3>
                                <p className="text-slate-400 text-sm mb-3 line-clamp-2">{example.description || "لا يوجد وصف"}</p>

                                {example.websiteLink && (
                                    <div className="flex items-center gap-1.5 text-xs text-purple-400 mb-3 truncate">
                                        <ExternalLink className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{example.websiteLink}</span>
                                    </div>
                                )}

                                {/* Toggles */}
                                <div className="flex flex-col gap-2 mb-3">
                                    <AnimatedToggle
                                        enabled={example.isActive}
                                        onChange={() => handleToggleVisibility(example)}
                                        enabledLabel="مفعّل"
                                        disabledLabel="مخفي"
                                        enabledColor="bg-emerald-500"
                                    />
                                    <AnimatedToggle
                                        enabled={example.isFeatured}
                                        onChange={() => handleToggleFeatured(example)}
                                        enabledLabel="مميز ✨"
                                        disabledLabel="عادي"
                                        enabledColor="bg-amber-500"
                                    />
                                </div>

                                {/* Date + actions */}
                                <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                                    <p className="text-slate-500 text-xs">{formatDate(example.createdAt)}</p>

                                    <div className="flex items-center gap-1">
                                        {/* Preview */}
                                        {example.websiteLink && (
                                            <button
                                                onClick={() => setPreviewUrl(example.websiteLink)}
                                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="معاينة"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Edit */}
                                        <button
                                            onClick={() => handleEdit(example)}
                                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                            title="تعديل"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>

                                        {/* Delete */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-slate-800 border-slate-700">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-white flex items-center gap-2">
                                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                                        حذف المثال
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription className="text-slate-400">
                                                        هل أنت متأكد من حذف "{example.title}"؟ لا يمكن التراجع عن هذا الإجراء.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">إلغاء</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(example.id)}
                                                        className="bg-red-500 text-white hover:bg-red-600"
                                                    >
                                                        حذف نهائي
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-16">
                        <div className="text-5xl mb-4">📂</div>
                        <p className="text-slate-400 text-lg">
                            {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد أمثلة حية بعد"}
                        </p>
                        {!searchTerm && (
                            <button onClick={handleAddNew} className="mt-4 text-purple-400 hover:text-purple-300 text-sm underline">
                                أضف أول مثال الآن
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ═══ Edit/Add Modal ═══════════════════ */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsEditing(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-slate-700/50 bg-slate-800/95 backdrop-blur-xl rounded-t-2xl">
                                <h3 className="text-xl font-bold text-white">
                                    {selectedExample ? "✏️ تعديل مثال" : "➕ إضافة مثال جديد"}
                                </h3>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-5 space-y-5">
                                {/* Title */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">العنوان *</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="مثال: موقع عيد ميلاد أحمد"
                                        className="bg-slate-900/50 border-slate-700 text-white"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">الوصف</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="وصف قصير عن المثال..."
                                        rows={3}
                                        className="bg-slate-900/50 border-slate-700 text-white"
                                    />
                                </div>

                                {/* Website Link */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">رابط الموقع *</label>
                                    <Input
                                        value={formData.websiteLink}
                                        onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
                                        placeholder="https://example.com"
                                        dir="ltr"
                                        className="bg-slate-900/50 border-slate-700 text-white text-left"
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">الصورة</label>

                                    {/* Current image preview */}
                                    {formData.imageURL && (
                                        <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-700/50">
                                            <img
                                                src={formData.imageURL}
                                                alt="Preview"
                                                className="w-full h-36 object-cover"
                                            />
                                            <button
                                                onClick={() => setFormData({ ...formData, imageURL: "" })}
                                                className="absolute top-2 left-2 p-1.5 bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Upload button */}
                                    <div className="flex gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900/50 border border-dashed border-slate-600 rounded-xl text-slate-400 hover:text-white hover:border-purple-500/50 transition-all disabled:opacity-50"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                                                    <span className="text-purple-400">جاري الرفع...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-5 h-5" />
                                                    <span>رفع صورة</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Or URL input */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-slate-500 text-xs">أو</span>
                                        <Input
                                            value={formData.imageURL}
                                            onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                                            placeholder="رابط الصورة مباشرة"
                                            dir="ltr"
                                            className="bg-slate-900/50 border-slate-700 text-white text-left text-xs h-9"
                                        />
                                    </div>
                                </div>

                                {/* Order */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">
                                        <ArrowUpDown className="w-4 h-4 inline ml-1" />
                                        الترتيب
                                    </label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        className="bg-slate-900/50 border-slate-700 text-white w-28"
                                    />
                                </div>

                                {/* Toggles */}
                                <div className="flex flex-col gap-3 p-4 bg-slate-900/30 rounded-xl border border-slate-700/30">
                                    <AnimatedToggle
                                        enabled={formData.isActive}
                                        onChange={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                        enabledLabel="المثال مفعّل (ظاهر)"
                                        disabledLabel="المثال مخفي"
                                        enabledColor="bg-emerald-500"
                                    />
                                    <AnimatedToggle
                                        enabled={formData.isFeatured}
                                        onChange={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                                        enabledLabel="مميز ✨"
                                        disabledLabel="عادي"
                                        enabledColor="bg-amber-500"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-3">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-5 py-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/30 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                حفظ
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ Preview Modal ═══════════════════ */}
            <AnimatePresence>
                {previewUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
                        onClick={() => setPreviewUrl(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: "spring", damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-5xl h-[80vh] bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between p-3 border-b border-slate-700/50 bg-slate-800/80">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <ExternalLink className="w-4 h-4" />
                                    <span className="truncate max-w-xs" dir="ltr">{previewUrl}</span>
                                </div>
                                <button
                                    onClick={() => setPreviewUrl(null)}
                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <iframe
                                src={previewUrl}
                                className="flex-1 w-full bg-white"
                                title="Preview"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ Toast ═══════════════════════════ */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl ${toast.type === "success"
                            ? "bg-emerald-500/90 text-white"
                            : "bg-red-500/90 text-white"
                            }`}
                    >
                        {toast.type === "success" ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertTriangle className="w-5 h-5" />
                        )}
                        <span className="font-medium text-sm">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExamplesSection;
