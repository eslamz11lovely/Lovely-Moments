import { useTheme } from "@/hooks/useTheme";

const WhatIsLovelySection = () => {
  const { theme } = useTheme();

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Static radial glow — pure CSS */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: theme === "light"
            ? "radial-gradient(ellipse 60% 50% at 50% 50%, hsla(340, 82%, 55%, 0.08) 0%, transparent 70%)"
            : "radial-gradient(ellipse 60% 50% at 50% 50%, hsla(270,30%,12%,0.4) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-tajawal">
          يعني إيه <span className="gradient-text">Lovely Moments</span>؟ 💙
        </h2>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text card */}
          <div
            className="glass-card rounded-2xl p-7 space-y-4 hover:shadow-lg transition-shadow duration-300"
            style={{ border: "1px solid var(--glass-border)" }}
          >
            <p className="text-lg leading-loose text-foreground/90 font-cairo">
              خدمة هدفها تحوّل أي مناسبة في حياتك لهدية مميزة وذكرى تعيش سنين.
            </p>
            <p className="text-base leading-loose text-muted-foreground font-cairo">
              الهدايا مش مجرد حاجة مادية…
              <br />
              إحنا بنصمم لك <span className="gradient-text font-bold">إحساس، لحظة، ومشاعر</span> تفضل محفورة في القلب.
            </p>
            <div className="flex gap-2 flex-wrap pt-1">
              {["💙 مميز", "✨ شخصي", "🎁 لا يُنسى"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-bold font-cairo"
                  style={{
                    background: "var(--gradient-card)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Visual card */}
          <div className="flex items-center justify-center py-8">
            <div
              className="glass-card rounded-2xl p-8 flex flex-col items-center gap-3 w-52 hover:-translate-y-2 transition-transform duration-300"
              style={{
                border: theme === "light"
                  ? "1px solid hsla(340, 82%, 55%, 0.2)"
                  : "1px solid hsla(340,82%,62%,0.25)",
                boxShadow: theme === "light"
                  ? "0 4px 20px hsla(340, 82%, 55%, 0.1)"
                  : "0 4px 30px hsla(340,82%,62%,0.15)",
              }}
            >
              <span className="text-5xl drop-shadow-md">💙</span>
              <p className="gradient-text font-bold text-base font-tajawal text-center">
                Lovely Moments
              </p>
              <p className="text-xs text-muted-foreground text-center font-cairo">
                ذكرى تعيش سنين
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsLovelySection;
