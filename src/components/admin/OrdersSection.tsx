import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Trash2,
    Eye,
    X,
    CheckCircle,
    Clock,
    Loader2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Copy,
    Check,
    Bell,
    BellRing,
    Download,
    StickyNote
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Order, getOrders, updateOrderStatus, deleteOrder, subscribeToOrders, updateOrder } from "../../services/ordersService";
import HeartLoader from "../HeartLoader";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ORDERS_PER_PAGE = 10;

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

// Open WhatsApp with +2 prefix
const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\s+/g, "").replace(/^0/, "");
    const waLink = `https://wa.me/+2${phone.replace(/\s+/g, "")}`;
    window.open(waLink, "_blank");
};

export const OrdersSection = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Notes modal state
    const [noteModalOrder, setNoteModalOrder] = useState<Order | null>(null);
    const [currentNote, setCurrentNote] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);

    const [viewedOrderIds, setViewedOrderIds] = useState<Set<string>>(() => {
        const saved = localStorage.getItem("viewedOrderIds");
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const markAsViewed = useCallback((id: string) => {
        setViewedOrderIds((prev) => {
            if (!prev.has(id)) {
                const newSet = new Set(prev);
                newSet.add(id);
                localStorage.setItem("viewedOrderIds", JSON.stringify(Array.from(newSet)));
                return newSet;
            }
            return prev;
        });
    }, []);

    const prevOrdersCount = useRef<number>(0);
    const isInitialLoad = useRef<boolean>(true);
    const audioContextRef = useRef<AudioContext | null>(null);

    // ── Sound Notification System ──────────────────────────────────
    const playNotification = useCallback(() => {
        if (!soundEnabled) return;

        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const audioCtx = audioContextRef.current;
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const createChime = (freq: number, startTime: number, duration: number) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                // Soft sine wave for a clean chime
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                // Attack and Release Envelope
                gain.gain.setValueAtTime(0, startTime);
                // Quick attack
                gain.gain.linearRampToValueAtTime(0.5, startTime + 0.03);
                // Smooth exponential decay (using 0.01 since strictly 0 is invalid for exponential ramp)
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

                osc.start(startTime);
                osc.stop(startTime + duration);

                // Add a subtle harmonic (an octave higher) for richness
                const harmOsc = audioCtx.createOscillator();
                const harmGain = audioCtx.createGain();
                harmOsc.type = 'triangle';
                harmOsc.frequency.setValueAtTime(freq * 2, startTime);
                harmOsc.connect(harmGain);
                harmGain.connect(audioCtx.destination);

                harmGain.gain.setValueAtTime(0, startTime);
                harmGain.gain.linearRampToValueAtTime(0.1, startTime + 0.03);
                harmGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 0.7);

                harmOsc.start(startTime);
                harmOsc.stop(startTime + duration * 0.7);
            };

            const now = audioCtx.currentTime;
            // A pleasant, modern ascending chime sequence
            createChime(523.25, now, 0.4);        // C5
            createChime(659.25, now + 0.12, 0.4); // E5
            createChime(1046.50, now + 0.25, 1.0); // C6 - let the last note ring out beautifully
        } catch (error) {
            console.error("أخفق تشغيل الصوت", error);
        }
    }, [soundEnabled]);

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

    useEffect(() => {
        const unsubscribe = subscribeToOrders(
            (newOrders) => {
                setOrders(newOrders);
                setIsLoading(false);

                // Detect new orders for sound notification
                if (isInitialLoad.current) {
                    isInitialLoad.current = false;
                    prevOrdersCount.current = newOrders.length;
                } else {
                    if (newOrders.length > prevOrdersCount.current) {
                        toast.success("طلب جديد!", {
                            description: "يوجد طلب جديد في الانتظار",
                            position: "top-center"
                        });
                        playNotification();
                    }
                    prevOrdersCount.current = newOrders.length;
                }
            },
            () => setIsLoading(false)
        );
        return () => unsubscribe();
    }, [playNotification]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setIsUpdating(true);
        markAsViewed(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
            await fetchOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            console.error("Error updating order:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        try {
            await deleteOrder(orderId);
            await fetchOrders();
            if (selectedOrder?.id === orderId) setSelectedOrder(null);
        } catch (error) {
            console.error("Error deleting order:", error);
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleDownloadExcel = () => {
        const excelData = filteredOrders.map(order => ({
            "كود الطلب": order.orderCode || "---",
            "الاسم": order.name,
            "رقم الموبايل": order.phone,
            "الباقة": order.package,
            "المناسبة": order.occasion,
            "حالة الطلب": order.status,
            "تاريخ الطلب": formatDate(order.createdAt),
            "ملاحظات": order.notes || "لا يوجد",
            "تفاصيل الهدية": order.details || "لا يوجد",
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Auto-width for columns
        worksheet['!cols'] = [
            { wch: 15 }, // Code
            { wch: 25 }, // Name
            { wch: 20 }, // Phone
            { wch: 20 }, // Package
            { wch: 20 }, // Occasion
            { wch: 15 }, // Status
            { wch: 15 }, // Date
            { wch: 30 }, // Notes
            { wch: 40 }, // Details
        ];

        // Set right to left view
        if (!worksheet['!views']) worksheet['!views'] = [];
        worksheet['!views'].push({ rightToLeft: true });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "الطلبات");

        XLSX.writeFile(workbook, `الطلبات_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("تم تحميل الطلبات كملف إكسيل بنجاح");
    };

    const handleSaveNote = async () => {
        if (!noteModalOrder) return;
        setIsSavingNote(true);
        try {
            await updateOrder(noteModalOrder.id, { notes: currentNote });

            // Update local state directly so we don't wait for snapshot
            setOrders(orders.map(o => o.id === noteModalOrder.id ? { ...o, notes: currentNote } : o));

            toast.success("تم حفظ الملاحظة بنجاح");
            setNoteModalOrder(null);
        } catch (error) {
            toast.error("حدث خطأ أثناء حفظ الملاحظة");
        } finally {
            setIsSavingNote(false);
        }
    };

    // ── Search (by name, phone, package, or orderCode) ──────────────────
    const filteredOrders = orders.filter(
        (order) => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return true;
            return (
                order.name?.toLowerCase().includes(term) ||
                order.phone?.includes(term) ||
                order.package?.toLowerCase().includes(term) ||
                (order.orderCode && order.orderCode.toLowerCase().includes(term))
            );
        }
    );

    // ── Pagination ──────────────────────────────────────────────────────
    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ORDERS_PER_PAGE,
        currentPage * ORDERS_PER_PAGE
    );

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "جديد":
                return "bg-blue-500/20 text-blue-400 border-blue-500/50";
            case "جاري التنفيذ":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
            case "تم التنفيذ":
                return "bg-green-500/20 text-green-400 border-green-500/50";
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500/30";
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <HeartLoader />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-white">الطلبات</h2>
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium border ${soundEnabled
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-slate-700'
                                }`}
                            title={soundEnabled ? "كتم إشعارات الطلبات" : "تفعيل إشعارات الطلبات"}
                        >
                            {soundEnabled ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                            {soundEnabled ? "الصوت مفعل" : "الصوت مكتوم"}
                        </button>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                        إجمالي: {orders.length} طلب
                        {searchTerm && ` | نتائج البحث: ${filteredOrders.length}`}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    <button
                        onClick={handleDownloadExcel}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-all font-medium text-sm w-full md:w-auto overflow-hidden relative group"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <Download className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">تنزيل إكسيل</span>
                    </button>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الموبايل أو كود الطلب..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 pl-4 pr-10 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50">
                                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">الكود</th>
                                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">الاسم</th>
                                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">الموبايل</th>
                                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">الباقة</th>
                                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">الحالة</th>
                                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">التاريخ</th>
                                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.length > 0 ? (
                                paginatedOrders.map((order, index) => {
                                    const isNewOrder = order.status === "جديد" && !viewedOrderIds.has(order.id);

                                    return (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => {
                                                if (isNewOrder) markAsViewed(order.id);
                                            }}
                                            className={`border-b transition-all duration-300 ${isNewOrder
                                                ? "border-blue-500/50 bg-blue-900/30 hover:bg-blue-800/40 relative shadow-[inset_4px_0_0_rgba(59,130,246,1)]"
                                                : "border-slate-700/30 hover:bg-slate-700/20"
                                                }`}
                                        >
                                            {/* Order Code */}
                                            <td className="px-4 py-3">
                                                {order.orderCode ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopyCode(order.orderCode);
                                                        }}
                                                        className="flex items-center gap-1 text-xs font-mono text-purple-400 hover:text-purple-300 transition-colors"
                                                        title="نسخ الكود"
                                                    >
                                                        {copiedCode === order.orderCode ? (
                                                            <Check className="w-3 h-3 text-emerald-400" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                        <span dir="ltr">{order.orderCode}</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-500">—</span>
                                                )}
                                            </td>

                                            {/* Name */}
                                            <td className="px-4 py-3 text-white font-medium text-sm">{order.name}</td>

                                            {/* Phone — WhatsApp link */}
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => openWhatsApp(order.phone)}
                                                    className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors group"
                                                    title="فتح واتساب"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                    <span dir="ltr">{order.phone}</span>
                                                </button>
                                            </td>

                                            {/* Package — price only */}
                                            <td className="px-4 py-3 text-slate-300 text-sm font-medium">{order.package}</td>

                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <select
                                                    value={order.status}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isNewOrder) markAsViewed(order.id);
                                                    }}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    disabled={isUpdating}
                                                    className={`px-3 py-1 rounded-full text-[11px] font-bold border outline-none appearance-none cursor-pointer text-center transition-all min-w-[90px] ${getStatusColor(order.status)}`}
                                                    title="اضغط لتغيير الحالة"
                                                    dir="rtl"
                                                >
                                                    <option value="جديد" className="bg-slate-800 text-blue-400 font-bold">جديد</option>
                                                    <option value="جاري التنفيذ" className="bg-slate-800 text-yellow-400 font-bold">جاري التنفيذ</option>
                                                    <option value="تم التنفيذ" className="bg-slate-800 text-green-400 font-bold">تم التنفيذ</option>
                                                </select>
                                            </td>

                                            {/* Date */}
                                            <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(order.createdAt)}</td>

                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 font-sans">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedOrder(order);
                                                            if (isNewOrder) markAsViewed(order.id);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setNoteModalOrder(order);
                                                            setCurrentNote(order.notes || "");
                                                        }}
                                                        className={`p-1.5 rounded-lg transition-colors ${order.notes
                                                            ? "text-amber-400 hover:bg-amber-500/20 bg-amber-500/10"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}
                                                        title={order.notes ? "تعديل الملاحظات" : "إضافة ملاحظة"}
                                                    >
                                                        <StickyNote className="w-4 h-4" />
                                                    </button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button
                                                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                title="حذف"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-slate-800 border-slate-700">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-white">حذف الطلب</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-slate-400">
                                                                    هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">إلغاء</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteOrder(order.id)}
                                                                    className="bg-red-500 text-white hover:bg-red-600"
                                                                >
                                                                    حذف
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm">
                                        {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد طلبات بعد"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ────────────────────────────────────────── */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
                        <p className="text-xs text-slate-500">
                            صفحة {currentPage} من {totalPages}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${currentPage === page
                                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/40"
                                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Order Detail Modal ────────────────────────────────── */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 w-full max-w-xl max-h-[85vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
                                <div>
                                    <h3 className="text-lg font-bold text-white">تفاصيل الطلب</h3>
                                    {selectedOrder.orderCode && (
                                        <p className="text-xs text-purple-400 font-mono mt-0.5" dir="ltr">
                                            {selectedOrder.orderCode}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-slate-900/50 rounded-xl p-3">
                                        <p className="text-slate-400 text-[10px] mb-0.5">الاسم</p>
                                        <p className="text-white font-medium text-sm">{selectedOrder.name}</p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-xl p-3">
                                        <p className="text-slate-400 text-[10px] mb-0.5">رقم الموبايل</p>
                                        <button
                                            onClick={() => openWhatsApp(selectedOrder.phone)}
                                            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            <span dir="ltr">{selectedOrder.phone}</span>
                                        </button>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-xl p-3">
                                        <p className="text-slate-400 text-[10px] mb-0.5">المناسبة</p>
                                        <p className="text-white font-medium text-sm">{selectedOrder.occasion}</p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-xl p-3">
                                        <p className="text-slate-400 text-[10px] mb-0.5">الباقة</p>
                                        <p className="text-white font-medium text-sm">{selectedOrder.package}</p>
                                    </div>
                                    {selectedOrder.orderCode && (
                                        <div className="bg-slate-900/50 rounded-xl p-3">
                                            <p className="text-slate-400 text-[10px] mb-0.5">كود الطلب</p>
                                            <p className="text-purple-400 font-mono font-bold text-sm" dir="ltr">{selectedOrder.orderCode}</p>
                                        </div>
                                    )}
                                    <div className="bg-slate-900/50 rounded-xl p-3">
                                        <p className="text-slate-400 text-[10px] mb-0.5">التاريخ</p>
                                        <p className="text-white font-medium text-sm">{formatDate(selectedOrder.createdAt)}</p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-xl p-3 md:col-span-2">
                                        <p className="text-slate-400 text-[10px] mb-0.5">تفاصيل الهدية</p>
                                        <p className="text-white font-medium text-sm">{selectedOrder.details || "لا توجد تفاصيل"}</p>
                                    </div>
                                </div>

                                {/* Status Actions */}
                                <div className="space-y-2">
                                    <p className="text-slate-400 text-xs">تغيير الحالة:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { label: "جديد", icon: AlertCircle },
                                            { label: "جاري التنفيذ", icon: Clock },
                                            { label: "تم التنفيذ", icon: CheckCircle },
                                        ].map(({ label, icon: Icon }) => (
                                            <button
                                                key={label}
                                                onClick={() => handleStatusChange(selectedOrder.id, label)}
                                                disabled={isUpdating}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition-all ${selectedOrder.status === label
                                                    ? getStatusColor(label)
                                                    : "bg-slate-900/50 text-slate-400 border-slate-700 hover:border-slate-600"
                                                    }`}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* ── Notes Modal ──────────────────────────────────── */}
            <AnimatePresence>
                {noteModalOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setNoteModalOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-slate-800/80">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <StickyNote className="w-5 h-5 text-amber-400" />
                                        ملاحظات الطلب
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1">
                                        العميل: {noteModalOrder.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setNoteModalOrder(null)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-5 flex flex-col gap-4">
                                <textarea
                                    value={currentNote}
                                    onChange={(e) => setCurrentNote(e.target.value)}
                                    placeholder="اكتب ملاحظاتك هنا (مثل: العميل يفضل استلام الهدية مغلفة باللون الأحمر...)"
                                    className="w-full h-40 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none transition-all"
                                    dir="auto"
                                />

                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/50">
                                    <button
                                        onClick={() => setNoteModalOrder(null)}
                                        className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/30 transition-colors text-sm font-medium"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={handleSaveNote}
                                        disabled={isSavingNote}
                                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-amber-500/20"
                                    >
                                        {isSavingNote ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                حفظ الملاحظة
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrdersSection;
