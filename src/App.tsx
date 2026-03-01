import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "@/hooks/useTheme";
import FloatingHearts from "@/components/FloatingHearts";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollToTopOnRouteChange from "@/components/ScrollToTopOnRouteChange";
import ProtectedRoute from "@/components/ProtectedRoute";
import HeartLoader from "@/components/HeartLoader";
import { Analytics } from "@vercel/analytics/react";

// Lazy Loaded Pages
const HomePage = lazy(() => import("@/pages/HomePage"));
const LiveExamplePage = lazy(() => import("@/pages/LiveExamplePage"));
const ExamplePreviewPage = lazy(() => import("@/pages/ExamplePreviewPage"));
const FeaturesPage = lazy(() => import("@/pages/FeaturesPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const OrderPage = lazy(() => import("@/pages/OrderPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));

const queryClient = new QueryClient();

// Loader fallback
const PageLoader = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center">
    <HeartLoader />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="relative min-h-screen flex flex-col">
            <FloatingHearts />
            <Navbar />
            <ScrollToTopOnRouteChange />
            <ScrollToTop />

            {/* Main content — padded for top bar (mobile) + desktop nav */}
            <main className="flex-1 pt-16 md:pt-20">
              <Suspense fallback={<PageLoader />}>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/live-example" element={<LiveExamplePage />} />
                    <Route path="/example/:id" element={<ExamplePreviewPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/order" element={<OrderPage />} />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                      path="/admin/*"
                      element={
                        <ProtectedRoute>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AnimatePresence>
              </Suspense>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
    <Analytics />
  </QueryClientProvider>
);

export default App;
