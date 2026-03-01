/* Lightweight CSS-only floating hearts — zero JS animation cost */
const FloatingHearts = () => (
  <div
    className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    aria-hidden="true"
  >
    {/* Only 5 hearts, staggered via CSS animation-delay, uses @keyframes heart-float from index.css */}
    {[
      { left: "10%", size: 10, dur: "18s", delay: "0s" },
      { left: "30%", size: 8, dur: "22s", delay: "4s" },
      { left: "55%", size: 12, dur: "20s", delay: "8s" },
      { left: "75%", size: 9, dur: "24s", delay: "2s" },
      { left: "90%", size: 7, dur: "19s", delay: "12s" },
    ].map((h, i) => (
      <div
        key={i}
        className="absolute text-primary/15"
        style={{
          left: h.left,
          fontSize: h.size,
          animation: `heart-float ${h.dur} ease-in-out ${h.delay} infinite`,
          willChange: "transform",
        }}
      >
        ♥
      </div>
    ))}
  </div>
);

export default FloatingHearts;
