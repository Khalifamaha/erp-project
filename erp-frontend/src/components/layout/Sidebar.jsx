import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  Users,
  ClipboardList,
  Truck,
  Package,
  Factory,
  Wallet,
  Settings,
  Boxes,
  UserCog,
  Clock,
  Banknote,
  Tags,
  ArrowLeftRight,
  ClipboardCheck,
  Handshake,
  ShoppingCart,
  PackageCheck,
  Receipt,
  Cog,
  Route as RouteIcon,
  ListOrdered,
  Radio,
  ClipboardList as ClipboardListIcon,
  ShieldCheck,
  AlertOctagon,
  GanttChartSquare,
  CalendarDays,
  Gauge,
  AlertCircle,
  BookOpen,
  Calculator,
  Scale,
  FileBarChart,
  CircleDollarSign,
  Wrench,
  HardHat,
  CalendarClock,
  Activity,
  CalendarOff,
} from 'lucide-react'
import { MODULES } from '@/lib/modules'

const NAV = [
  { section: 'Aperçu', items: [{ to: '/', label: 'Tableau de bord', icon: LayoutGrid, module: 'commercial' }] },
  {
    section: 'Commercial',
    items: [
      { to: '/clients', label: 'Clients', icon: Users, module: 'commercial' },
      { to: '/commandes', label: 'Commandes', icon: ClipboardList, module: 'commercial' },
    ],
  },
  {
    section: 'Logistique',
    items: [
      { to: '/expeditions', label: 'Expéditions', icon: Package, module: 'logistique' },
      { to: '/camions', label: 'Camions', icon: Truck, module: 'logistique' },
    ],
  },
  {
    section: 'Production',
    items: [
      { to: '/produits', label: 'Produits', icon: Boxes, module: 'production' },
      { to: '/stock', label: 'Vue stock', icon: Package, module: 'production' },
      { to: '/categories', label: 'Catégories', icon: Tags, module: 'production' },
      { to: '/mouvements', label: 'Mouvements', icon: ArrowLeftRight, module: 'production' },
      { to: '/ajustement', label: 'Ajustement inventaire', icon: ClipboardCheck, module: 'production' },
      { to: '/machines', label: 'Machines', icon: Cog, module: 'production' },
      { to: '/gammes', label: 'Gammes opératoires', icon: RouteIcon, module: 'production' },
      { to: '/of', label: 'Ordres de fabrication', icon: ListOrdered, module: 'production' },
      { to: '/production', label: 'Ligne temps réel', icon: Radio, module: 'production' },
    ],
  },
  {
    section: 'Ressources humaines',
    items: [
      { to: '/employes', label: 'Employés', icon: UserCog, module: 'rh' },
      { to: '/pointages', label: 'Pointages', icon: Clock, module: 'rh' },
      { to: '/paie', label: 'Paie', icon: Banknote, module: 'rh' },
      { to: '/conges', label: 'Congés', icon: CalendarOff, module: 'rh' },
    ],
  },
  {
    section: 'Achats',
    items: [
      { to: '/fournisseurs', label: 'Fournisseurs', icon: Handshake, module: 'achats' },
      { to: '/achats', label: 'Commandes achat', icon: ShoppingCart, module: 'achats' },
      { to: '/receptions', label: 'Réceptions', icon: PackageCheck, module: 'achats' },
      { to: '/factures-achat', label: 'Factures', icon: Receipt, module: 'achats' },
    ],
  },
  {
    section: 'Qualité',
    items: [
      { to: '/controles', label: 'Contrôles', icon: ShieldCheck, module: 'qualite' },
      { to: '/criteres', label: 'Critères', icon: ClipboardListIcon, module: 'qualite' },
      { to: '/nc', label: 'Non-conformités', icon: AlertOctagon, module: 'qualite' },
    ],
  },
  {
    section: 'Planning',
    items: [
      { to: '/planning', label: 'Planning semaine', icon: CalendarDays, module: 'planning' },
      { to: '/gantt', label: 'Vue Gantt', icon: GanttChartSquare, module: 'planning' },
      { to: '/charge', label: 'Charge machines', icon: Gauge, module: 'planning' },
      { to: '/conflits', label: 'Conflits', icon: AlertCircle, module: 'planning' },
    ],
  },
  {
    section: 'GMAO',
    items: [
      { to: '/pannes', label: 'Pannes', icon: Wrench, module: 'gmo' },
      { to: '/interventions', label: 'Interventions', icon: HardHat, module: 'gmo' },
      { to: '/maintenance-preventive', label: 'Maintenance préventive', icon: CalendarClock, module: 'gmo' },
      { to: '/mtbf-mttr', label: 'MTBF / MTTR', icon: Activity, module: 'gmo' },
    ],
  },
  {
    section: 'Finance',
    items: [
      { to: '/exercices', label: 'Exercices', icon: BookOpen, module: 'finance' },
      { to: '/plan-comptable', label: 'Plan comptable', icon: Calculator, module: 'finance' },
      { to: '/ecritures', label: 'Journal', icon: FileBarChart, module: 'finance' },
      { to: '/balance', label: 'Balance', icon: Scale, module: 'finance' },
      { to: '/bilan', label: 'Bilan', icon: Scale, module: 'finance' },
      { to: '/factures-vente', label: 'Factures clients', icon: CircleDollarSign, module: 'finance' },
    ],
  },
  {
    section: 'Gestion',
    items: [
      { to: '/parametres', label: 'Paramètres', icon: Settings, module: 'commercial' },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-navy-900 text-white h-screen sticky top-0 overflow-y-auto">
      <div className="flex items-center gap-2.5 px-5 h-16 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-cyan-500 flex items-center justify-center font-display font-bold text-sm">
          W
        </div>
        <span className="font-display font-semibold tracking-tight text-[15px]">ERP</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6">
        {NAV.map((group) => (
          <div key={group.section}>
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">
              {group.section}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const m = MODULES[item.module]
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ' +
                      (isActive ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5')
                    }
                    style={({ isActive }) =>
                      isActive
                        ? { background: `linear-gradient(135deg, ${m.from}, ${m.to})` }
                        : undefined
                    }
                  >
                    <item.icon className="w-[18px] h-[18px]" strokeWidth={2} />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 mx-3 mb-4 rounded-xl bg-white/5 text-xs text-white/50 leading-relaxed">
        Environnement <span className="text-white/80 font-medium">démo</span>. Les données affichées
        sont fictives.
      </div>
    </aside>
  )
}