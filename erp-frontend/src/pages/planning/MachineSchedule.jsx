import { useChargeMachine, useChargeChaine } from "../../hooks/usePlanning";
import PageHeader from "../../components/common/PageHeader";

function tauxColor(taux) {
  if (taux >= 90) return "bg-rose-500";
  if (taux >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

export default function MachineSchedule() {
  const { data: machines, isLoading: loadingM } = useChargeMachine();
  const { data: chaines, isLoading: loadingC } = useChargeChaine();

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Charge machines & chaînes"
        subtitle="Taux d'occupation sur les 7 prochains jours"
      />

      <div className="grid grid-cols-2 gap-6">
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="border-b border-ink-100 px-5 py-4">
            <h3 className="font-display text-sm font-semibold text-ink-900">
              Machines
            </h3>
          </div>
          {loadingM ? (
            <div className="p-8 text-center text-sm text-ink-500">
              Chargement...
            </div>
          ) : !machines?.machines?.length ? (
            <div className="p-8 text-center text-sm text-ink-500">
              Aucune donnée disponible.
            </div>
          ) : (
            <div className="space-y-4 p-5">
              {machines.machines.map((m) => (
                <div key={m.machine_code}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-900">
                      {m.machine_nom}{" "}
                      <span className="font-mono-data text-xs text-ink-500">
                        ({m.machine_code})
                      </span>
                    </span>
                    <span className="font-mono-data text-ink-700">
                      {m.taux_occupation}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className={`h-full rounded-full transition-all ${tauxColor(
                        m.taux_occupation
                      )}`}
                      style={{ width: `${Math.min(100, m.taux_occupation)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    {m.heures_planifiees}h / {m.heures_disponibles}h ·{" "}
                    {m.nb_of_planifies} OF
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="border-b border-ink-100 px-5 py-4">
            <h3 className="font-display text-sm font-semibold text-ink-900">
              Chaînes de production
            </h3>
          </div>
          {loadingC ? (
            <div className="p-8 text-center text-sm text-ink-500">
              Chargement...
            </div>
          ) : !chaines?.chaines?.length ? (
            <div className="p-8 text-center text-sm text-ink-500">
              Aucune donnée disponible.
            </div>
          ) : (
            <div className="space-y-4 p-5">
              {chaines.chaines.map((c) => (
                <div
                  key={c.chaine_code}
                  className="rounded-xl border border-ink-100 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-ink-900">{c.chaine_nom}</p>
                    <span className="font-mono-data text-xs text-ink-500">
                      {c.chaine_code}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="font-mono-data text-base font-semibold text-ink-900">
                        {c.nb_of_planifies}
                      </p>
                      <p className="text-ink-500">OF planifiés</p>
                    </div>
                    <div>
                      <p className="font-mono-data text-base font-semibold text-ink-900">
                        {c.total_pieces}
                      </p>
                      <p className="text-ink-500">pièces</p>
                    </div>
                    <div>
                      <p className="font-mono-data text-base font-semibold text-ink-900">
                        {c.objectif_jour}
                      </p>
                      <p className="text-ink-500">objectif/j</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}