import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Trash2, Loader2, Mail, User } from "lucide-react";
import { Message, getMessages, deleteMessage } from "../../services/firestore";
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

export const MessagesSection = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            const data = await getMessages();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDeleteMessage = async (messageId: string) => {
        try {
            await deleteMessage(messageId);
            await fetchMessages();
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">الرسائل</h2>
                    <p className="text-slate-400">صندوق الرسائل الواردة</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">{messages.length}</span>
                    <span className="text-slate-400 text-sm">رسالة</span>
                </div>
            </div>

            {/* Messages Grid */}
            {messages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {messages.map((message, index) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300 group"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{message.name}</p>
                                        <p className="text-slate-400 text-xs">{formatDate(message.createdAt)}</p>
                                    </div>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="حذف"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-slate-800 border-slate-700">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">حذف الرسالة</AlertDialogTitle>
                                            <AlertDialogDescription className="text-slate-400">
                                                هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">إلغاء</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDeleteMessage(message.id)}
                                                className="bg-red-500 text-white hover:bg-red-600"
                                            >
                                                حذف
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-2 mb-3 text-slate-400">
                                <Mail className="w-4 h-4" />
                                <a
                                    href={`mailto:${message.email}`}
                                    className="text-sm hover:text-purple-400 transition-colors"
                                >
                                    {message.email}
                                </a>
                            </div>

                            {/* Message Content */}
                            <div className="bg-slate-900/50 rounded-xl p-4">
                                <p className="text-slate-300 text-sm leading-relaxed">{message.message}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-10 h-10 text-slate-600" />
                    </div>
                    <p className="text-slate-400 text-lg">لا توجد رسائل بعد</p>
                    <p className="text-slate-500 text-sm">الرسائل التي تأتي من نموذج الاتصال ستظهر هنا</p>
                </div>
            )}
        </div>
    );
};

export default MessagesSection;
