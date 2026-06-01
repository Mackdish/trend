import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import CartDrawer from "@/components/cart/CartDrawer";
import Index from "./pages/Index.tsx";
import Catalog from "./pages/Catalog.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Auth from "./pages/Auth.tsx";
import Checkout from "./pages/Checkout.tsx";
import Cart from "./pages/Cart.tsx";
import NotFound from "./pages/NotFound.tsx";
import ContactUs from "./pages/ContactUs.tsx";
import AboutUs from "./pages/AboutUs.tsx";
import FAQs from "./pages/FAQs.tsx";
import ShippingInfo from "./pages/ShippingInfo.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import TermsOfService from "./pages/TermsOfService.tsx";
import Returns from "./pages/Returns.tsx";
import SizeGuide from "./pages/SizeGuide.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPostPage from "./pages/BlogPost.tsx";
import ChatWidget from "@/components/chat/ChatWidget";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import AdminOrders from "@/pages/admin/Orders";
import AdminCustomers from "@/pages/admin/Customers";
import AdminCategories from "@/pages/admin/Categories";
import AdminReviews from "@/pages/admin/Reviews";
import AdminAnalytics from "@/pages/admin/Analytics";
import AdminCoupons from "@/pages/admin/Coupons";
import AdminMarketing from "@/pages/admin/Marketing";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminBlog from "@/pages/admin/BlogPosts";
import AdminPromotions from "@/pages/admin/Promotions";
import AdminHeroSlides from "@/pages/admin/HeroSlides";
import AccountLayout from "@/pages/account/AccountLayout";
import MyOrders from "@/pages/account/MyOrders";
import MyWishlist from "@/pages/account/MyWishlist";
import AccountSettingsPage from "@/pages/account/AccountSettings";
import RequireAuth from "@/components/auth/RequireAuth";
import MobileStickyNav from "@/components/layout/MobileStickyNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CartDrawer />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/shipping" element={<ShippingInfo />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/size-guide" element={<SizeGuide />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />

              <Route path="/account" element={<AccountLayout />}>
                <Route index element={<Navigate to="/account/orders" replace />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="wishlist" element={<MyWishlist />} />
                <Route path="settings" element={<AccountSettingsPage />} />
              </Route>

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="hero-slides" element={<AdminHeroSlides />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="marketing" element={<AdminMarketing />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatWidget />
            <MobileStickyNav />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
