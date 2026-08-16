import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';
import { SeoController } from '@/components/SeoController';
import { DiscoveryProvider } from '@/context/DiscoveryContext';

import { PlaceholderPage } from '@/pages/PlaceholderPage';

const lazyPage = <T extends Record<string, unknown>, K extends keyof T>(
  loader: () => Promise<T>,
  exportName: K,
) => lazy(async () => ({ default: (await loader())[exportName] as ComponentType }));

const HomePage = lazyPage(() => import('@/pages/HomePage'), 'HomePage');
const ProductsPage = lazyPage(() => import('@/pages/ProductsPage'), 'ProductsPage');
const ProductDetailPage = lazyPage(() => import('@/pages/ProductDetailPage'), 'ProductDetailPage');
const CategoriesPage = lazyPage(() => import('@/pages/CategoriesPage'), 'CategoriesPage');
const ServicesPage = lazyPage(() => import('@/pages/ServicesPage'), 'ServicesPage');
const SupportPage = lazyPage(() => import('@/pages/SupportPage'), 'SupportPage');
const ContactPage = lazyPage(() => import('@/pages/ContactPage'), 'ContactPage');
const FaqPage = lazyPage(() => import('@/pages/FaqPage'), 'FaqPage');
const AboutPage = lazyPage(() => import('@/pages/AboutPage'), 'AboutPage');
const CartPage = lazyPage(() => import('@/pages/CartPage'), 'CartPage');
const CheckoutPage = lazyPage(() => import('@/pages/CheckoutPage'), 'CheckoutPage');
const PaymentResultPage = lazyPage(() => import('@/pages/PaymentResultPage'), 'PaymentResultPage');
const OrderSuccessPage = lazyPage(() => import('@/pages/OrderSuccessPage'), 'OrderSuccessPage');
const WishlistPage = lazyPage(() => import('@/pages/discovery/WishlistPage'), 'WishlistPage');
const AccountWishlistPage = lazyPage(() => import('@/pages/account/AccountWishlistPage'), 'AccountWishlistPage');
const AccountOverviewPage = lazyPage(() => import('@/pages/account/AccountOverviewPage'), 'AccountOverviewPage');
const AccountOrdersPage = lazyPage(() => import('@/pages/account/AccountOrdersPage'), 'AccountOrdersPage');
const AccountDownloadsPage = lazyPage(() => import('@/pages/account/AccountDownloadsPage'), 'AccountDownloadsPage');
const AccountOrderDetailPage = lazyPage(() => import('@/pages/account/AccountOrderDetailPage'), 'AccountOrderDetailPage');
const AccountLicensesPage = lazyPage(() => import('@/pages/account/AccountLicensesPage'), 'AccountLicensesPage');
const AccountSettingsPage = lazyPage(() => import('@/pages/account/AccountSettingsPage'), 'AccountSettingsPage');
const AccountReviewsPage = lazyPage(() => import('@/pages/account/AccountReviewsPage'), 'AccountReviewsPage');
const AccountProfilePage = lazyPage(() => import('@/pages/account/AccountProfilePage'), 'AccountProfilePage');
const AccountSecurityPage = lazyPage(() => import('@/pages/account/AccountSecurityPage'), 'AccountSecurityPage');
const SetPasswordPage = lazyPage(() => import('@/pages/account/SetPasswordPage'), 'SetPasswordPage');
const LoginPage = lazyPage(() => import('@/pages/auth/LoginPage'), 'LoginPage');
const AuthCallbackPage = lazyPage(() => import('@/pages/auth/AuthCallbackPage'), 'AuthCallbackPage');
const TermsPage = lazyPage(() => import('@/pages/LegalPages'), 'TermsPage');
const PrivacyPage = lazyPage(() => import('@/pages/LegalPages'), 'PrivacyPage');
const RefundPolicyPage = lazyPage(() => import('@/pages/LegalPages'), 'RefundPolicyPage');
const DeliveryPolicyPage = lazyPage(() => import('@/pages/LegalPages'), 'DeliveryPolicyPage');
const AdminLoginPage = lazyPage(() => import('@/pages/admin/AdminLoginPage'), 'AdminLoginPage');
const AdminLayout = lazy(async () => ({ default: (await import('@/components/admin/AdminLayout')).AdminLayout }));
const AdminDashboardPage = lazyPage(() => import('@/pages/admin/AdminDashboardPage'), 'AdminDashboardPage');
const AdminProductsPage = lazyPage(() => import('@/pages/admin/AdminProductsPage'), 'AdminProductsPage');
const AdminProductImporterPage = lazyPage(() => import('@/pages/admin/AdminProductImporterPage'), 'AdminProductImporterPage');
const ProductEditor = lazy(async () => ({ default: (await import('@/pages/admin/ProductEditor')).ProductEditor }));
const AdminCategoriesPage = lazyPage(() => import('@/pages/admin/AdminCategoriesPage'), 'AdminCategoriesPage');
const AdminSettingsPage = lazyPage(() => import('@/pages/admin/AdminSettingsPage'), 'AdminSettingsPage');
const AdminSeoPage = lazyPage(() => import('@/pages/admin/AdminSeoPage'), 'AdminSeoPage');
const AdminMediaPage = lazyPage(() => import('@/pages/admin/AdminMediaPage'), 'AdminMediaPage');
const AdminOrdersPage = lazyPage(() => import('@/pages/admin/AdminOrdersPage'), 'AdminOrdersPage');
const AdminManualPaymentsPage = lazyPage(() => import('@/pages/admin/AdminManualPaymentsPage'), 'AdminManualPaymentsPage');
const AdminOrderDetailPage = lazyPage(() => import('@/pages/admin/AdminOrderDetailPage'), 'AdminOrderDetailPage');
const AdminEmailPreviewPage = lazyPage(() => import('@/pages/admin/AdminEmailPreviewPage'), 'AdminEmailPreviewPage');
const AdminReviewsPage = lazyPage(() => import('@/pages/admin/AdminReviewsPage'), 'AdminReviewsPage');
const AdminAnalyticsPage = lazyPage(() => import('@/pages/admin/AdminAnalyticsPage'), 'AdminAnalyticsPage');
const AdminDiscountsPage = lazyPage(() => import('@/pages/admin/AdminDiscountsPage'), 'AdminDiscountsPage');
const AdminCouponEditorPage = lazyPage(() => import('@/pages/admin/AdminCouponEditorPage'), 'AdminCouponEditorPage');
const AdminPromotionEditorPage = lazyPage(() => import('@/pages/admin/AdminPromotionEditorPage'), 'AdminPromotionEditorPage');
const AdminFulfillmentEditorPage = lazyPage(() => import('@/pages/admin/AdminFulfillmentEditorPage'), 'AdminFulfillmentEditorPage');
const AdminLicenseInventoryPage = lazyPage(() => import('@/pages/admin/AdminLicenseInventoryPage'), 'AdminLicenseInventoryPage');

