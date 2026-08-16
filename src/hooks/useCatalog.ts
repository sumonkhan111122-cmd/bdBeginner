import { useEffect, useRef, useState } from 'react';
import {
  getCategories,
  getFeaturedProductsFromCatalog,
  getProductBySlugFromCatalog,
  getPublishedProducts,
  getRelatedProductsFromCatalog,
  type CatalogCategory,
} from '@/services/catalog';
import type { Product } from '@/types';

type AsyncState<T> = {
  data: T;
  loading: boolean;
  error: boolean;
  retry: () => void;
};

function useAsyncResource<T>(
  load: () => Promise<T>,
  initialValue: T,
  initiallyLoaded = false,
): AsyncState<T> {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(!initiallyLoaded);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let active = true;
    setLoading(!(initiallyLoaded && attempt === 0));
    setError(false);
    loadRef
      .current()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((reason: unknown) => {
        console.error('Catalog request failed', reason);
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt, initiallyLoaded]);

  return { data, loading, error, retry: () => setAttempt((value) => value + 1) };
}

export function usePublishedProducts(): AsyncState<Product[]> {
  return useAsyncResource(
    () => getPublishedProducts(),
    [],
    false
  );
}

export function useFeaturedProducts(): AsyncState<Product[]> {
  return useAsyncResource(
    () => getFeaturedProductsFromCatalog(8),
    [],
    false
  );
}

export function useCategories(): AsyncState<CatalogCategory[]> {
  return useAsyncResource(
    () => getCategories(),
    [],
    false
  );
}

export function useProduct(slug: string | undefined): AsyncState<Product | null> {
  return useAsyncResource(() => (slug ? getProductBySlugFromCatalog(slug) : Promise.resolve(null)), null, false);
}

export function useRelatedProducts(product: Product | null): AsyncState<Product[]> {
  return useAsyncResource(() => (product ? getRelatedProductsFromCatalog(product, 4) : Promise.resolve([])), [], false);
}
