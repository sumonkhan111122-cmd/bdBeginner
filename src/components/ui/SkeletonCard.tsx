export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-ink-100" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded-full bg-ink-100" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-ink-100" />
        <div className="h-3 w-full animate-pulse rounded-full bg-ink-100" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-ink-100" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-7 w-24 animate-pulse rounded-lg bg-ink-100" />
          <div className="h-7 w-20 animate-pulse rounded-lg bg-ink-100" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FeaturedGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="container-page py-8 lg:py-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-4">
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-ink-100" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-ink-100" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-3 w-24 animate-pulse rounded-full bg-ink-100" />
          <div className="h-8 w-3/4 animate-pulse rounded-full bg-ink-100" />
          <div className="h-4 w-full animate-pulse rounded-full bg-ink-100" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-ink-100" />
          <div className="mt-4 h-40 animate-pulse rounded-2xl bg-ink-100" />
          <div className="mt-4 h-32 animate-pulse rounded-2xl bg-ink-100" />
        </div>
      </div>
    </div>
  );
}
