import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useConflits } from "../../hooks/usePlanning";
import PageHeader from "../../components/common/PageHeader";

export default function Conflicts() {
  const { data, isLoading } = useConflits();
  const conflits = data?.conflits || [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Conflits de planning"
        subtitle="Chevauchements détectés sur les 14 prochains jours"
      />

      {isLoading ? (
        <div className="p-8 text-center text-sm text-ink-500">
          Analyse en cours...
        </div>
      ) : conflits.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-12 text-center">
          <CheckCircle2 size={36} className="text-emerald-500" />
          <p className="font-medium text-emerald-700">
            Aucun conflit détecté
          </p>
          <p className="text-sm text-emerald-600/70">
            Le planning des 14 prochains jours est cohérent.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-600">
            <AlertTriangle size={16} />
            {data.nb_conflits} conflit(s) détecté(s)
          </div>

          {conflits.map((c, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-xl border border-rose-200 bg-white"
            >
              <div className="flex items-center gap-2 bg-rose-400/10 px-4 py-2.5">
                <AlertTriangle size={14} className="text-rose-500" />
                <span className="text-sm font-medium text-rose-700">
                  Conflit {c.type === "machine" ? "machine" : "chaîne"} —{" "}
                  {c.machine || c.chaine}
                </span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-ink-100">
                {[c.planning1, c.planning2].map((p, i) => (
                  <div key={i} className="p-4">
                    <p className="font-mono-data text-xs font-medium text-ink-500">
                      {p.ordre_numero}
                    </p>
                    <p className="text-sm font-medium text-ink-900">
                      {p.produit_reference}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      {new Date(p.heure_debut_prev).toLocaleString("fr-FR")} →{" "}
                      {new Date(p.heure_fin_prev).toLocaleString("fr-FR")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}