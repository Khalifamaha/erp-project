import { MODULES } from '@/lib/modules'
import { cn } from '@/lib/cn'

export function Badge({ module = 'commercial', children, className }) {
  const m = MODULES[module] ?? MODULES.commercial
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        className
      )}
      style={{ backgroundColor: m.soft, color: m.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.solid }} />
      {children}
    </span>
  )
}
