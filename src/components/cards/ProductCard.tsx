import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Download, GraduationCap, Loader2, ShoppingBag, Star, Layers } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { useCart } from '@/context/CartContext';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { WishlistButton } from '@/components/discovery/WishlistButton';
import { claimFreeDownload, isProductFree } from '@/services/freeDownloads';
import { safeHttpUrl } from '@/lib/urls';
import { ResourceCover } from './ResourceCover';
import '@/catalog-redesign.css';

export function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout>>();
  const [downloading, setDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState(false);
  const downloadBusy = useRef(false);
  const downloadRequest = useRef(0);
  const { addItem } = useCart();
  const isFree = isProductFree(product) || product.price === 0;
  const isCourse = /course|কোর্স/i.test(product.category);
  const href = /^(ai-motion|ai-motion-masterclass)$/.test(product.slug)
    ? '/course/ai-motion' : `/products/${product.slug}`;
  const rating = product.reviewStats;

  useEffect(() => {
    setAdded(false);
    setDownloading(false);
    setDownloadUrl(null);
    setDownloadError(false);
    downloadBusy.current = false;
    return () => {
      clearTimeout(addedTimer.current);
      downloadRequest.current += 1;
    };
  }, [product.id]);

  const handleDownload = async () => {
    if (downloadBusy.current) return;
    downloadBusy.current = true;
    const request = ++downloadRequest.current;
    setDownloading(true);
    setDownloadError(false);
    try {
      const result = await claimFreeDownload(product);
      if (request !== downloadRequest.current) return;
      const url = result.success ? safeHttpUrl(result.url) : null;
      if (!url) {
        setDownloadError(true);
        return;
      }
      setDownloadUrl(url);
      // Keep the ready link visible if the browser blocks this new tab.
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      if (request === downloadRequest.current) setDownloadError(true);
    } finally {
      if (request === downloadRequest.current) {
        downloadBusy.current = false;
        setDownloading(false);
      }
    }
  };

  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className={`market-resource-card ${isCourse ? 'market-resource-card--course' : ''}`}>
      <div className="market-resource-card__media">
        <Link to={href} className="market-resource-card__image" aria-label={`Explore ${product.name}`}>
          <ImageWithFallback
            src={product.thumbnail}
            alt={product.name}
            className="market-resource-card__photo"
            fallback={<ResourceCover product={product} />}
          />
        </Link>
        {(isFree || product.badge || product.newProduct) && (
          <span className={`market-resource-card__badge ${isFree ? 'is-free' : ''}`}>
            {isFree ? <><Download size={11} /> Free resource</> : product.badge === 'sale' ? 'Special offer' : product.newProduct || product.badge === 'new' ? 'New arrival' : 'Featured'}
          </span>
        )}
        <div className="market-resource-card__save"><WishlistButton productId={product.id} /></div>
        <span className="market-resource-card__format">
          {isCourse ? <GraduationCap size={13} /> : <Layers size={13} />}
          {isCourse ? 'Online course' : product.deliveryType === 'license-key' ? 'License key' : product.deliveryType === 'subscription' ? 'Subscription' : 'Digital resource'}
        </span>
      </div>

      <div className="market-resource-card__body">
        <div className="market-resource-card__meta">
          <span>{product.category}</span>
          {rating && rating.reviewCount > 0 && (
            <span className="market-resource-card__rating"><Star size={13} fill="currentColor" /> {rating.averageRating.toFixed(1)} <small>({rating.reviewCount})</small></span>
          )}
        </div>
        <Link to={href} className="market-resource-card__title"><h3>{product.name}</h3></Link>
        <p className="market-resource-card__description">{product.descriptor || product.shortDescription}</p>

        <div className="market-resource-card__footer">
          <PriceDisplay price={isFree ? 0 : product.price} previousPrice={product.compareAtPrice ?? product.previousPrice} size="md" />
          {isFree ? (
            downloadUrl ? (
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="market-resource-card__action market-resource-card__action--free" aria-label={`Download file: ${product.name}`}>
                <span className="market-resource-card__action-icon"><Download size={17} aria-hidden="true" /></span>
                <span>Download file</span><ArrowUpRight size={16} aria-hidden="true" />
              </a>
            ) : (
              <button type="button" onClick={handleDownload} disabled={downloading} aria-busy={downloading} className="market-resource-card__action market-resource-card__action--free" aria-label={`${downloading ? 'Preparing download' : 'Download'}: ${product.name}`}>
                <span className="market-resource-card__action-icon">{downloading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Download size={17} aria-hidden="true" />}</span>
                <span>{downloading ? 'Preparing…' : 'Download'}</span><ArrowUpRight size={16} aria-hidden="true" />
              </button>
            )
          ) : isCourse ? (
            <Link to={href} className="market-resource-card__action" aria-label={`Buy now: ${product.name}`}>
              <span className="market-resource-card__action-icon"><GraduationCap size={17} aria-hidden="true" /></span>
              <span>Buy now</span><ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          ) : (
            <button type="button" onClick={handleAddToCart} className={`market-resource-card__action ${added ? 'is-added' : ''}`} aria-label={`${added ? 'Added to cart' : 'Add to cart'}: ${product.name}`}>
              <span className="market-resource-card__action-icon">{added ? <Check size={17} aria-hidden="true" /> : <ShoppingBag size={17} aria-hidden="true" />}</span>
              <span>{added ? 'Added to cart' : 'Add to cart'}</span>{added ? <Check size={16} aria-hidden="true" /> : <ArrowUpRight size={16} aria-hidden="true" />}
            </button>
          )}
          {downloadError && <p className="market-resource-card__action-error" role="alert">Download could not start. Try again or <Link to={href}>view details</Link>.</p>}
          <span className="sr-only" role="status">{added ? `${product.name} added to cart.` : downloadUrl ? `Download ready for ${product.name}.` : ''}</span>
        </div>
      </div>
    </article>
  );
}
