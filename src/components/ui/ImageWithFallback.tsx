import { useEffect, useState, type ReactNode } from 'react';

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallback: ReactNode;
  loading?: 'lazy' | 'eager';
};

export function ImageWithFallback({
  src,
  alt,
  className,
  fallback,
  loading = 'lazy',
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) return <>{fallback}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
