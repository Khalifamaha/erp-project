import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Wallet, ClipboardList, Truck, PackageCheck, MoveRight, MapPin, AlertTriangle, Wrench } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MODULES } from '@/lib/modules'
import client from '@/api/client'

const STATUT_COMMANDE_LABELS = {
  brouillon: 'Brouillon',
  confirmee: 'Confirmée',
  en_cours: 'En cours',
  partielle: 'Partielle',
  livree: 'Livrée',
  facturee: 'Facturée',
  annulee: 'Annulée',
}

const STATUT_COLORS = {
  brouillon: '#9CA3AF',
  confirmee: '#22d3ee',
  en_cours: '#ff9f43',
  partielle: '#ff9f43',
  livree: '#22c55e',
  facturee: '#22c55e',
  annulee: '#f43f5e',
}

async function getCommandes() {
  const { data } = await client.get('/commercial/commandes/', {
    params: { page_size: 100, ordering: '-date_creation' },
  })
  return data?.results ?? data ?? []
}
async function getExpeditionsEnCours() {
  const { data } = await client.get('/commercial/expeditions/', {
    params: { statut: 'en_route', page_size: 5 },
  })
  return data?.results ?? data ?? []
}
async function getCamions() {
  const { data } = await client.get('/commercial/camions/', {
    params: { page_size: 100 },
  })
  return data?.results ?? data ?? []
}
async function getFacturesStats() {
  const { data } = await client.get('/comptabilite/factures/stats/')
  return data
}
async function getOrdresStats() {
  const { data } = await client.get('/production/ordres/stats/')
  return data
}
async function getPannesActives() {
  const { data } = await client.get('/gmo/pannes/actives/')
  return data
}

