import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Upload, Loader2, CheckCircle, X, Image as ImageIcon, ChevronDown, Sparkles } from "lucide-react";
import { submitReview, getApprovedReviews, type Review } from "@/services/reviewsService";
import { uploadReviewImage, validateImage } from "@/services/imageUploadService";

// ── Star Rating UI ────────────────────────────────────

const StarRating = ({
    value,
    onChange,
    readOnly = false,
    size = "md",
}: {
    value: number;
    onChange?: (v: number) => void;
    readOnly?: boolean;
    size?: "sm" | "md" | "lg";
}) => {
    const [hovered, setHovered] = useState(0);
    const sizeMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
    const cls = sizeMap[size];

    return (
        <div className="flex gap-1 items-center" dir="ltr">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type={readOnly ? "button" : "button"}
                    disabled={readOnly}
                    onClick={() => !readOnly && onChange?.(star)}
                    onMouseEnter={() => !readOnly && setHovered(star)}
                    onMouseLeave={() => !readOnly && setHovered(0)}
                    className={`transition-all duration-150 ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
                >
                    <Star
                        className={`${cls} transition-all duration-150 ${star <= (readOnly ? value : hovered || value)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-600 fill-transparent"
                            }`}
                    />
                </button>
            ))}
        </div>
    );
};

// ── Skeleton Card ─────────────────────────────────────

const SkeletonCard = () => (
    <div className="glass-card rounded-2xl p-5 space-y-3 animate-pulse">
        <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-slate-700" />
            ))}
        </div>
        <div className="h-4 bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-700 rounded w-full" />
        <div className="h-4 bg-slate-700 rounded w-2/3" />
        <div className="flex items-center gap-3 mt-4">
            <div className="w-9 h-9 rounded-full bg-slate-700" />
            <div className="h-4 bg-slate-700 rounded w-24" />
        </div>
    </div>
);

// ── Review Card ───────────────────────────────────────

const ReviewCard = ({ review, index }: { review: Review; index: number }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);

    const formatDate = (ts: Review["createdAt"]) => {
        if (!ts) return "";
        const date = (ts as any)?.toDate?.() ?? new Date(ts as any);
        return date.toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className={`glass-card rounded-2xl overflow-hidden flex flex-col group relative ${review.featured
                ? "border border-amber-500/40 shadow-[0_0_20px_hsla(45,90%,55%,0.15)]"
                : "border border-white/5"
                }`}
        >
            {/* Featured badge */}
            {review.featured && (
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-amber-500/20 border border-amber-400/30 text-amber-400 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                    <Sparkles className="w-3 h-3" />
                    مميز
                </div>
            )}

            {/* Image */}
            {review.imageUrl && !imgError && (
                <div className="relative h-44 overflow-hidden bg-slate-800/50">
                    {!imgLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    )}
                    <img
                        src={review.imageUrl}
                        alt="صورة التقييم"
                        loading="lazy"
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgError(true)}
                        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"
                            }`}
                    />
                </div>
            )}

            <div className="p-5 flex flex-col flex-1">
                {/* Author row at top */}
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: "var(--gradient-primary)" }}
                    >
                        {review.customerName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-tajawal text-sm font-semibold block truncate">
                            {review.customerName}
                        </span>
                        {review.createdAt && (
                            <span className="text-xs text-muted-foreground font-cairo">
                                {formatDate(review.createdAt)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stars directly above the review text */}
                <StarRating value={review.rating} readOnly size="sm" />

                {/* Review text */}
                <p className="font-cairo text-sm leading-relaxed text-foreground/80 mt-2 flex-1">
                    &ldquo;{review.reviewText}&rdquo;
                </p>
            </div>
        </motion.div>
    );
};

// ── Add Review Form ───────────────────────────────────

const AddReviewForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const [form, setForm] = useState({ customerName: "", rating: 0, reviewText: "" });
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<{ customerName?: string; rating?: string; reviewText?: string; image?: string }>({});
    const [dragOver, setDragOver] = useState(false);

    const handleFile = (selected: File) => {
        const err = validateImage(selected);
        if (err) {
            setErrors((prev) => ({ ...prev, image: err }));
            return;
        }
        setErrors((prev) => ({ ...prev, image: undefined }));
        setFile(selected);
        const url = URL.createObjectURL(selected);
        setPreview(url);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const validate = () => {
        const errs: typeof errors = {};
        if (!form.customerName.trim()) errs.customerName = "الاسم مطلوب";
        if (!form.rating) errs.rating = "يرجى اختيار تقييم";
        if (!form.reviewText.trim()) errs.reviewText = "نص التقييم مطلوب";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setUploading(true);
        try {
            let imageUrl: string | null = null;

            if (file) {
                const result = await uploadReviewImage(file);
                if (result.source !== "none") {
                    imageUrl = result.url;
                }
            }

            await submitReview({
                customerName: form.customerName,
                rating: form.rating,
                reviewText: form.reviewText,
                imageUrl,
            });

            setSubmitted(true);
        } catch (err: any) {
            alert("حدث خطأ، يرجى المحاولة مرة أخرى.");
        } finally {
            setUploading(false);
        }
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-2xl p-8 text-center border border-green-500/30"
            >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="font-tajawal text-xl font-bold text-green-400 mb-2">
                    شكراً على تقييمك! 💕
                </h3>
                <p className="font-cairo text-sm text-muted-foreground mb-6">
                    تم إرسال تقييمك بنجاح وسيتم مراجعته قريباً.
                </p>
                <button
                    onClick={() => {
                        setSubmitted(false);
                        setForm({ customerName: "", rating: 0, reviewText: "" });
                        setFile(null);
                        setPreview(null);
                        onSuccess();
                    }}
                    className="glow-button text-white font-tajawal font-semibold px-6 py-2.5 rounded-xl text-sm"
                >
                    إضافة تقييم آخر
                </button>
            </motion.div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="glass-card rounded-2xl p-6 border border-white/5 space-y-5"
        >
            <h3 className="font-tajawal text-xl font-bold">اكتب تقييمك</h3>

            {/* Name */}
            <div className="space-y-1.5">
                <label className="font-cairo text-sm text-muted-foreground">
                    الاسم <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                    placeholder="اسمك الكريم..."
                    className="w-full rounded-xl px-4 py-3 text-sm font-cairo border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {errors.customerName && (
                    <p className="text-red-400 text-xs font-cairo">{errors.customerName}</p>
                )}
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
                <label className="font-cairo text-sm text-muted-foreground">
                    التقييم <span className="text-red-400">*</span>
                </label>
                <StarRating
                    value={form.rating}
                    onChange={(v) => setForm((p) => ({ ...p, rating: v }))}
                    size="lg"
                />
                {errors.rating && (
                    <p className="text-red-400 text-xs font-cairo">{errors.rating}</p>
                )}
            </div>

            {/* Review Text */}
            <div className="space-y-1.5">
                <label className="font-cairo text-sm text-muted-foreground">
                    تقييمك <span className="text-red-400">*</span>
                </label>
                <textarea
                    value={form.reviewText}
                    onChange={(e) => setForm((p) => ({ ...p, reviewText: e.target.value }))}
                    placeholder="شاركنا تجربتك مع Lovely Moments..."
                    rows={4}
                    className="w-full rounded-xl px-4 py-3 text-sm font-cairo border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
                {errors.reviewText && (
                    <p className="text-red-400 text-xs font-cairo">{errors.reviewText}</p>
                )}
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
                <label className="font-cairo text-sm text-muted-foreground">
                    صورة للتقييم (اختياري)
                </label>
                {preview ? (
                    <div className="relative rounded-xl overflow-hidden h-40">
                        <img
                            src={preview}
                            alt="معاينة"
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => { setFile(null); setPreview(null); }}
                            className="absolute top-2 left-2 w-8 h-8 bg-black/60 hover:bg-red-500/80 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <label
                        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl h-32 cursor-pointer transition-all duration-200 ${dragOver
                            ? "border-primary bg-primary/10"
                            : "border-white/10 hover:border-primary/40 hover:bg-white/5"
                            }`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFile(f);
                            }}
                        />
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        <span className="font-cairo text-xs text-muted-foreground text-center px-4">
                            اسحب صورتك هنا أو اضغط للاختيار
                            <br />
                            <span className="text-[11px]">JPG, PNG, WebP — حتى 5 ميجا</span>
                        </span>
                    </label>
                )}
                {errors.image && (
                    <p className="text-red-400 text-xs font-cairo">{errors.image}</p>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={uploading}
                className="w-full glow-button text-white font-tajawal font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الإرسال...
                    </>
                ) : (
                    <>
                        <Upload className="w-4 h-4" />
                        إرسال التقييم
                    </>
                )}
            </button>
        </form>
    );
};

// ── Main Reviews Page ─────────────────────────────────

const ReviewsPage = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [showForm, setShowForm] = useState(false);

    const fetchInitial = useCallback(async () => {
        setLoading(true);
        setCurrentPage(0);
        try {
            const result = await getApprovedReviews(0);
            setReviews(result.reviews);
            setHasMore(result.hasMore);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMore = async () => {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
        const nextPage = currentPage + 1;
        try {
            const result = await getApprovedReviews(nextPage);
            setReviews((prev) => [...prev, ...result.reviews]);
            setHasMore(result.hasMore);
            setCurrentPage(nextPage);
        } catch (err) {
            console.error("Error loading more reviews:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchInitial();
    }, [fetchInitial]);

    return (
        <div className="min-h-screen py-16 px-4" dir="rtl">
            <div className="max-w-6xl mx-auto">
                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <span className="inline-flex items-center gap-1.5 text-xs font-cairo font-medium px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary mb-4">
                        <Star className="w-3 h-3 fill-primary" />
                        آراء العملاء
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold font-tajawal mb-4">
                        ماذا قالوا عن{" "}
                        <span className="gradient-text">Lovely Moments</span>؟
                    </h1>
                    <p className="text-muted-foreground font-cairo max-w-xl mx-auto">
                        تجارب حقيقية من عملائنا الكرام — شاركنا تجربتك أنت أيضاً 💕
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── Left: Form ── */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <AnimatePresence mode="wait">
                                {showForm ? (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <AddReviewForm onSuccess={fetchInitial} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="cta"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="glass-card rounded-2xl p-6 border border-primary/20 text-center space-y-4"
                                    >
                                        <div
                                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                                            style={{ background: "var(--gradient-primary)" }}
                                        >
                                            <Star className="w-8 h-8 text-white fill-white" />
                                        </div>
                                        <h2 className="font-tajawal text-lg font-bold">
                                            شاركنا رأيك!
                                        </h2>
                                        <p className="font-cairo text-sm text-muted-foreground">
                                            تجربتك تهمنا وتساعدنا في تطوير خدماتنا 💕
                                        </p>
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="glow-button w-full text-white font-tajawal font-bold py-3 rounded-xl"
                                        >
                                            اكتب تقييمك الآن ✨
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* ── Right: Reviews Grid ── */}
                    <div className="lg:col-span-2 order-1 lg:order-2">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : reviews.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass-card rounded-2xl p-12 text-center border border-white/5"
                            >
                                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                                <p className="font-tajawal text-muted-foreground">
                                    لا يوجد تقييمات حتى الآن — كن أول من يشارك تجربته!
                                </p>
                            </motion.div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <AnimatePresence>
                                        {reviews.map((r, i) => (
                                            <ReviewCard key={r.id} review={r} index={i} />
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Load More */}
                                {hasMore && (
                                    <div className="mt-8 text-center">
                                        <button
                                            onClick={fetchMore}
                                            disabled={loadingMore}
                                            className="inline-flex items-center gap-2 px-6 py-3 glass-card rounded-xl border border-white/10 text-sm font-cairo hover:border-primary/30 transition-all disabled:opacity-60"
                                        >
                                            {loadingMore ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                            {loadingMore ? "جاري التحميل..." : "تحميل المزيد"}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewsPage;
