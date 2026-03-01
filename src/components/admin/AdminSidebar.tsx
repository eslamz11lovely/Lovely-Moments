import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    ShoppingCart,
    DollarSign,
    Menu,
    X,
    LogOut,
    User,
    Images,
    Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminLogout } from "../../services/auth";
import { cleanupNotifications } from "../../services/notificationsService";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isMobile: boolean;
}

const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "الطلبات", icon: ShoppingCart },
    { id: "pricing", label: "التحكم في الأسعار", icon: DollarSign },
    { id: "examples", label: "أمثلة حية", icon: Images },
    { id: "settings", label: "الإعدادات", icon: Settings },
];

export const AdminSidebar = ({ activeTab, onTabChange, isMobile }: SidebarProps) => {
    const [isOpen, setIsOpen] = useState(!isMobile);
    const navigate = useNavigate();

    const handleLogout = async () => {
        cleanupNotifications();
        await adminLogout();
        navigate("/admin/login");
    };

    const sidebarVariants = {
        open: { x: 0, opacity: 1 },
        closed: { x: 100, opacity: 0 },
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            {isMobile && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="fixed top-4 right-4 z-50 p-2 bg-slate-800/90 backdrop-blur-xl rounded-xl border border-slate-700/50 text-white"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            )}

            {/* Overlay for mobile */}
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 z-30"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={isMobile ? "closed" : "open"}
                animate={isOpen ? "open" : "closed"}
                variants={sidebarVariants}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`fixed top-0 right-0 h-full w-64 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800/50 z-40 flex flex-col ${isMobile ? "pt-20" : ""
                    }`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold">Admin Panel</h2>
                            <p className="text-xs text-slate-400">Lovely Link</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onTabChange(item.id);
                                    if (isMobile) setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-purple-400" : ""}`} />
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="mr-auto w-2 h-2 bg-purple-400 rounded-full"
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-800/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">تسجيل الخروج</span>
                    </button>
                </div>
            </motion.aside>
        </>
    );
};

export default AdminSidebar;
