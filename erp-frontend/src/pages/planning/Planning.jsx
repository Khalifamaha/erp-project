import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Gauge, GanttChartSquare } from "lucide-react";
import { useSemaine } from "../../hooks/usePlanning";
import PageHeader from "../../components/common/PageHeader";

const JOURS_LABELS = {
  0: "Lundi",
  1: "Mardi",
  2: "Mercredi",
  3: "Jeudi",
  4: "Vendredi",
};

const STATUT_STYLES = {
  brouillon: "border-ink-300 bg-ink-100/40",
  confirme: "border-cyan-400 bg-cyan-400/10",
  en_cours: "border-amber-400 bg-amber-400/10",
  termine: "border-emerald-400 bg-emerald-400/10",
  reporte: "border-orange-400 bg-orange-400/10",
  annule: "border-rose-400 bg-rose-400/10 opacity-60",
};

export default function Planning() {
  const [offsetWeeks, setOffsetWeeks] = useState(0);
  const refDate = new Date();
  refDate.setDate(refDate.getDate() + offsetWeeks * 7);
  const dateStr = refDate.toISOString().slice(0, 10);

  const { data, isLoading } = useSemaine(dateStr);
  const jours = data?.jours || {};
  const joursListe = Object.keys(jours).sort();

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Planning de production"
        subtitle={
          data
            ? `Semaine du ${data.semaine_debut} au ${data.semaine_fin}`
            : undefined
        }
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/gantt"
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
            >
              <GanttChartSquare size={14} />
              Vue Gantt
            </Link>
            <button
              onClick={() => setOffsetWeeks((w) => w - 1)}
              className="rounded-lg border border-ink-300 bg-white p-2 text-ink-700 hover:bg-ink-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setOffsetWeeks(0)}
              className="rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setOffsetWeeks((w) => w + 1)}
              className="rounded-lg border border-ink-300 bg-white p-2 text-ink-700 hover:bg-ink-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        }
      />

      {isLoading ? (
        <div className="p-8 text-center text-sm text-ink-500">
          Chargement...
        </div>
      ) : joursListe.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white p-12 text-center">
          <Gauge size={32} className="mx-auto mb-3 text-ink-300" />
          <p className="text-sm text-ink-500">
            Aucun planning cette semaine.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {joursListe.map((jour, idx) => (
            <div key={jour} className="space-y-3">
              <div className="rounded-t-xl bg-navy-900 px-3 py-2.5 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-white/60">
                  {JOURS_LABELS[idx] || jour}
                </p>
                <p className="font-display text-sm font-semibold text-white">
                  {new Date(jour).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
              </div>
              <div className="space-y-2">
                {jours[jour].map((p) => (
                  <div
                    key={p.id}
                    className={`rounded-xl border-l-4 bg-white p-3 shadow-sm ${
                      STATUT_STYLES[p.statut] || "border-ink-300"
                    }`}
                  >
                    <p className="font-mono-data text-xs font-medium text-ink-500">
                      {p.ordre_numero}
                    </p>
                    <p className="text-sm font-medium text-ink-900">
                      {p.produit_reference}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
                      <span>{p.chaine_code}</span>
                      <span className="font-mono-data">
                        {p.quantite_planifiee} pcs
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      {new Date(p.heure_debut_prev).toLocaleTimeString(
                        "fr-FR",
                        { hour: "2-digit", minute: "2-digit" }
                      )}{" "}
                      -{" "}
                      {new Date(p.heure_fin_prev).toLocaleTimeString(
                        "fr-FR",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
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