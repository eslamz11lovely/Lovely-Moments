import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Eye, Star, CreditCard, ShoppingCart, Moon, Sun } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { getSiteSettings } from "../services/settingsService";

// ─── Desktop Logo ─────────────────────────────────────
const DesktopLogo = ({ onClick }: { onClick?: () => void }) => (
  <motion.div
    onClick={onClick}
    className="flex items-center gap-2 cursor-pointer select-none"
    whileHover={{ scale: 1.04 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
  >
    <motion.span
      animate={{ y: [0, -2, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      className="text-xl"
    >
      💕
    </motion.span>
    <span
      className="font-bold text-lg tracking-wide"
      style={{
        fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
        background: "linear-gradient(135deg, hsl(340, 82%, 62%), hsl(300, 70%, 60%), hsl(270, 60%, 55%))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      Lovely Moments
    </span>
  </motion.div>
);

// ─── Mobile Brand Text ────────────────────────────────
const MobileBrand = ({ onClick }: { onClick?: () => void }) => (
  <span
    onClick={onClick}
    className="text-[10px] font-bold tracking-widest cursor-pointer"
    style={{
      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
      color: "hsl(340,82%,62%)",
    }}
  >
    💕 LOVELY MOMENTS
  </span>
);

const navItems = [
  { path: "/", label: "الرئيسية", icon: Home },
  { path: "/live-example", label: "مثال حي", icon: Eye },
  { path: "/features", label: "المميزات", icon: Star },
  { path: "/pricing", label: "الأسعار", icon: CreditCard },
  { path: "/order", label: "اطلب", icon: ShoppingCart },
];

/* Page titles shown in the top bar */
const pageTitles: Record<string, string> = {
  "/": "أول منصة للهدايا الرقمية في مصر",
  "/features": "مميزات Lovely Moments",
  "/pricing": "باقاتنا وأسعارنا",
  "/order": "اطلب هديتك دلوقتي",
  "/live-example": "مثال حي",
};

// WhatsApp SVG Icon
const WhatsAppIcon = ({ size = 18, color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill={color} width={size} height={size}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [waLink, setWaLink] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    getSiteSettings().then((s) => {
      if (s && s.adminPhone) {
        const cleanPhone = s.adminPhone.replace(/\s+/g, "").replace(/^0/, "");
        setWaLink(`https://wa.me/+20${cleanPhone}`);
      }
    });
  }, []);

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const newClicks = prev + 1;
      if (newClicks >= 5) {
        navigate("/admin/login");
        return 0; // reset
      }
      return newClicks;
    });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (path: string) => {
    if (isActive(path)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(path);
    }
  };

  const pageTitle =
    pageTitles[location.pathname] ?? "أول منصة للهدايا الرقمية في مصر";

  return (
    <>
      {/* ══════════════════════════════════════════
          MOBILE TOP BAR  (matches the image design)
         ══════════════════════════════════════════ */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "shadow-lg" : ""
          }`}
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Title + brand — right side (first element in RTL) */}
          <div className="flex flex-col items-start">
            <motion.h1
              key={location.pathname}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-bold font-tajawal leading-tight text-right"
              style={{ color: "var(--foreground)" }}
            >
              👑 {pageTitle}
            </motion.h1>
            <MobileBrand onClick={handleLogoClick} />
          </div>

          {/* Icon buttons container — left side */}
          <div className="flex items-center gap-2">
            {waLink && (
              <motion.a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="تواصل عبر الواتساب"
                className="w-10 h-10 rounded-full flex items-center justify-center glass-card relative overflow-hidden shrink-0"
                style={{
                  border: "1px solid hsla(142,70%,50%,0.3)",
                  boxShadow: "0 0 14px hsla(142,70%,50%,0.2)",
                  color: "hsl(142,70%,50%)"
                }}
              >
                <WhatsAppIcon size={18} />
              </motion.a>
            )}

            {/* Theme toggle button — left side (mirrors the moon icon in image) */}
            <motion.button
              onClick={toggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="تغيير الوضع"
              className="w-10 h-10 rounded-full flex items-center justify-center glass-card relative overflow-hidden shrink-0"
              style={{
                border: "1px solid hsla(340,82%,62%,0.3)",
                boxShadow: "0 0 14px hsla(340,82%,62%,0.2)",
              }}
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.span
                    key="moon"
                    initial={{ rotate: -30, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 30, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Moon size={18} style={{ color: "hsl(340,82%,62%)" }} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="sun"
                    initial={{ rotate: 30, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -30, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Sun size={18} style={{ color: "hsl(40,90%,55%)" }} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ══════════════════════════════════════════
          DESKTOP TOP NAV
         ══════════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-center gap-8 py-4 px-8 transition-all duration-300 ${scrolled ? "shadow-lg" : ""
          }`}
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div className="ml-auto">
          <DesktopLogo onClick={handleLogoClick} />
        </div>

        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavClick(item.path)}
            className={`text-sm font-medium transition-colors font-cairo ${isActive(item.path)
              ? "text-primary"
              : "text-foreground/70 hover:text-primary"
              }`}
          >
            {item.label}
          </button>
        ))}

        {/* Icon buttons container */}
        <div className="mr-auto flex items-center gap-2">
          {waLink && (
            <motion.a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="تواصل عبر الواتساب"
              className="w-9 h-9 rounded-full flex items-center justify-center glass-card relative overflow-hidden"
              style={{
                border: "1px solid hsla(142,70%,50%,0.3)",
                boxShadow: "0 0 12px hsla(142,70%,50%,0.15)",
                color: "hsl(142,70%,50%)"
              }}
            >
              <WhatsAppIcon size={16} />
            </motion.a>
          )}

          {/* Desktop theme toggle */}
          <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="تغيير الوضع"
            className="w-9 h-9 rounded-full flex items-center justify-center glass-card"
            style={{
              border: "1px solid hsla(340,82%,62%,0.3)",
              boxShadow: "0 0 12px hsla(340,82%,62%,0.15)",
            }}
          >
            <AnimatePresence mode="wait">
              {theme === "dark" ? (
                <motion.span
                  key="moon-d"
                  initial={{ rotate: -30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 30, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Moon size={16} style={{ color: "hsl(340,82%,62%)" }} />
                </motion.span>
              ) : (
                <motion.span
                  key="sun-d"
                  initial={{ rotate: 30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -30, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Sun size={16} style={{ color: "hsl(40,90%,55%)" }} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* ══════════════════════════════════════════
          MOBILE BOTTOM NAV
         ══════════════════════════════════════════ */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl shadow-lg"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid var(--glass-border)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex flex-col items-center gap-1 transition-all duration-200 py-1 px-2 rounded-xl relative ${active ? "text-primary" : "text-foreground/60 hover:text-primary"
                  }`}
              >
                {/* Active pill background */}
                {active && (
                  <motion.span
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "hsla(340,82%,62%,0.12)" }}
                  />
                )}
                <span className="relative">
                  <item.icon size={20} />
                  {active && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                      style={{
                        background: "hsl(340,82%,62%)",
                        boxShadow: "0 0 6px hsl(340,82%,62%)",
                      }}
                    />
                  )}
                </span>
                <span className="text-[10px] font-medium font-cairo">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;
