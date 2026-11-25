import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cx } from '@/utils/helpers'
type V = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warn'
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: V; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; icon?: ReactNode }
const V: Record<V, string> = {
  primary: 'bg-gradient-to-b from-brand to-brand-strong text-white hover:brightness-110 dark:text-slate-900 shadow-sm shadow-brand/30',
  secondary: 'bg-surface border border-line text-ink hover:bg-subtle',
  ghost: 'text-muted hover:bg-subtle hover:text-ink',
  danger: 'bg-bad text-white hover:opacity-90 dark:text-slate-900',
  success: 'bg-ok text-white hover:opacity-90 dark:text-slate-900',
  warn: 'bg-warn text-white hover:opacity-90 dark:text-slate-900',
}
const S = { xs: 'h-6 px-2 text-xxs gap-1', sm: 'h-7 px-2.5 text-xs gap-1.5', md: 'h-8 px-3 text-[12.5px] gap-1.5', lg: 'h-11 px-5 text-sm gap-2', xl: 'h-16 px-8 text-lg gap-3 rounded-2xl' }
export const Button = forwardRef<HTMLButtonElement, Props>(({ variant = 'secondary', size = 'md', icon, className, children, ...p }, ref) => (
  <button ref={ref} {...p} className={cx('inline-flex items-center justify-center rounded-lg font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap', V[variant], S[size], className)}>
    {icon}{children}
  </button>
))
Button.displayName = 'Button'
