import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  showRules?: boolean;
}

export function evaluatePasswordStrength(password: string): {
  score: number; // 0 to 4
  label: string;
  colorClass: string;
  barColorClass: string;
  rules: {
    minLength: boolean;
    hasLetter: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
} {
  const minLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  let score = 0;
  if (minLength) score++;
  if (hasLetter) score++;
  if (hasNumber) score++;
  if (hasSpecial && password.length >= 10) score++;

  let label = 'Very Weak';
  let colorClass = 'text-rose-600';
  let barColorClass = 'bg-rose-500';

  if (!password) {
    label = '';
    score = 0;
    colorClass = 'text-ink-400';
    barColorClass = 'bg-ink-200';
  } else if (score <= 1) {
    label = 'Weak';
    colorClass = 'text-rose-600';
    barColorClass = 'bg-rose-500';
  } else if (score === 2) {
    label = 'Fair';
    colorClass = 'text-amber-600';
    barColorClass = 'bg-amber-500';
  } else if (score === 3) {
    label = 'Good';
    colorClass = 'text-sky-600';
    barColorClass = 'bg-sky-500';
  } else {
    label = 'Strong';
    colorClass = 'text-emerald-600';
    barColorClass = 'bg-emerald-500';
  }

  return {
    score,
    label,
    colorClass,
    barColorClass,
    rules: {
      minLength,
      hasLetter,
      hasNumber,
      hasSpecial,
    },
  };
}

export function PasswordStrengthIndicator({ password, showRules = true }: PasswordStrengthProps) {
  if (!password) return null;

  const strength = evaluatePasswordStrength(password);

  return (
    <div className="mt-2 space-y-2">
      {/* 4-bar Progress Indicator */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-500">Password strength:</span>
          <span className={`font-bold ${strength.colorClass}`}>{strength.label}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-1.5">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-full rounded-full transition-all duration-300 ${
                strength.score >= step ? strength.barColorClass : 'bg-ink-100'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Rules Checklist */}
      {showRules && (
        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-ink-600">
          <div className="flex items-center gap-1.5">
            {strength.rules.minLength ? (
              <Check size={13} className="text-emerald-600 shrink-0" />
            ) : (
              <X size={13} className="text-ink-400 shrink-0" />
            )}
            <span className={strength.rules.minLength ? 'text-emerald-700 font-medium' : 'text-ink-500'}>
              At least 8 characters
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {strength.rules.hasLetter ? (
              <Check size={13} className="text-emerald-600 shrink-0" />
            ) : (
              <X size={13} className="text-ink-400 shrink-0" />
            )}
            <span className={strength.rules.hasLetter ? 'text-emerald-700 font-medium' : 'text-ink-500'}>
              Contains a letter
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {strength.rules.hasNumber ? (
              <Check size={13} className="text-emerald-600 shrink-0" />
            ) : (
              <X size={13} className="text-ink-400 shrink-0" />
            )}
            <span className={strength.rules.hasNumber ? 'text-emerald-700 font-medium' : 'text-ink-500'}>
              Contains a number
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {strength.rules.hasSpecial ? (
              <Check size={13} className="text-emerald-600 shrink-0" />
            ) : (
              <span className="h-3 w-3 inline-block rounded-full border border-ink-300 shrink-0" />
            )}
            <span className={strength.rules.hasSpecial ? 'text-emerald-700 font-medium' : 'text-ink-400'}>
              Symbol (optional)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
