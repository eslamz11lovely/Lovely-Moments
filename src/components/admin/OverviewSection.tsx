import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, ShoppingCart, Clock, TrendingUp, DollarSign, Wallet } from "lucide-react";
import { Order, getOrders } from "../../services/ordersService";
import HeartLoader from "../HeartLoader";

// Helper function to format date
const formatDate = (timestamp: any): string => {
    if (!timestamp) return "غير محدد";
    if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString("ar-SA");
    }
    if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString("ar-SA");
    }
    return "غير محدد";
};

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    delay: number;
}

const StatsCard = ({ title, value, icon: Icon, color, delay }: StatsCardProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.4, type: "spring", stiffness: 100 }}
        className="relative overflow-hidden group rounded-2xl p-[1px]"
    >
        {/* Subtle animated border gradient */}
        <span className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-slate-800/10 group-hover:from-purple-500/50 group-hover:to-pink-500/50 transition-colors duration-500" />

        <div className="relative h-full bg-slate-900/90 backdrop-blur-2xl rounded-2xl p-6 transition-all duration-300">
            <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity duration-500`} />
            <div className="relative flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-slate-400 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
                </div>
                <div className={`p-4 rounded-xl ${color} bg-opacity-10 ring-1 ring-inset ${color.replace('bg-', 'ring-').replace('500', '500/20')}`}>
                    <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
                </div>
            </div>
        </div>
    </motion.div>
);

export const OverviewSection = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getOrders();
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const totalOrders = orders.length;

    // Calculate most selected package
    const packageCounts = orders.reduce((acc, order) => {
        const pkg = order.package || "غير محدد";
        acc[pkg] = (acc[pkg] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const mostSelectedPackage = Object.entries(packageCounts).reduce(
        (max, [pkg, count]) => (count > max.count ? { pkg, count } : max),
        { pkg: "لا توجد طلبات", count: 0 }
    );



    // Extract Total Revenue/Profit from orders (getting digits from package name)
    const totalRevenue = orders.reduce((sum, order) => {
        if (!order.package) return sum;
        const match = order.package.match(/\d+/);
        if (match) {
            return sum + parseInt(match[0], 10);
        }
        return sum;
    }, 0);

    const pendingOrders = orders.filter(
        (o) => o.status === "جاري التنفيذ" || o.status === "جديد"
    ).length;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <HeartLoader />
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl font-bold text-white">لوحة التحكم</h2>
                <p className="text-slate-400">مرحباً بك في لوحة تحكم الأدمن</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard
                    title="المكسب الإجمالي"
                    value={`${totalRevenue.toLocaleString()} ج.م`}
                    icon={Wallet}
                    color="bg-emerald-500"
                    delay={0.1}
                />
                <StatsCard
                    title="إجمالي الطلبات"
                    value={totalOrders}
                    icon={ShoppingCart}
                    color="bg-blue-500"
                    delay={0.2}
                />
                <StatsCard
                    title="الطلبات المتبقية"
                    value={pendingOrders}
                    icon={Clock}
                    color="bg-amber-500"
                    delay={0.3}
                />
                <StatsCard
                    title="الباقة الأكثر طلباً"
                    value={mostSelectedPackage.pkg.replace(/\d+ جنيه/g, "").trim() || mostSelectedPackage.pkg}
                    icon={Package}
                    color="bg-purple-500"
                    delay={0.4}
                />
                <StatsCard
                    title="نسبة الإنجاز"
                    value={`${totalOrders > 0 ? Math.round(((totalOrders - pendingOrders) / totalOrders) * 100) : 0}%`}
                    icon={TrendingUp}
                    color="bg-pink-500"
                    delay={0.5}
                />
            </div>

        </motion.div>
    );
};

export default OverviewSection;
