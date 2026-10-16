import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/Card'
import { Construction } from 'lucide-react'

export default function Placeholder({ title }) {
  return (
    <>
      <Topbar title={title} subtitle="Module en construction" />
      <div className="p-4 sm:p-8">
        <Card className="p-10 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
            <Construction className="w-6 h-6 text-brand-500" />
          </div>
          <h3 className="font-display font-semibold text-ink-900">{title} arrive bientôt</h3>
          <p className="text-sm text-ink-500 max-w-sm">
            Cette page suivra le même système de design que le tableau de bord : cartes,
            couleurs de module et badges de statut cohérents.
          </p>
        </Card>
      </div>
    </>
  )
}
