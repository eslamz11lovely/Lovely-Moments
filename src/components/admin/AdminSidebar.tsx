import { motion } from "framer-motion";
import {
    LayoutDashboard,
    ShoppingCart,
    DollarSign,
    LogOut,
    Images,
    Settings,
    Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminLogout } from "../../services/auth";
import { cleanupNotifications } from "../../services/notificationsService";
import { useEffect, useRef } from "react";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isMobile: boolean;
}

const menuItems = [
    { id: "overview", label: "الرئيسية", icon: LayoutDashboard },
    { id: "orders", label: "الطلبات", icon: ShoppingCart },
    { id: "pricing", label: "الأسعار", icon: DollarSign },
    { id: "examples", label: "أمثلة حية", icon: Images },
    { id: "reviews", label: "التقييمات", icon: Star },
    { id: "settings", label: "الإعدادات", icon: Settings },
];

export const AdminSidebar = ({ activeTab, onTabChange, isMobile }: SidebarProps) => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        cleanupNotifications();
        await adminLogout();
        navigate("/admin/login");
    };

    // Auto-scroll active tab into view on mobile
    useEffect(() => {
        if (isMobile && scrollContainerRef.current) {
            const activeElement = scrollContainerRef.current.querySelector('[data-active="true"]');
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeTab, isMobile]);

    if (isMobile) {
        return (
            <div className="fixed top-[57px] left-0 right-0 z-40 bg-slate-900/95 light:bg-slate-100/95 backdrop-blur-xl border-b border-slate-800/50 light:border-slate-300/50">
                <div
                    ref={scrollContainerRef}
                    className="flex items-center gap-2 px-4 py-3 overflow-x-auto hide-scrollbar"
                >
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                data-active={isActive}
                                onClick={() => onTabChange(item.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 ${isActive
                                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 light:text-purple-600 border border-purple-500/30"
                                        : "text-slate-400 hover:text-slate-200 light:text-slate-500 light:hover:text-slate-800 bg-slate-800/30 light:bg-slate-200/50 border border-transparent"
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? "text-purple-400 light:text-purple-600" : ""}`} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                    <div className="w-px h-8 bg-slate-800/50 light:bg-slate-300/50 mx-2 shrink-0" />
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-red-400 hover:bg-red-500/10 transition-all duration-200 shrink-0"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium text-sm">خروج</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.aside
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-20 right-0 bottom-0 w-64 bg-slate-900/80 light:bg-slate-100/80 backdrop-blur-2xl border-l border-slate-800/50 light:border-slate-300/50 z-30 flex flex-col"
        >
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 light:text-purple-600 border border-purple-500/30 shadow-sm"
                                    : "text-slate-400 hover:text-white light:text-slate-500 light:hover:text-slate-800 hover:bg-slate-800/50 light:hover:bg-slate-200/50 border border-transparent"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-purple-400 light:text-purple-600" : ""}`} />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="mr-auto w-2 h-2 bg-purple-400 light:bg-purple-600 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800/50 light:border-slate-300/50 mb-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">تسجيل الخروج</span>
                </button>
            </div>
        </motion.aside>
    );
};

export default AdminSidebar;
