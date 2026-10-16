import { cn } from '@/lib/cn'

export function Card({ className, children, accent, ...props }) {
  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl border border-ink-100 shadow-[0_1px_2px_rgba(20,21,46,0.04),0_8px_24px_-12px_rgba(20,21,46,0.08)]',
        'overflow-hidden',
        className
      )}
      {...props}
    >
      {accent && (
        <span
          className="absolute inset-y-0 left-0 w-1"
          style={{ backgroundColor: accent }}
        />
      )}
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('px-5 pt-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('font-display font-semibold text-ink-900 text-[15px]', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('px-5 pb-5', className)} {...props}>
      {children}
    </div>
  )
}
