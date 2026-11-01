import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Plus, Check, Download } from "lucide-react";
import { useFeaturedProducts } from "@/hooks/useCatalog";
import { useCart } from "@/context/CartContext";
import { useCurrencyFormatter } from "@/hooks/useCurrency";
import { WishlistButton } from "@/components/discovery/WishlistButton";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { CatalogError } from "@/components/ui/CatalogState";
import { isProductFree } from "@/services/freeDownloads";
import type { Product } from "@/types";
import { ResourceCover } from "@/components/cards/ResourceCover";

function CollectionProduct({ product }: { product: Product }) {
  const formatPrice = useCurrencyFormatter();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 2000);
    return () => window.clearTimeout(timer);
  }, [added]);
  const free = isProductFree(product) || product.price === 0;
  const previous = product.previousPrice || product.compareAtPrice;
  return (
    <article className="studio-product-card">
      <Link to={`/products/${product.slug}`} className="studio-product-image">
        <ImageWithFallback
          src={product.thumbnail}
          alt={product.name}
          className=""
          fallback={<ResourceCover product={product} />}
        />
        {free && <span className="studio-product-type">FREE RESOURCE</span>}
      </Link>
      <div className="studio-product-save">
        <WishlistButton productId={product.id} />
      </div>
      <div className="studio-product-body">
        <p className="studio-product-category">{product.category}</p>
        <h3>
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="studio-product-price-row">
          <span className="studio-product-price">
            {free ? "Free" : formatPrice(product.price)}
            {!free && previous && previous > product.price ? (
              <del>{formatPrice(previous)}</del>
            ) : null}
          </span>
          {free ? (
            <Link
              className="studio-product-cart"
              to={`/products/${product.slug}`}
              aria-label={`Download ${product.name}`}
            >
              <Download size={14} />
            </Link>
          ) : (
            <button
              type="button"
              className="studio-product-cart"
              aria-label={
                added
                  ? `${product.name} added to cart`
                  : `Add ${product.name} to cart`
              }
              onClick={() => {
                addItem(product);
                setAdded(true);
              }}
            >
              {added ? <Check size={14} /> : <Plus size={16} />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
const tabs = [
  { label: "All resources", value: "all" },
  { label: "Courses", value: "courses" },
  { label: "Software", value: "software" },
  { label: "Digital resources", value: "digital resources" },
];
export function FeaturedProducts() {
  const { data: products, loading, error, retry } = useFeaturedProducts();
  const [filter, setFilter] = useState("all");
  const visible = products.filter(
    (product) =>
      filter === "all" || product.category.toLowerCase().includes(filter),
  );
  return (
    <section className="studio-products">
      <div className="studio-container">
        <div className="studio-section-heading">
          <div>
            <p className="studio-kicker">THE GOOD STUFF, ALL IN ONE PLACE.</p>
            <h2>
              The collection<span className="text-[#244bff]">.</span>
            </h2>
          </div>
          <Link to="/products" className="studio-inline-link">
            View everything <ArrowUpRight size={18} />
          </Link>
        </div>
        <div
          className="product-filter-tabs"
          role="group"
          aria-label="Filter featured products"
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              aria-pressed={filter === tab.value}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {error ? (
          <CatalogError onRetry={retry} />
        ) : loading ? (
          <div
            className="studio-product-grid"
            aria-label="Loading products"
            aria-busy="true"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <div className="animate-pulse" key={i}>
                <div className="aspect-[1.35] rounded-lg bg-[#dde1d6]" />
                <div className="mt-4 h-3 w-3/4 rounded bg-[#dde1d6]" />
                <div className="mt-3 h-3 w-1/2 rounded bg-[#dde1d6]" />
              </div>
            ))}
          </div>
        ) : visible.length ? (
          <div className="studio-product-grid">
            {visible.slice(0, 8).map((product) => (
              <CollectionProduct key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="studio-no-products">
            No featured products in this collection yet.{" "}
            <Link
              to={
                filter === "all"
                  ? "/products"
                  : `/products?category=${encodeURIComponent(filter)}`
              }
              className="font-semibold underline"
            >
              Browse the full catalog →
            </Link>
          </div>
        )}
        <div className="studio-products-viewall">
          <Link to="/products" className="studio-inline-link">
            There's more to discover <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
