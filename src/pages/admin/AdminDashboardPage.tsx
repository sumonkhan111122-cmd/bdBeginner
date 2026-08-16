import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, CheckCircle, FileEdit, Archive, FolderTree, Plus,
  AlertTriangle, Image as ImageIcon, Settings, Search,
  Link as LinkIcon, ShoppingBag, Clock3, LoaderCircle, Star, BarChart3
} from 'lucide-react';
import { fetchDashboardStats, type DashboardStats } from '@/services/admin';

const statusStyles: Record<string, string> = {
  published: 'bg-success-50 text-success-700 border-success-200',
  draft: 'bg-warning-50 text-warning-700 border-warning-200',
  archived: 'bg-ink-100 text-ink-600 border-ink-200',
};

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchDashboardStats()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err: unknown) => {
        console.error('Dashboard stats failed', err);
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Overview of your store and catalog</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 shadow-sm transition-colors hover:bg-ink-50"
          >
            <LinkIcon size={16} />
            View Store
          </a>
          <Link
            to="/admin/analytics"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 text-sm font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-100"
          >
            <BarChart3 size={16} />
            View Analytics
          </Link>
          <Link
            to="/admin/products/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <Plus size={16} />
            New Product
          </Link>
        </div>
      </div>

      {loading && (
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-ink-100 bg-white" />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
             <div className="h-64 animate-pulse rounded-2xl border border-ink-100 bg-white lg:col-span-2" />
             <div className="h-64 animate-pulse rounded-2xl border border-ink-100 bg-white" />
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="mt-8 rounded-2xl border border-error-200 bg-error-50 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-error-700">Failed to load dashboard data.</p>
          <p className="mt-1 text-xs text-error-600">Please try again in a moment.</p>
        </div>
      )}

      {!loading && !error && stats && (
        <div className="mt-8 space-y-8">
          {/* 1. PRIMARY SUMMARY CARDS */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <SummaryCard label="Total Products" value={stats.products.total} icon={Package} accent="text-brand-700 bg-brand-50" />
            <SummaryCard label="Published" value={stats.products.published} icon={CheckCircle} accent="text-success-700 bg-success-50" />
            <SummaryCard label="Draft" value={stats.products.draft} icon={FileEdit} accent="text-warning-700 bg-warning-50" />
            <SummaryCard label="Archived" value={stats.products.archived} icon={Archive} accent="text-ink-600 bg-ink-100" />
            <SummaryCard label="Categories" value={stats.categories.total} icon={FolderTree} accent="text-brand-700 bg-brand-50" />
            <SummaryCard label="Active Categories" value={stats.categories.active} icon={CheckCircle} accent="text-success-700 bg-success-50" />
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-ink-900">Order Overview</h2>
                <p className="mt-0.5 text-xs text-ink-500">Live order counts from the database</p>
              </div>
              <Link to="/admin/orders" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Manage orders</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <SummaryCard label="Total Orders" value={stats.orders.total} icon={ShoppingBag} accent="text-brand-700 bg-brand-50" />
              <SummaryCard label="Pending Orders" value={stats.orders.pending} icon={Clock3} accent="text-warning-700 bg-warning-50" />
              <SummaryCard label="Processing Orders" value={stats.orders.processing} icon={LoaderCircle} accent="text-brand-700 bg-brand-50" />
              <SummaryCard label="Completed Orders" value={stats.orders.completed} icon={CheckCircle} accent="text-success-700 bg-success-50" />
              <SummaryCard label="Manual Payments" value={stats.orders.pendingManualPayments} icon={AlertTriangle} accent={stats.orders.pendingManualPayments > 0 ? "text-error-700 bg-error-50" : "text-ink-600 bg-ink-50"} />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              
              {/* 2. ATTENTION REQUIRED */}
              <div className="rounded-2xl border border-ink-100 bg-white shadow-soft">
                <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-4">
                  <AlertTriangle size={18} className="text-warning-500" />
                  <h2 className="font-display text-lg font-bold text-ink-900">Attention Required</h2>
                </div>
                {stats.attentionRequired.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-ink-500">Your catalog has no major setup issues right now.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-ink-50">
                    {stats.attentionRequired.map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-ink-900">{item.name}</p>
                          <p className="text-xs text-ink-500">{item.issue}</p>
                        </div>
                        <Link to={item.actionUrl} className="inline-flex items-center justify-center rounded-lg bg-ink-50 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:bg-ink-100">
                          {item.actionLabel}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* REVIEWS */}
              <div className="rounded-2xl border border-ink-100 bg-white shadow-soft p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-50 text-warning-600">
                    <Star size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-500">Pending Reviews</p>
                    <div className="flex items-end justify-between">
                      <h3 className="font-display text-2xl font-bold text-ink-900">{stats.reviews.pending}</h3>
                      <Link to="/admin/reviews" className="text-xs font-semibold text-brand-600 hover:text-brand-700">Moderate</Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. RECENT CATALOG CHANGES */}
              <div className="rounded-2xl border border-ink-100 bg-white shadow-soft">
                <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
                  <h2 className="font-display text-lg font-bold text-ink-900">Recent Catalog Changes</h2>
                  <Link to="/admin/products" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all</Link>
                </div>
                {stats.recentProducts.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <p className="text-sm text-ink-500">No products yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                          <th className="px-5 py-3 whitespace-nowrap">Product</th>
                          <th className="px-5 py-3 whitespace-nowrap">Category</th>
                          <th className="px-5 py-3 whitespace-nowrap">Status</th>
                          <th className="px-5 py-3 whitespace-nowrap">Updated</th>
                          <th className="px-5 py-3 whitespace-nowrap text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-50">
                        {stats.recentProducts.map((p) => (
                          <tr key={p.id} className="transition-colors hover:bg-ink-50/50">
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <Link to={`/admin/products/${p.id}/edit`} className="font-semibold text-ink-800 hover:text-brand-600">{p.name}</Link>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap text-ink-500">
                              {p.categoryName || '—'}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[p.status] ?? statusStyles.draft}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap text-ink-500 text-xs">
                              {new Date(p.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap text-right">
                              <Link to={`/admin/products/${p.id}/edit`} className="text-brand-600 hover:text-brand-700 font-medium">Edit</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>


            </div>

            <div className="space-y-6">
              
              {/* 5. QUICK ACTIONS */}
              <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
                <h2 className="font-display text-lg font-bold text-ink-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <QuickAction to="/admin/products/new" icon={Plus} label="New Product" />
                  <QuickAction to="/admin/products" icon={Package} label="Manage Products" />
                  <QuickAction to="/admin/categories" icon={FolderTree} label="Categories" />
                  <QuickAction to="/admin/orders" icon={ShoppingBag} label="Orders" />
                  <QuickAction to="/admin/media" icon={ImageIcon} label="Media" />
                  <QuickAction to="/admin/settings" icon={Settings} label="Site Settings" />
                  <QuickAction to="/admin/seo" icon={Search} label="SEO Settings" />
                </div>
              </div>

              {/* 6. CATALOG HEALTH */}
              <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
                <h2 className="font-display text-lg font-bold text-ink-900 mb-4">Catalog Health</h2>
                <div className="space-y-3">
                  <HealthRow label="Products missing thumbnail" count={stats.health.missingThumbnail} />
                  <HealthRow label="Products missing SEO title" count={stats.health.missingSeoTitle} />
                  <HealthRow label="Products missing SEO desc" count={stats.health.missingSeoDescription} />
                  <HealthRow label="Products missing short desc" count={stats.health.missingShortDescription} />
                  <HealthRow label="Products missing category" count={stats.health.missingCategory} />
                  <HealthRow label="Products missing delivery info" count={stats.health.missingDelivery} />
                  <HealthRow label="Products missing features" count={stats.health.missingFeatures} />
                  <HealthRow label="Products missing FAQs" count={stats.health.missingFaqs} />
                </div>
              </div>

              {/* 7. STORE STATUS */}
              <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
                <h2 className="font-display text-lg font-bold text-ink-900 mb-4">Store Status</h2>
                <div className="space-y-3">
                  <StatusRow label="Storefront" value={stats.storeStatus.maintenanceMode ? 'Maintenance' : 'Online'} active={!stats.storeStatus.maintenanceMode} />
                  <StatusRow label="Announcement" value={stats.storeStatus.announcementEnabled ? 'Enabled' : 'Disabled'} active={stats.storeStatus.announcementEnabled} />
                  <StatusRow label="Support Button" value={stats.storeStatus.supportButtonEnabled ? 'Enabled' : 'Disabled'} active={stats.storeStatus.supportButtonEnabled} />
                </div>
              </div>

              {/* 8. SEO OVERVIEW */}
              <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold text-ink-900">SEO Overview</h2>
                  <Link to="/admin/seo" className="text-xs font-semibold text-brand-600 hover:text-brand-700">Open Settings</Link>
                </div>
                <div className="space-y-3">
                  <StatusRow label="Search Indexing" value={stats.seoHealth.indexingEnabled ? 'Enabled' : 'Disabled'} active={stats.seoHealth.indexingEnabled} />
                  <StatusRow label="Google Search Console" value={stats.seoHealth.gscConfigured ? 'Configured' : 'Missing'} active={stats.seoHealth.gscConfigured} />
                  <StatusRow label="Google Analytics 4" value={stats.seoHealth.ga4Configured ? 'Configured' : 'Missing'} active={stats.seoHealth.ga4Configured} />
                  <div className="pt-2 border-t border-ink-50 space-y-2">
                    <p className="text-xs text-ink-500 font-medium">Published Products Issues:</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-600">Missing SEO Title</span>
                      <span className={stats.seoHealth.missingSeoTitlePublished > 0 ? 'text-error-600 font-bold' : 'text-success-600'}>{stats.seoHealth.missingSeoTitlePublished}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-600">Missing SEO Desc</span>
                      <span className={stats.seoHealth.missingSeoDescPublished > 0 ? 'text-error-600 font-bold' : 'text-success-600'}>{stats.seoHealth.missingSeoDescPublished}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 9. MEDIA SUMMARY */}
              <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold text-ink-900">Media Summary</h2>
                  <Link to="/admin/media" className="text-xs font-semibold text-brand-600 hover:text-brand-700">Open Media</Link>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-600">Total Image Records</span>
                    <span className="font-medium">{stats.media.totalImages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600">Products with Thumbnail</span>
                    <span className="font-medium text-success-600">{stats.media.productsWithThumbnail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600">Products missing Thumbnail</span>
                    <span className={`font-medium ${stats.media.productsMissingThumbnail > 0 ? 'text-error-600' : 'text-success-600'}`}>
                      {stats.media.productsMissingThumbnail}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SummaryCard({ label, value, icon: Icon, accent }: { label: string, value: number | string, icon: any, accent: string }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
        <Icon size={20} />
      </div>
      <p className="font-display text-2xl font-bold text-ink-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-ink-500">{label}</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function QuickAction({ to, icon: Icon, label }: { to: string, icon: any, label: string }) {
  return (
    <Link to={to} className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-ink-100 bg-ink-50/50 p-4 transition-colors hover:bg-brand-50 hover:border-brand-100">
      <Icon size={20} className="text-ink-600 group-hover:text-brand-700 transition-colors" />
      <span className="text-xs font-semibold text-ink-800 text-center leading-tight group-hover:text-brand-700 transition-colors">{label}</span>
    </Link>
  );
}

function HealthRow({ label, count }: { label: string, count: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-600">{label}</span>
      {count > 0 ? (
        <span className="inline-flex items-center rounded-md bg-error-50 px-2 py-0.5 text-xs font-bold text-error-700">
          {count} {count === 1 ? 'issue' : 'issues'}
        </span>
      ) : (
        <span className="text-xs text-ink-400">0</span>
      )}
    </div>
  );
}

function StatusRow({ label, value, active }: { label: string, value: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-600">{label}</span>
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${active ? 'bg-success-50 text-success-700' : 'bg-ink-100 text-ink-600'}`}>
        {value}
      </span>
    </div>
  );
}
