import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { adminLogin } from "../../services/auth";

export const AdminLogin = () => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/admin";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setError("");
        setIsLoading(true);

        const result = await adminLogin(password);

        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.error || "كلمة المرور غير صحيحة");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--background)" }}>
            <div className="w-full max-w-sm" style={{ animation: "fadeIn 0.3s ease-out" }}>

                {/* Back Link */}
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors font-tajawal">
                    <ArrowRight size={16} />
                    العودة للرئيسية
                </Link>

                <div
                    className="p-6 md:p-8 rounded-2xl border"
                    style={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
                    }}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                            <Lock size={24} />
                        </div>
                        <h1 className="text-xl font-bold font-tajawal text-foreground">تسجيل الدخول للإدارة</h1>
                        <p className="text-sm text-muted-foreground font-cairo mt-1">الرجاء إدخال كلمة المرور للمتابعة</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="كلمة المرور..."
                                    className="w-full px-4 py-3 rounded-xl border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-cairo text-sm"
                                    style={{
                                        backgroundColor: "var(--input)",
                                        borderColor: "var(--border)",
                                    }}
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-cairo text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-tajawal rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    جاري الدخول...
                                </>
                            ) : (
                                "تسجيل الدخول"
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AdminLogin;
