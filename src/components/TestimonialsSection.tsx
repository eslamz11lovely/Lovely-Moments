import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHomepageReviews, type Review } from "@/services/reviewsService";
import { Star, Sparkles, ArrowLeft } from "lucide-react";

const FALLBACK_TESTIMONIALS: Omit<Review, "id" | "createdAt" | "approved" | "showOnHome" | "displayOrder" | "status">[] = [
    { customerName: "سارة أحمد", reviewText: "هدية مختلفة ومميزة جداً! فرحت صاحبتي بيها أوي 💕", rating: 5, imageUrl: null, featured: false },
    { customerName: "محمد علي", reviewText: "خدمة ممتازة وتصميم راقي، الكل اتبسط من الهدية 🎁", rating: 5, imageUrl: null, featured: false },
    { customerName: "نورهان خالد", reviewText: "أحلى حاجة عملتها لخطيبي في عيد ميلاده، شكراً Lovely Moments ❤️", rating: 5, imageUrl: null, featured: false },
];

const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 ${filled ? "text-amber-400" : "text-slate-600 opacity-40"}`}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

type TestimonialItem = {
    id?: string;
    customerName: string;
    reviewText: string;
    rating: number;
    imageUrl?: string | null;
    featured?: boolean;
};

const TestimonialsSection = () => {
    const [items, setItems] = useState<TestimonialItem[]>(FALLBACK_TESTIMONIALS as TestimonialItem[]);

    useEffect(() => {
        getHomepageReviews()
            .then((reviews) => {
                if (reviews.length > 0) {
                    setItems(reviews.slice(0, 3)); // Only take top 3 for lightweight homepage
                }
            })
            .catch(() => {
                // Keep fallback silently
            });
    }, []);

    return (
        <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-tajawal mb-3">
                        آراء <span className="gradient-text">عملائنا</span>
                    </h2>
                    <p className="text-muted-foreground font-cairo text-sm md:text-base">
                        اللي جربوا Lovely Moments بيقولوا إيه 💬
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {items.slice(0, 3).map((t, i) => (
                        <div
                            key={i}
                            className={`glass-card rounded-2xl p-6 flex flex-col hover:-translate-y-2 transition-transform duration-300 ${t.featured ? "border border-amber-500/30" : ""}`}
                            style={{ border: t.featured ? undefined : "1px solid var(--glass-border)" }}
                        >
                            {/* Featured badge */}
                            {t.featured && (
                                <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold mb-2">
                                    <Sparkles className="w-3 h-3" />
                                    مميز
                                </div>
                            )}

                            {/* Stars */}
                            <div className="flex gap-0.5 mb-4" dir="ltr">
                                {Array.from({ length: 5 }).map((_, s) => (
                                    <StarIcon key={s} filled={s < t.rating} />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="font-cairo text-sm leading-relaxed text-foreground/85 mb-6 flex-grow">
                                &ldquo;{t.reviewText}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 mt-auto">
                                {t.imageUrl ? (
                                    <img
                                        src={t.imageUrl}
                                        alt={t.customerName}
                                        loading="lazy"
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                        style={{ background: "var(--gradient-primary)" }}
                                    >
                                        {t.customerName.charAt(0)}
                                    </div>
                                )}
                                <span className="font-tajawal text-sm font-semibold">
                                    {t.customerName}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12 space-y-3">
                    <p className="font-cairo text-sm text-muted-foreground">
                        تحب تشاركنا رأيك؟
                    </p>
                    <Link
                        to="/reviews"
                        className="inline-flex items-center gap-2 glow-button text-white font-tajawal font-bold px-6 py-3 rounded-xl text-sm transition-transform duration-300 hover:scale-105"
                    >
                        <Star className="w-4 h-4 fill-white" />
                        اكتب تقييمك الآن
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
