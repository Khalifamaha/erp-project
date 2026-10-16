import { usePannesStats } from "../../hooks/useGmo";
import PageHeader from "../../components/common/PageHeader";

export default function MTBFMTTR() {
  const { data: stats, isLoading } = usePannesStats();

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-ink-500">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="MTBF / MTTR"
        subtitle="Indicateurs de fiabilité et de maintenance"
      />

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <p className="text-xs font-medium text-ink-500">
            MTBF (temps moyen entre pannes)
          </p>
          <p className="mt-2 font-mono-data text-2xl font-bold text-emerald-600">
            {stats?.mtbf_heures ?? "—"} h
          </p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <p className="text-xs font-medium text-ink-500">
            MTTR (temps moyen de réparation)
          </p>
          <p className="mt-2 font-mono-data text-2xl font-bold text-amber-600">
            {stats?.mttr_minutes ?? "—"} min
          </p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <p className="text-xs font-medium text-ink-500">Pannes actives</p>
          <p className="mt-2 font-mono-data text-2xl font-bold text-rose-500">
            {stats?.pannes_actives}
          </p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <p className="text-xs font-medium text-ink-500">
            Coût total pannes
          </p>
          <p className="mt-2 font-mono-data text-2xl font-bold text-ink-900">
            {Number(stats?.cout_total_dt || 0).toLocaleString("fr-FR", {
              minimumFractionDigits: 3,
            })}{" "}
            TND
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="border-b border-ink-100 px-5 py-4">
            <h3 className="font-display text-sm font-semibold text-ink-900">
              Pannes par type
            </h3>
          </div>
          <div className="space-y-3 p-5">
            {(stats?.par_type_panne || []).map((t) => (
              <div key={t.type_panne} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">{t.type_panne}</span>
                <span className="font-mono-data font-medium text-ink-900">
                  {t.nombre}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="border-b border-ink-100 px-5 py-4">
            <h3 className="font-display text-sm font-semibold text-ink-900">
              Top 10 machines les plus touchées
            </h3>
          </div>
          <div className="divide-y divide-ink-100">
            {(stats?.top10_machines || []).map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-5 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-ink-900">
                    {m.machine__nom}
                  </p>
                  <p className="font-mono-data text-xs text-ink-500">
                    {m.machine__code}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono-data font-medium text-ink-900">
                    {m.nombre} pannes
                  </p>
                  <p className="text-xs text-ink-500">
                    {m.duree_tot?.toFixed?.(0) ?? m.duree_tot} min
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}