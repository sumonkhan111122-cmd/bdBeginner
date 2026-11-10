import { ArrowUpRight, Code2, Command, GraduationCap, Layers, Play, WandSparkles } from 'lucide-react';
import type { Product } from '@/types';

export function ResourceCover({ product }: { product: Product }) {
  const category = product.category.toLowerCase();
  const isCourse = /course|কোর্স/.test(category);
  const isCode = /wordpress|script|plugin/.test(category);
  const tones = ['lavender', 'peach', 'mint', 'blue'];
  const hash = [...product.slug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const tone = tones[hash % tones.length];
  const Icon = isCourse ? GraduationCap : isCode ? Code2 : /ai/.test(category) ? WandSparkles : /software/.test(category) ? Command : Layers;

  return (
    <div className={`market-cover market-cover--${tone} ${isCourse ? 'market-cover--course' : ''}`} aria-hidden="true">
      <div className="market-cover__brand"><span>bd<span>beginner</span></span><ArrowUpRight size={16} /></div>
      <div className="market-cover__scene">
        <span className="market-cover__orbit" />
        <span className="market-cover__disc"><Icon size={48} strokeWidth={1.4} /></span>
        <span className="market-cover__satellite">{isCourse ? <Play size={17} fill="currentColor" /> : <span>✳</span>}</span>
        <span className="market-cover__dot" />
      </div>
      <div className="market-cover__label"><span>{product.category}</span><strong>{isCourse ? 'Learn something great.' : 'Make your next move.'}</strong></div>
    </div>
  );
}