function getStoredUserFirstName() {
  try {
    const raw = localStorage.getItem('user')
    const user = raw ? JSON.parse(raw) : null
    return user?.prenom || user?.nom_complet?.split(' ')[0] || ''
  } catch {
    return ''
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const prenom = getStoredUserFirstName()
  const todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const { data: commandes = [] } = useQuery({
    queryKey: ['dashboard', 'commandes'],
    queryFn: getCommandes,
  })
  const { data: expeditionsEnCours = [] } = useQuery({
    queryKey: ['dashboard', 'expeditions-en-cours'],
    queryFn: getExpeditionsEnCours,
  })
  const { data: camions = [] } = useQuery({
    queryKey: ['dashboard', 'camions'],
    queryFn: getCamions,
  })
  const { data: facturesStats } = useQuery({
    queryKey: ['dashboard', 'factures-stats'],
    queryFn: getFacturesStats,
  })
  const { data: ordresStats } = useQuery({
    queryKey: ['dashboard', 'ordres-stats'],
    queryFn: getOrdresStats,
  })
  const { data: pannesActives = [] } = useQuery({
    queryKey: ['dashboard', 'pannes-actives'],
    queryFn: getPannesActives,
  })

  const camionsStatut = { disponible: 0, en_route: 0, maintenance: 0 }
  camions.forEach((c) => {
    if (camionsStatut[c.statut] !== undefined) camionsStatut[c.statut]++
  })

  const commandesEnCoursCount = commandes.filter((c) =>
    ['confirmee', 'en_cours', 'partielle'].includes(c.statut)
  ).length

  const statutsCommandes = Object.entries(
    commandes.reduce((acc, c) => {
      acc[c.statut] = (acc[c.statut] || 0) + 1
      return acc
    }, {})
  ).map(([statut, valeur]) => ({
    statut: STATUT_COMMANDE_LABELS[statut] || statut,
    valeur,
    color: STATUT_COLORS[statut] || '#9CA3AF',
  }))

  const commandesRecentes = commandes.slice(0, 6)

  return (
    <>
      <Topbar title="Tableau de bord" subtitle={todayLabel} />

      <div className="p-4 sm:p-8 space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            Bonjour{prenom ? `, ${prenom}` : ''} 👋
          </h2>
          <p className="text-sm text-ink-500 mt-1">
            Voici l'activité de l'entreprise aujourd'hui.
          </p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Wallet}
            module="finance"
            label="CA total TTC"
            value={`${Number(facturesStats?.ca_total_ttc || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} TND`}
            sub={`${Number(facturesStats?.a_encaisser || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} TND à encaisser`}
          />
          <StatCard
            icon={ClipboardList}
            module="commercial"
            label="Commandes en cours"
            value={commandesEnCoursCount}
            sub={`${commandes.length} commandes au total`}
          />
          <StatCard
            icon={Truck}
            module="logistique"
            label="Camions disponibles"
            value={`${camionsStatut.disponible} / ${camions.length}`}
            sub={`${camionsStatut.maintenance} en maintenance`}
          />
          <StatCard
            icon={Wrench}
            module="gmo"
            label="Pannes actives"
            value={pannesActives?.length || 0}
            sub={`${ordresStats?.en_cours || 0} OF en cours`}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2" accent={MODULES.gmo?.solid}>
            <CardHeader>
              <CardTitle>Production & fiabilité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-ink-100 p-4">
                  <p className="text-xs font-medium text-ink-500">
                    Ordres de fabrication
                  </p>
                  <p className="mt-2 font-mono-data text-2xl font-bold text-ink-900">
                    {ordresStats?.total_of ?? '—'}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    {ordresStats?.en_cours ?? 0} en cours ·{' '}
                    {ordresStats?.termines ?? 0} terminés
                  </p>
                </div>
                <div className="rounded-xl border border-ink-100 p-4">
                  <p className="text-xs font-medium text-ink-500">
                    Factures en retard
                  </p>
                  <p className="mt-2 font-mono-data text-2xl font-bold text-rose-500">
                    {facturesStats?.en_retard_nb ?? '—'}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    {Number(facturesStats?.encaisse || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} TND encaissés
                  </p>
                </div>
              </div>
              {pannesActives?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {pannesActives.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 rounded-lg bg-rose-400/10 px-3 py-2 text-sm text-rose-600"
                    >
                      <AlertTriangle size={14} />
                      {p.machine_code} — {p.type_panne} ({p.gravite})
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statuts des commandes</CardTitle>
            </CardHeader>
            <CardContent>
              {statutsCommandes.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink-500">
                  Aucune commande.
                </p>
              ) : (
                <>
                  <div className="h-40 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statutsCommandes}
                          dataKey="valeur"
                          nameKey="statut"
                          innerRadius={44}
                          outerRadius={64}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {statutsCommandes.map((s) => (
                            <Cell key={s.statut} fill={s.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="font-display font-bold text-xl text-ink-900">
                        {commandes.length}
                      </span>
                      <span className="text-[11px] text-ink-500">commandes</span>
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    {statutsCommandes.map((s) => (
                      <div key={s.statut} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-ink-700">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          {s.statut}
                        </span>
                        <span className="font-mono-data font-medium text-ink-900">{s.valeur}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2" accent={MODULES.commercial.solid}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Commandes récentes</CardTitle>
              <Button variant="ghost" className="text-brand-600 !px-2 !py-1.5 text-xs" onClick={() => navigate('/commandes')}>
                Voir tout <MoveRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="!pt-0">
              {commandesRecentes.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink-500">
                  Aucune commande récente.
                </p>
              ) : (
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-ink-500 text-xs uppercase tracking-wide border-y border-ink-100">
                        <th className="font-medium px-5 py-3">N° commande</th>
                        <th className="font-medium px-3 py-3">Client</th>
                        <th className="font-medium px-3 py-3">Montant</th>
                        <th className="font-medium px-3 py-3">Statut</th>
                        <th className="font-medium px-5 py-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commandesRecentes.map((c) => (
                        <tr key={c.id} className="border-b border-ink-100/70 last:border-0 hover:bg-ink-100/30 transition-colors">
                          <td className="px-5 py-3 font-mono-data text-ink-900 font-medium">{c.numero}</td>
                          <td className="px-3 py-3 text-ink-700">
                            {c.client_nom || c.client_detail?.raison_sociale}
                          </td>
                          <td className="px-3 py-3 font-mono-data text-ink-900">
                            {Number(c.montant_total).toLocaleString('fr-FR')} {c.devise}
                          </td>
                          <td className="px-3 py-3">
                            <Badge module="commercial">
                              {STATUT_COMMANDE_LABELS[c.statut] || c.statut}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-right text-ink-500">{c.date_commande}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card accent={MODULES.logistique.solid}>
            <CardHeader>
              <CardTitle>Expéditions en cours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expeditionsEnCours.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-500">
                  Aucune expédition en route.
                </p>
              ) : (
                expeditionsEnCours.map((e) => (
                  <div key={e.id} className="rounded-xl border border-ink-100 p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono-data text-sm font-semibold text-ink-900">{e.numero}</span>
                      <Badge module="logistique">En route</Badge>
                    </div>
                    <p className="text-sm text-ink-700 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      {e.destination}, {e.pays_destination}
                    </p>
                    <p className="text-xs text-ink-500">
                      {e.camion_detail?.immatriculation || '—'}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100 text-xs">
                      <span className="text-ink-500">Départ : {e.date_depart}</span>
                      <span className="text-ink-500">Arrivée prévue : {e.date_arrivee_prev || '—'}</span>
                    </div>
                  </div>
                ))
              )}

              <div className="rounded-xl bg-canvas p-3.5">
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2.5">
                  Flotte de camions
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-ink-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {camionsStatut.disponible} dispo
                  </span>
                  <span className="flex items-center gap-1.5 text-ink-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> {camionsStatut.en_route} en route
                  </span>
                  <span className="flex items-center gap-1.5 text-ink-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> {camionsStatut.maintenance} maint.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}