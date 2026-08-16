import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function OtpInput({ length = 6, value, onChange, disabled = false }: OtpInputProps) {
  const [activeTokenIndex, setActiveTokenIndex] = useState<number>(0);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValue = value.split('');
      if (value[index]) {
        // If current index has a value, delete it and stay there
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        // If empty, move to previous and delete that
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < length - 1) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) return;

    // Handle single character input
    const newValue = value.split('');
    newValue[index] = val.substring(val.length - 1); // take the last character typed
    const finalValue = newValue.join('');
    
    onChange(finalValue);

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  // Convert string to array of length
  const digits = Array(length).fill('');
  for (let i = 0; i < length; i++) {
    if (value[i]) {
      digits[i] = value[i];
    }
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3 w-full" dir="ltr">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            if (el) inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={() => setActiveTokenIndex(index)}
          disabled={disabled}
          className={`h-12 w-full max-w-[3.5rem] rounded-xl border bg-white text-center text-lg font-bold transition-all focus:outline-none sm:h-14 sm:text-xl
            ${
              disabled 
                ? 'border-ink-200 bg-ink-50 text-ink-400 cursor-not-allowed' 
                : activeTokenIndex === index
                  ? 'border-brand-500 ring-2 ring-brand-500/20 text-ink-900'
                  : 'border-ink-200 text-ink-900 focus:border-brand-500'
            }
          `}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
