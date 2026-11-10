import { useCallback, useEffect, useRef, useState } from 'react';
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
  resourceKey = 'catalog',
): AsyncState<T> {
  const [state, setState] = useState({ key: resourceKey, data: initialValue, loading: true, error: false });
  const [attempt, setAttempt] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let active = true;
    setState((current) => ({ key: resourceKey, data: current.key === resourceKey ? current.data : initialValue, loading: true, error: false }));
    loadRef
      .current()
      .then((result) => {
        if (active) setState({ key: resourceKey, data: result, loading: false, error: false });
      })
      .catch((reason: unknown) => {
        console.error('Catalog request failed', reason);
        if (active) setState({ key: resourceKey, data: initialValue, loading: false, error: true });
      });
    return () => {
      active = false;
    };
  }, [attempt, resourceKey]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  // Hide the previous resource immediately, before the new request effect runs.
  return state.key === resourceKey ? { ...state, retry } : { data: initialValue, loading: true, error: false, retry };
}

export function usePublishedProducts(): AsyncState<Product[]> {
  return useAsyncResource(
    () => getPublishedProducts(),
    [],
    'published'
  );
}

export function useFeaturedProducts(): AsyncState<Product[]> {
  return useAsyncResource(
    () => getFeaturedProductsFromCatalog(8),
    [],
    'featured'
  );
}

export function useCategories(): AsyncState<CatalogCategory[]> {
  return useAsyncResource(
    () => getCategories(),
    [],
    'categories'
  );
}

export function useProduct(slug: string | undefined): AsyncState<Product | null> {
  return useAsyncResource(() => (slug ? getProductBySlugFromCatalog(slug) : Promise.resolve(null)), null, `product:${slug ?? ''}`);
}

export function useRelatedProducts(product: Product | null): AsyncState<Product[]> {
  return useAsyncResource(() => (product ? getRelatedProductsFromCatalog(product, 4) : Promise.resolve([])), [], `related:${product?.id ?? ''}:${product?.category ?? ''}`);
}
