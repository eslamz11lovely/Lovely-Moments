import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Star,
    Check,
    X,
    Trash2,
    Edit3,
    Hash,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    Image as ImageIcon,
    AlertTriangle,
} from "lucide-react";
import {
    subscribeToAllReviews,
    approveReview,
    rejectReview,
    toggleFeatured,
    toggleShowOnHome,
    setDisplayOrder,
    updateReviewText,
    deleteReview,
} from "../../services/reviewsAdminService";
import type { Review } from "../../services/reviewsService";

// ── Star Display ──────────────────────────────────────

const StarDisplay = ({ value }: { value: number }) => (
    <div className="flex gap-0.5" dir="ltr">
        {[1, 2, 3, 4, 5].map((s) => (
            <Star
                key={s}
                className={`w-3.5 h-3.5 ${s <= value ? "fill-amber-400 text-amber-400" : "text-slate-700"}`}
            />
        ))}
    </div>
);

// ── Status Badge ──────────────────────────────────────

const StatusBadge = ({ status }: { status: Review["status"] }) => {
    const config = {
        pending: { label: "انتظار", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25", Icon: Clock },
        approved: { label: "معتمد", cls: "bg-green-500/10  text-green-400  border-green-500/25", Icon: CheckCircle },
        rejected: { label: "مرفوض", cls: "bg-red-500/10    text-red-400    border-red-500/25", Icon: XCircle },
    };
    const { label, cls, Icon } = config[status ?? "pending"];
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-cairo font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
};

// ── Delete Confirmation Modal ─────────────────────────

const DeleteModal = ({
    reviewName,
    onConfirm,
    onCancel,
    loading,
}: {
    reviewName: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onCancel}
    >
        <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>

            <h3 className="font-tajawal text-lg font-bold text-white text-center mb-1">
                تأكيد الحذف
            </h3>
            <p className="font-cairo text-sm text-slate-400 text-center mb-1">
                هل أنت متأكد من حذف تقييم
            </p>
            <p className="font-tajawal text-sm font-bold text-white text-center mb-5">
                &ldquo;{reviewName}&rdquo;؟
            </p>
            <p className="font-cairo text-xs text-red-400/80 text-center mb-6">
                ⚠️ هذا الإجراء لا يمكن التراجع عنه
            </p>

            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700/50 text-slate-300 font-cairo text-sm hover:bg-slate-800 transition-colors"
                >
                    إلغاء
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-cairo text-sm font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    حذف
                </button>
            </div>
        </motion.div>
    </motion.div>
);

// ── Image Preview Modal ───────────────────────────────

const ImageModal = ({ url, onClose }: { url: string; onClose: () => void }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
    >
        <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            <img src={url} alt="صورة التقييم" className="w-full h-full object-contain" />
            <button
                onClick={onClose}
                className="absolute top-3 left-3 w-8 h-8 bg-black/60 hover:bg-red-500/80 rounded-full flex items-center justify-center text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    </motion.div>
);

// ── Review Card ───────────────────────────────────────

const ReviewCard = ({ review }: { review: Review }) => {
    const [editMode, setEditMode] = useState(false);
    const [editText, setEditText] = useState(review.reviewText);
    const [orderVal, setOrderVal] = useState(String(review.displayOrder ?? 0));
    const [loading, setLoading] = useState<string | null>(null);
    const [showImage, setShowImage] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const run = async (key: string, fn: () => Promise<void>) => {
        setLoading(key);
        try { await fn(); }
        catch (err) { console.error(err); }
        finally { setLoading(null); }
    };

    const formatDate = (ts: Review["createdAt"]) => {
        if (!ts) return "—";
        const d = (ts as any)?.toDate?.() ?? new Date(ts as any);
        return d.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
    };

    const statusBorder =
        review.featured ? "border-amber-500/40 shadow-[0_0_16px_hsla(45,90%,55%,0.08)]" :
            review.status === "approved" ? "border-green-500/15" :
                review.status === "rejected" ? "border-red-500/15" :
                    "border-slate-700/40";

    return (
        <>
            <AnimatePresence>
                {showImage && review.imageUrl && <ImageModal url={review.imageUrl} onClose={() => setShowImage(false)} />}
                {confirmDelete && (
                    <DeleteModal
                        reviewName={review.customerName}
                        loading={loading === "delete"}
                        onCancel={() => setConfirmDelete(false)}
                        onConfirm={() =>
                            run("delete", () => deleteReview(review.id)).then(() => setConfirmDelete(false))
                        }
                    />
                )}
            </AnimatePresence>

            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`bg-slate-800/40 border rounded-2xl overflow-hidden ${statusBorder}`}
            >
                {/* ── Top accent stripe for featured ── */}
                {review.featured && (
                    <div className="h-0.5 w-full bg-gradient-to-r from-amber-400/0 via-amber-400/60 to-amber-400/0" />
                )}

                <div className="p-4 space-y-3">
                    {/* ── Header ── */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                            {/* Avatar */}
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                style={{ background: "var(--gradient-primary)" }}
                            >
                                {review.customerName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="font-tajawal text-sm font-semibold text-white truncate">
                                    {review.customerName}
                                </p>
                                <p className="text-[11px] text-slate-500 font-cairo">
                                    {formatDate(review.createdAt)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <StarDisplay value={review.rating} />
                            <StatusBadge status={review.status ?? "pending"} />
                        </div>
                    </div>

                    {/* ── Review Text / Edit ── */}
                    {editMode ? (
                        <div className="space-y-2">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={3}
                                className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl px-3 py-2 text-sm font-cairo text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        run("save", () => updateReviewText(review.id, editText))
                                            .then(() => setEditMode(false))
                                    }
                                    className="flex items-center gap-1 text-xs bg-green-500/15 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/25 transition-colors"
                                >
                                    {loading === "save" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                    حفظ
                                </button>
                                <button
                                    onClick={() => { setEditMode(false); setEditText(review.reviewText); }}
                                    className="flex items-center gap-1 text-xs bg-slate-700/60 text-slate-400 border border-slate-600/50 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                                >
                                    <X className="w-3 h-3" /> إلغاء
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm font-cairo text-slate-300 leading-relaxed line-clamp-3">
                            &ldquo;{review.reviewText}&rdquo;
                        </p>
                    )}

                    {/* ── Action Buttons ── */}
                    <div className="pt-2 border-t border-slate-700/30 flex flex-wrap items-center gap-1.5">

                        {/* Approve */}
                        {review.status !== "approved" && (
                            <button
                                onClick={() => run("approve", () => approveReview(review.id))}
                                className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1.5 rounded-lg hover:bg-green-500/20 transition-colors"
                            >
                                {loading === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                قبول
                            </button>
                        )}

                        {/* Reject */}
                        {review.status !== "rejected" && (
                            <button
                                onClick={() => run("reject", () => rejectReview(review.id))}
                                className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                                {loading === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                رفض
                            </button>
                        )}

                        {/* Featured toggle */}
                        <button
                            onClick={() => run("featured", () => toggleFeatured(review.id, !review.featured))}
                            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${review.featured
                                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
                                    : "bg-slate-700/40 text-slate-500 border-slate-600/40 hover:text-amber-400 hover:border-amber-500/30"
                                }`}
                        >
                            {loading === "featured" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Star className="w-3 h-3" />}
                            {review.featured ? "مميز ✓" : "مميز"}
                        </button>

                        {/* Home toggle */}
                        <button
                            onClick={() => run("home", () => toggleShowOnHome(review.id, !review.showOnHome))}
                            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${review.showOnHome
                                    ? "bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/25"
                                    : "bg-slate-700/40 text-slate-500 border-slate-600/40 hover:text-blue-400 hover:border-blue-500/30"
                                }`}
                        >
                            {loading === "home" ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className="text-[11px]">🏠</span>}
                            {review.showOnHome ? "الرئيسية ✓" : "الرئيسية"}
                        </button>

                        {/* image preview */}
                        {review.imageUrl && (
                            <button
                                onClick={() => setShowImage(true)}
                                className="flex items-center gap-1 text-xs bg-slate-700/40 text-slate-400 border border-slate-600/40 px-2 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                                title="عرض الصورة"
                            >
                                <ImageIcon className="w-3 h-3" />
                            </button>
                        )}

                        {/* Edit */}
                        {!editMode && (
                            <button
                                onClick={() => setEditMode(true)}
                                className="flex items-center gap-1 text-xs bg-slate-700/40 text-slate-400 border border-slate-600/40 px-2 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                                title="تعديل النص"
                            >
                                <Edit3 className="w-3 h-3" />
                            </button>
                        )}

                        {/* Display Order */}
                        <div className="flex items-center gap-1 mr-auto">
                            <Hash className="w-3 h-3 text-slate-600" />
                            <input
                                type="number"
                                value={orderVal}
                                onChange={(e) => setOrderVal(e.target.value)}
                                onBlur={() => {
                                    const n = parseInt(orderVal, 10);
                                    if (!isNaN(n) && n !== review.displayOrder) {
                                        run("order", () => setDisplayOrder(review.id, n));
                                    }
                                }}
                                className="w-14 bg-slate-900/50 border border-slate-700/50 rounded-lg px-1.5 py-1 text-xs font-cairo text-white text-center focus:outline-none focus:ring-1 focus:ring-primary/40"
                                title="ترتيب العرض"
                            />
                        </div>

                        {/* Delete */}
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                            title="حذف"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

// ── Main Admin Reviews Section ────────────────────────

type FilterTab = "all" | "pending" | "approved" | "rejected";

export const ReviewsSection = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterTab>("all");

    useEffect(() => {
        const unsub = subscribeToAllReviews(
            (data) => { setReviews(data); setLoading(false); },
            (err) => { console.error("Reviews subscription error:", err); setLoading(false); }
        );
        return () => unsub();
    }, []);

    const counts = {
        all: reviews.length,
        pending: reviews.filter((r) => r.status === "pending" || !r.status).length,
        approved: reviews.filter((r) => r.status === "approved").length,
        rejected: reviews.filter((r) => r.status === "rejected").length,
    };

    const filtered = reviews.filter((r) =>
        filter === "all" || r.status === filter || (filter === "pending" && !r.status)
    );

    const tabs: { key: FilterTab; label: string; activeClass: string }[] = [
        { key: "all", label: `الكل (${counts.all})`, activeClass: "bg-slate-700 text-white" },
        { key: "pending", label: `انتظار (${counts.pending})`, activeClass: "bg-yellow-500/20 text-yellow-400" },
        { key: "approved", label: `معتمد (${counts.approved})`, activeClass: "bg-green-500/20  text-green-400" },
        { key: "rejected", label: `مرفوض (${counts.rejected})`, activeClass: "bg-red-500/20    text-red-400" },
    ];

    return (
        <div className="space-y-6" dir="rtl">

            {/* ── Page Header ── */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <h2 className="text-xl font-tajawal font-bold text-white">إدارة التقييمات</h2>
                    <p className="text-xs text-slate-400 font-cairo">{reviews.length} تقييم إجمالي</p>
                </div>
            </div>

            {/* ── Filter Tabs ── */}
            <div className="flex flex-wrap gap-2">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setFilter(t.key)}
                        className={`px-4 py-2 rounded-xl text-xs font-cairo font-medium border transition-all duration-200 ${filter === t.key
                                ? `${t.activeClass} border-transparent`
                                : "text-slate-500 border-slate-700/50 hover:text-slate-300 hover:border-slate-600"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Reviews Grid ── */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 border border-dashed border-slate-700/50 rounded-2xl"
                >
                    <Star className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                    <p className="font-cairo text-sm text-slate-500">
                        {filter === "all" ? "لا يوجد تقييمات بعد" : "لا يوجد تقييمات في هذه الفئة"}
                    </p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <AnimatePresence>
                        {filtered.map((r) => (
                            <ReviewCard key={r.id} review={r} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ReviewsSection;