function RouteFallback() {
  return <div className="flex min-h-[45vh] items-center justify-center" role="status" aria-label="Loading page"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></div>;
}

function AdminProductEditRoute() {
  const { id } = useParams();
  return <AdminLayout><ProductEditor productId={id} /></AdminLayout>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <SiteSettingsProvider>
          <AdminAuthProvider>
            <CustomerAuthProvider>
              <DiscoveryProvider>
              <ScrollToTop />
              <SeoController />
              <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route
          path="/services/:slug"
          element={
            <PlaceholderPage
              title="Service Details"
              description="Detailed information about this service, including scope, process, and how to get started, will be available here."
              backLink="/services"
              backLabel="Back to Services"
            />
          }
        />
        <Route
          path="/wordpress"
          element={
            <PlaceholderPage
              title="WordPress Products"
              description="Browse our complete collection of WordPress themes, plugins, and templates — all in one place."
              backLink="/"
              backLabel="Back to Home"
            />
          }
        />
        <Route
          path="/resources"
          element={
            <PlaceholderPage
              title="Digital Resources"
              description="Templates, graphics, UI kits, and downloadable digital assets for designers and developers."
              backLink="/"
              backLabel="Back to Home"
            />
          }
        />
        <Route
          path="/deals"
          element={
            <PlaceholderPage
              title="Deals & Offers"
              description="Current promotions and discounted digital products. Check back regularly for new deals."
              backLink="/"
              backLabel="Back to Home"
            />
          }
        />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/success/:orderNumber" element={<OrderSuccessPage />} />
        <Route path="/payment/result" element={<PaymentResultPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/account" element={<AccountOverviewPage />} />
        <Route path="/account/wishlist" element={<AccountWishlistPage />} />
        <Route path="/account/orders" element={<AccountOrdersPage />} />
        <Route path="/account/downloads" element={<AccountDownloadsPage />} />
        <Route path="/account/licenses" element={<AccountLicensesPage />} />
        <Route path="/account/reviews" element={<AccountReviewsPage />} />
        <Route path="/account/settings" element={<AccountSettingsPage />} />
        <Route path="/account/orders/:id" element={<AccountOrderDetailPage />} />
        <Route path="/account/profile" element={<AccountProfilePage />} />
        <Route path="/account/security" element={<AccountSecurityPage />} />
        <Route path="/account/set-password" element={<SetPasswordPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/delivery-policy" element={<DeliveryPolicyPage />} />
        <Route
          path="*"
          element={
            <PlaceholderPage
              title="Page not found"
              description="The page you're looking for doesn't exist or may have been moved."
            />
          }
        />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
          <Route path="/admin/products" element={<AdminLayout><AdminProductsPage /></AdminLayout>} />
          <Route path="/admin/imports" element={<AdminLayout><AdminProductImporterPage /></AdminLayout>} />
          <Route path="/admin/products/new" element={<AdminLayout><ProductEditor /></AdminLayout>} />
          <Route path="/admin/products/:id/edit" element={<AdminProductEditRoute />} />
          <Route path="/admin/categories" element={<AdminLayout><AdminCategoriesPage /></AdminLayout>} />
          <Route path="/admin/orders" element={<AdminLayout><AdminOrdersPage /></AdminLayout>} />
          <Route path="/admin/orders/:id" element={<AdminLayout><AdminOrderDetailPage /></AdminLayout>} />
          <Route path="/admin/payments/manual" element={<AdminLayout><AdminManualPaymentsPage /></AdminLayout>} />
          <Route path="/admin/emails/preview" element={<AdminLayout><AdminEmailPreviewPage /></AdminLayout>} />
          <Route path="/admin/reviews" element={<AdminLayout><AdminReviewsPage /></AdminLayout>} />
          <Route path="/admin/analytics" element={<AdminLayout><AdminAnalyticsPage /></AdminLayout>} />
          <Route path="/admin/discounts" element={<AdminLayout><AdminDiscountsPage /></AdminLayout>} />
          <Route path="/admin/discounts/coupons/new" element={<AdminLayout><AdminCouponEditorPage /></AdminLayout>} />
          <Route path="/admin/discounts/coupons/:id/edit" element={<AdminLayout><AdminCouponEditorPage /></AdminLayout>} />
          <Route path="/admin/discounts/promotions/new" element={<AdminLayout><AdminPromotionEditorPage /></AdminLayout>} />
          <Route path="/admin/discounts/promotions/:id/edit" element={<AdminLayout><AdminPromotionEditorPage /></AdminLayout>} />
          <Route path="/admin/orders/:orderId/fulfillment/:fulfillmentId" element={<AdminLayout><AdminFulfillmentEditorPage /></AdminLayout>} />
          <Route path="/admin/products/:id/licenses" element={<AdminLayout><AdminLicenseInventoryPage /></AdminLayout>} />
          <Route path="/admin/media" element={<AdminLayout><AdminMediaPage /></AdminLayout>} />
          <Route path="/admin/seo" element={<AdminLayout><AdminSeoPage /></AdminLayout>} />
          <Route path="/admin/settings" element={<AdminLayout><AdminSettingsPage /></AdminLayout>} />
          </Routes>
              </Suspense>
              </DiscoveryProvider>
            </CustomerAuthProvider>
          </AdminAuthProvider>
        </SiteSettingsProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
