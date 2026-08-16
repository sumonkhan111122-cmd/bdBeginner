import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm hover:shadow-md',
  secondary:
    'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 shadow-sm hover:shadow-md',
  outline:
    'border border-ink-200 bg-white text-ink-800 hover:border-ink-300 hover:bg-ink-50 active:bg-ink-100',
  ghost:
    'text-ink-700 hover:bg-ink-100 active:bg-ink-200',
  subtle:
    'bg-ink-50 text-ink-800 hover:bg-ink-100 active:bg-ink-200 border border-ink-100',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
};

const baseStyles =
  'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-smooth disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none';

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
};

type AsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined };
type AsLink = CommonProps & {
  to: string;
  buttonAttrs?: ButtonHTMLAttributes<HTMLButtonElement>;
};

export function Button(props: AsButton | AsLink) {
  const {
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    fullWidth = false,
    ...rest
  } = props;

  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
    fullWidth ? 'w-full' : ''
  } ${className}`;

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={classes} {...(rest as Record<string, unknown>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
