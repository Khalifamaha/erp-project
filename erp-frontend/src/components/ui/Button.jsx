import { cn } from '@/lib/cn'

const variants = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 shadow-[0_8px_20px_-8px_rgba(91,95,239,0.55)]',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100',
  outline: 'bg-white text-ink-700 border border-ink-100 hover:border-ink-300',
}

export function Button({ className, variant = 'primary', children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
