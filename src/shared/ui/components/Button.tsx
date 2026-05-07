import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'default' | 'primary' | 'citron' | 'ink' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  block?: boolean;
}

const variantClass: Record<Variant, string> = {
  default: 'ftx-btn',
  primary: 'ftx-btn ftx-btn-primary',
  citron: 'ftx-btn ftx-btn-citron',
  ink: 'ftx-btn ftx-btn-ink',
  ghost: 'ftx-btn ftx-btn-ghost',
};

const sizeClass: Record<Size, string> = {
  sm: 'text-sm py-1.5 px-3',
  md: '',
  lg: 'text-base py-3 px-5',
};

export function Button({
  variant = 'default',
  size = 'md',
  icon,
  block,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const composed = [
    variantClass[variant],
    sizeClass[size],
    block ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button {...rest} className={composed}>
      {icon}
      {children}
    </button>
  );
}
