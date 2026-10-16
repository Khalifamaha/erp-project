import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { MODULES } from '@/lib/modules'

export function StatCard({ icon: Icon, label, value, sub, trend, module = 'commercial' }) {
  const m = MODULES[module] ?? MODULES.commercial
  const positive = trend === undefined ? null : trend >= 0

  return (
    <Card className="p-5 flex flex-col gap-4 hover:-translate-y-0.5 transition-transform duration-200">
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: `linear-gradient(135deg, ${m.from}, ${m.to})` }}
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={2.25} />
        </div>
        {trend !== undefined && (
          <span
            className={
              'inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-1 ' +
              (positive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600')
            }
          >
            {positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="font-display text-2xl font-bold text-ink-900 font-mono-data">{value}</p>
        <p className="text-sm text-ink-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-ink-300 mt-1">{sub}</p>}
      </div>
    </Card>
  )
}
