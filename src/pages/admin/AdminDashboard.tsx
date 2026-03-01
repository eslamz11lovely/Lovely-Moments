import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { OverviewSection } from "../../components/admin/OverviewSection";
import { OrdersSection } from "../../components/admin/OrdersSection";
import { PricingSection } from "../../components/admin/PricingSection";
import { ExamplesSection } from "../../components/admin/ExamplesSection";
import { SettingsSection } from "../../components/admin/SettingsSection";
import { NotificationBanner } from "../../components/admin/NotificationBanner";

const isMobile = window.innerWidth < 768;

export const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                return <OverviewSection />;
            case "orders":
                return <OrdersSection />;
            case "pricing":
                return <PricingSection />;
            case "examples":
                return <ExamplesSection />;
            case "settings":
                return <SettingsSection />;
            default:
                return <OverviewSection />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" dir="rtl">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
            </div>

            {/* Sidebar */}
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isMobile={isMobileView}
            />

            {/* Main Content */}
            <main
                className={`transition-all duration-300 ${isMobileView ? "pt-20 px-4" : "mr-64 p-8"
                    }`}
            >
                <div className="max-w-7xl mx-auto">
                    {/* Notification Banner */}
                    <NotificationBanner />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
