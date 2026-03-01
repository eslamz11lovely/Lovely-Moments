import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Lock, Heart, Image, Music } from "lucide-react";

const LiveExampleSection = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [playing, setPlaying] = useState(false);

  return (
    <section id="live-example" className="py-20 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center mb-4 font-tajawal"
        >
          شوف الهدية شكلها إزاي 👀
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center text-muted-foreground mb-12 text-lg"
        >
          مثال حي على هدية رقمية من Lovely Moments
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-sm mx-auto"
        >
          {/* Phone mockup */}
          <div className="glass-card rounded-[2.5rem] p-3 shadow-xl" style={{ boxShadow: "var(--shadow-elevated)" }}>
            <div className="bg-card rounded-[2rem] overflow-hidden">
              {/* Status bar */}
              <div className="flex items-center justify-between px-6 py-3 text-xs text-muted-foreground">
                <span>9:41</span>
                <span>Lovely Moments</span>
                <span>💙</span>
              </div>

              {!unlocked ? (
                <div className="p-8 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Lock className="mx-auto text-primary mb-4" size={48} />
                  </motion.div>
                  <p className="text-muted-foreground mb-6 text-sm">الهدية دي خاصة بيك 🔒</p>
                  <button
                    onClick={() => setUnlocked(true)}
                    className="glow-button text-primary-foreground px-8 py-3 rounded-full text-sm font-bold"
                  >
                    افتح الهدية 🎁
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 text-center"
                >
                  <div className="w-full h-40 rounded-xl bg-muted flex items-center justify-center mb-4 overflow-hidden relative">
                    <Image className="text-muted-foreground" size={40} />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                    <Heart className="absolute bottom-3 left-3 text-primary" size={20} />
                  </div>

                  <p className="text-foreground font-bold text-lg mb-2 font-tajawal">❤️ ليك يا أجمل إنسان</p>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    كل لحظة معاك بتكون أحلى من اللي قبلها… أنت أجمل هدية في حياتي 💕
                  </p>

                  <button
                    onClick={() => setPlaying(!playing)}
                    className="flex items-center gap-2 mx-auto glass-card px-5 py-2.5 rounded-full text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <Music size={16} />
                    <span>{playing ? "⏸ إيقاف الأغنية" : "▶ شغّل الأغنية"}</span>
                  </button>

                  {playing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 flex items-center justify-center gap-1"
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [8, 20, 8] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                          className="w-1 bg-primary rounded-full"
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}

              <div className="h-4" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveExampleSection;
