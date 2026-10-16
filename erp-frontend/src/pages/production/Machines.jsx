import { useState } from "react";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { useMachines, useChangerStatutMachine } from "../../hooks/useMachinesGammes";
import { getTypesMachine, getStatutsMachine } from "../../api/production";
import PageHeader from "../../components/common/PageHeader";

const TYPE_LABELS = Object.fromEntries(
  getTypesMachine().map((t) => [t.value, t.label])
);
const STATUTS = getStatutsMachine();

const STATUT_STYLES = {
  disponible: "bg-emerald-400/15 text-emerald-600",
  en_marche: "bg-cyan-400/15 text-cyan-600",
  panne: "bg-rose-400/15 text-rose-600",
  maintenance: "bg-amber-400/15 text-amber-600",
  arret: "bg-ink-100 text-ink-700",
};

export default function Machines() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useMachines({ search: search || undefined });
  const changerStatut = useChangerStatutMachine();
  const machines = data?.results ?? data ?? [];

  const handleStatutChange = async (id, statut) => {
    try {
      await changerStatut.mutateAsync({ id, statut });
      toast.success("Statut mis à jour");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Machines" />

      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une machine..."
          className="w-full rounded-lg border border-ink-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : machines.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune machine trouvée.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium text-right">
                  Cadence horaire
                </th>
                <th className="px-4 py-3 font-medium text-right">
                  Disponibilité
                </th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((m) => (
                <tr key={m.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-mono-data text-ink-500">
                    {m.code}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {m.nom}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {TYPE_LABELS[m.type] || m.type}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {m.cadence_horaire} pcs/h
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {m.taux_disponibilite}%
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={m.statut}
                      onChange={(e) =>
                        handleStatutChange(m.id, e.target.value)
                      }
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none ${
                        STATUT_STYLES[m.statut] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {STATUTS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}