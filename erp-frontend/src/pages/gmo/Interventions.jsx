import { useState } from "react";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import { useInterventions, useCloturerIntervention } from "../../hooks/useGmo";
import { getResultatsIntervention } from "../../api/gmo";
import PageHeader from "../../components/common/PageHeader";

const RESULTAT_LABELS = Object.fromEntries(
  getResultatsIntervention().map((r) => [r.value, r.label])
);

function ClotureModal({ intervention, onClose }) {
  const cloturer = useCloturerIntervention();
  const [resultat, setResultat] = useState("resolu");
  const [actions, setActions] = useState(intervention.actions_effectuees || "");
  const [coutPieces, setCoutPieces] = useState(0);
  const [coutMO, setCoutMO] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await cloturer.mutateAsync({
        id: intervention.id,
        payload: {
          resultat,
          actions_effectuees: actions,
          cout_pieces: coutPieces,
          cout_main_oeuvre: coutMO,
        },
      });
      toast.success("Intervention clôturée");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl"
      >
        <h3 className="font-display text-base font-semibold text-ink-900">
          Clôturer l'intervention — {intervention.panne_machine}
        </h3>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Résultat
          </label>
          <select
            value={resultat}
            onChange={(e) => setResultat(e.target.value)}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            {getResultatsIntervention().map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Actions effectuées
          </label>
          <textarea
            value={actions}
            onChange={(e) => setActions(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Coût pièces
            </label>
            <input
              type="number"
              step="0.001"
              value={coutPieces}
              onChange={(e) => setCoutPieces(e.target.value)}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Coût main-d'œuvre
            </label>
            <input
              type="number"
              step="0.001"
              value={coutMO}
              onChange={(e) => setCoutMO(e.target.value)}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Clôturer
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Interventions() {
  const [closing, setClosing] = useState(null);
  const { data, isLoading } = useInterventions({ page_size: 50 });
  const interventions = data?.results ?? data ?? [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Interventions techniques" />

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : interventions.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune intervention.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Machine</th>
                <th className="px-4 py-3 font-medium">Technicien</th>
                <th className="px-4 py-3 font-medium">Début</th>
                <th className="px-4 py-3 font-medium text-right">Durée</th>
                <th className="px-4 py-3 font-medium">Résultat</th>
                <th className="px-4 py-3 font-medium text-right">
                  Coût total
                </th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {interventions.map((i) => (
                <tr key={i.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {i.panne_machine}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {i.technicien_nom || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {new Date(i.debut_intervention).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {i.fin_intervention
                      ? `${i.duree_intervention_min} min`
                      : "en cours"}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {RESULTAT_LABELS[i.resultat] || i.resultat}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {i.cout_total}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!i.fin_intervention && (
                      <button
                        onClick={() => setClosing(i)}
                        className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                      >
                        <Check size={14} />
                        Clôturer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {closing && (
        <ClotureModal intervention={closing} onClose={() => setClosing(null)} />
      )}
    </div>
  );
}