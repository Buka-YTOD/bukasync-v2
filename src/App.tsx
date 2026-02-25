import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";

const GuestMenu = lazy(() => import("./pages/GuestMenu"));
const DashboardLogin = lazy(() => import("./pages/DashboardLogin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Shop = lazy(() => import("./pages/Shop"));
const ShopRestaurant = lazy(() => import("./pages/ShopRestaurant"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const Fallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/menu" element={<GuestMenu />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ShopRestaurant />} />
            <Route path="/login" element={<DashboardLogin />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
