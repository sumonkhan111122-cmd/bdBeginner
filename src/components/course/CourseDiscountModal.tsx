import { useEffect, useRef } from 'react';
import { X, Gift, ArrowRight } from 'lucide-react';
interface CourseDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: () => void;
  originalPrice?: number;
  discountAmount?: number;
}
export function CourseDiscountModal({ isOpen, onClose, onClaim, originalPrice = 290, discountAmount = 50 }: CourseDiscountModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key !== 'Tab') return;
      const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button');
      if (!buttons?.length) return;
      if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0].focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen]);
  if (!isOpen) return null;
  return <div className="academy-offer-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div ref={dialogRef} className="academy-offer-dialog" role="dialog" aria-modal="true" aria-labelledby="academy-offer-title"><button type="button" onClick={onClose} className="academy-offer-close" aria-label="Close course offer"><X size={16} /></button><span className="academy-offer-icon"><Gift size={27} strokeWidth={1.5} /></span><p className="academy-eyebrow">A LITTLE SOMETHING TO GET YOU STARTED</p><h3 id="academy-offer-title">আপনার শুরুটা<br />আরও একটু সহজ হোক।</h3><p>AI Motion Masterclass-এ আপনার জন্য ৳{discountAmount} ছাড়। সম্পূর্ণ কোর্স, রিসোর্স ও আজীবন এক্সেস পাবেন একই সঙ্গে।</p><div className="academy-offer-price"><strong>৳{originalPrice - discountAmount}</strong><del>৳{originalPrice}</del></div><button type="button" onClick={onClaim} className="academy-btn academy-btn-primary">ছাড় নিয়ে কোর্সটি কিনুন<ArrowRight size={17} /></button><button type="button" className="academy-offer-decline" onClick={onClose}>আরও একটু দেখে নিই</button></div></div>;
}
export default CourseDiscountModal;