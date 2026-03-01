import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, ExternalLink, Star, X } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { getExampleById, LiveExample } from "../services/examplesService";

const ExamplePreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [example, setExample] = useState<LiveExample | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    const fetchExample = async () => {
      if (!id) {
        setError("معرف المثال غير صالح");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getExampleById(id);
        if (data) {
          setExample(data);
        } else {
          setError("المثال غير موجود");
        }
      } catch (err) {
        console.error("❌ [ExamplePreviewPage] Error:", err);
        setError("حدث خطأ في تحميل المثال");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExample();
  }, [id]);

  // ── Open / close modal ─────────────────────
  const openModal = useCallback(() => {
    setShowIframe(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setShowIframe(false);
    document.body.style.overflow = "";
  }, []);

  // ── ESC key ────────────────────────────────
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [closeModal]);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      </PageTransition>
    );
  }

  if (error || !example) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
          <div className="text-5xl">😞</div>
          <p className="text-muted-foreground text-lg">{error || "المثال غير موجود"}</p>
          <button
            onClick={() => navigate("/live-example")}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
          >
            <ArrowRight size={16} />
            رجوع للنماذج
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <section className="min-h-screen py-24 md:py-20 px-4 pb-32">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => navigate("/live-example")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm"
          >
            <ArrowRight size={16} />
            رجوع للنماذج
          </motion.button>

          {/* Example detail card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Image */}
            {example.imageURL && (
              <div className="w-full h-64 md:h-80 overflow-hidden relative">
                <img
                  src={example.imageURL}
                  alt={example.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Featured badge */}
                {example.isFeatured && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    مميز ✨
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground font-tajawal mb-3">
                {example.title}
              </h1>

              {example.description && (
                <p className="text-muted-foreground text-base leading-relaxed mb-6">
                  {example.description}
                </p>
              )}

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={openModal}
                  className="glow-button text-primary-foreground px-8 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} />
                  مشاهدة مباشرة
                </motion.button>

                <a
                  href={example.websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 rounded-full text-sm font-bold text-foreground glass-card hover:border-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  فتح في تبويب جديد
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Full Screen Iframe Modal ═══════ */}
      <AnimatePresence>
        {showIframe && example.websiteLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative z-10 flex flex-col w-full h-full md:p-4"
            >
              <div className="flex items-center justify-between px-4 py-3 md:px-6 bg-slate-900/80 backdrop-blur-xl md:rounded-t-2xl border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-sm text-slate-300 font-medium truncate mr-4 font-tajawal">
                    {example.title}
                  </span>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              <div className="flex-1 bg-white md:rounded-b-2xl overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
                <iframe
                  src={example.websiteLink}
                  className="relative z-10 w-full h-full border-0"
                  title={example.title}
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

export default ExamplePreviewPage;
