import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Star, ExternalLink, LayoutGrid, List } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { getActiveExamples, LiveExample } from "../services/examplesService";

// ─── View Mode ──────────────────────────────────────
type ViewMode = "grid" | "list";

// ─── Skeleton ───────────────────────────────────────
const SkeletonGrid = () => (
  <div className="glass-card rounded-xl overflow-hidden animate-pulse">
    <div className="w-full h-36 bg-slate-700/20" />
    <div className="p-3 space-y-2">
      <div className="h-4 w-3/4 bg-slate-700/20 rounded" />
      <div className="h-3 w-full bg-slate-700/20 rounded" />
    </div>
  </div>
);

const SkeletonList = () => (
  <div className="glass-card rounded-xl overflow-hidden animate-pulse flex h-24">
    <div className="w-32 bg-slate-700/20 shrink-0" />
    <div className="p-3 flex-1 space-y-2">
      <div className="h-4 w-1/2 bg-slate-700/20 rounded" />
      <div className="h-3 w-3/4 bg-slate-700/20 rounded" />
    </div>
  </div>
);

// ─── Main Component ─────────────────────────────────

const LiveExamplePage = () => {
  const [examples, setExamples] = useState<LiveExample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const data = await getActiveExamples();
        setExamples(data);
      } catch (err) {
        console.error("❌ [LiveExamplePage] Error:", err);
        setError("حدث خطأ في تحميل الأمثلة");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExamples();
  }, []);

  const openModal = useCallback((example: LiveExample) => {
    setModalUrl(example.websiteLink);
    setModalTitle(example.title);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setModalUrl(null);
    setModalTitle("");
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeModal]);

  useEffect(() => {
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ═══════════════════════════════════════════════
  // LOADING
  // ═══════════════════════════════════════════════
  if (isLoading) {
    return (
      <PageTransition>
        <section className="min-h-screen py-24 md:py-20 px-4 pb-32">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="h-8 w-48 mx-auto bg-slate-700/20 rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-72 mx-auto bg-slate-700/20 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonGrid key={i} />)}
            </div>
          </div>
        </section>
      </PageTransition>
    );
  }

  // ═══════════════════════════════════════════════
  // ERROR
  // ═══════════════════════════════════════════════
  if (error) {
    return (
      <PageTransition>
        <section className="min-h-screen py-24 md:py-20 px-4 pb-32">
          <div className="max-w-lg mx-auto text-center">
            <div className="text-5xl mb-4">😞</div>
            <p className="text-destructive text-lg">{error}</p>
          </div>
        </section>
      </PageTransition>
    );
  }

  // ═══════════════════════════════════════════════
  // EMPTY
  // ═══════════════════════════════════════════════
  if (examples.length === 0) {
    return (
      <PageTransition>
        <section className="min-h-screen py-24 md:py-20 px-4 pb-32">
          <div className="max-w-lg mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-5xl mb-4">📂</div>
              <h1 className="text-2xl md:text-3xl font-bold font-tajawal mb-3">نماذج من أعمالنا</h1>
              <div className="glass-card rounded-2xl p-6">
                <p className="text-muted-foreground text-sm">لا توجد أمثلة حية متاحة حالياً</p>
                <p className="text-muted-foreground text-xs mt-1">قريباً سنضيف نماذج جديدة! 🚀</p>
              </div>
            </motion.div>
          </div>
        </section>
      </PageTransition>
    );
  }

  // ═══════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════
  return (
    <PageTransition>
      <section className="min-h-screen py-24 md:py-20 px-4 pb-32">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-2xl md:text-4xl font-bold font-tajawal mb-2">
              <span className="gradient-text">نماذج من أعمالنا</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto">
              اضغط على أي مثال لمشاهدته مباشرة
            </p>
          </motion.div>

          {/* View Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-1 mb-8"
          >
            <div className="glass-card rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "grid"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                كروت
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "list"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <List className="w-3.5 h-3.5" />
                صفوف
              </button>
            </div>
          </motion.div>

          {/* ═══ GRID VIEW ═══════════════════ */}
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
              >
                {examples.map((example, i) => (
                  <motion.div
                    key={example.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => openModal(example)}
                    className={`group relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${example.isFeatured
                        ? "glass-card ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/5"
                        : "glass-card hover:shadow-lg hover:shadow-primary/5"
                      }`}
                    style={
                      example.isFeatured
                        ? { animation: "featuredGlow 3s ease-in-out infinite" }
                        : undefined
                    }
                  >
                    {/* Image */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-900/20">
                      {example.imageURL ? (
                        <img
                          src={example.imageURL}
                          alt={example.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                          <ExternalLink className="w-8 h-8 text-muted-foreground/20" />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                        <span className="text-white text-[10px] font-bold px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full border border-white/15">
                          مشاهدة ✨
                        </span>
                      </div>

                      {/* Badge */}
                      {example.isFeatured && (
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-amber-500/90 backdrop-blur-sm rounded-full text-[9px] font-bold text-white shadow-sm">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          مميز
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h3 className="text-foreground font-bold text-xs md:text-sm font-tajawal group-hover:text-primary transition-colors line-clamp-1">
                        {example.title}
                      </h3>
                      {example.description && (
                        <p className="text-muted-foreground text-[10px] md:text-xs mt-0.5 line-clamp-1">
                          {example.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* ═══ LIST VIEW ═══════════════════ */
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-2 max-w-2xl mx-auto"
              >
                {examples.map((example, i) => (
                  <motion.div
                    key={example.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ x: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal(example)}
                    className={`group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 flex ${example.isFeatured
                        ? "glass-card ring-1 ring-amber-500/20"
                        : "glass-card hover:border-primary/20"
                      }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-28 md:w-36 shrink-0 overflow-hidden bg-slate-900/20 relative">
                      {example.imageURL ? (
                        <img
                          src={example.imageURL}
                          alt={example.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                          <ExternalLink className="w-6 h-6 text-muted-foreground/20" />
                        </div>
                      )}
                      {example.isFeatured && (
                        <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/90 backdrop-blur-sm rounded-full text-[8px] font-bold text-white">
                          <Star className="w-2 h-2 fill-white" />
                          مميز
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3 md:p-4 flex flex-col justify-center min-w-0">
                      <h3 className="text-foreground font-bold text-sm font-tajawal group-hover:text-primary transition-colors line-clamp-1">
                        {example.title}
                      </h3>
                      {example.description && (
                        <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2 leading-relaxed">
                          {example.description}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center px-3 text-muted-foreground/30 group-hover:text-primary transition-colors">
                      <span className="text-lg">‹</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ FULL SCREEN MODAL ══════════════ */}
      <AnimatePresence>
        {modalUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex flex-col"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={closeModal}
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative z-10 flex flex-col w-full h-full md:p-4"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 py-2.5 md:px-5 bg-slate-900/80 backdrop-blur-xl md:rounded-t-2xl border-b border-slate-700/50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium truncate mr-2 font-tajawal">
                    {modalTitle}
                  </span>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all group"
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              <div className="flex-1 bg-white md:rounded-b-2xl overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                </div>
                <iframe
                  src={modalUrl}
                  className="relative z-10 w-full h-full border-0"
                  title={modalTitle}
                  loading="lazy"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default LiveExamplePage;
