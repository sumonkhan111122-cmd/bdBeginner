import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { FaqItem } from '@/types';

type FaqAccordionProps = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const navigateQuestions = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === 'ArrowDown') next = (index + 1) % items.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else return;
    event.preventDefault();
    buttons.current[next]?.focus();
  };

  return (
    <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index}>
            <button
              type="button"
              id={`${id}-question-${index}`}
              ref={(button) => { buttons.current[index] = button; }}
              onKeyDown={(event) => navigateQuestions(event, index)}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-ink-50/50 sm:px-6"
              aria-expanded={isOpen}
              aria-controls={`${id}-panel-${index}`}
            >
              <span className="font-display text-base font-semibold text-ink-900">
                {item.question}
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isOpen ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600'
                }`}
              >
                {isOpen ? <Minus size={16} /> : <Plus size={16} />}
              </span>
            </button>
            <div
              id={`${id}-panel-${index}`}
              role="region"
              aria-labelledby={`${id}-question-${index}`}
              aria-hidden={!isOpen}
              className={`grid transition-all duration-300 ease-smooth ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-ink-500 sm:px-6">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
