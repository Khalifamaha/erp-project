import { useState } from "react";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import { useReceptions, useValiderReception } from "../../hooks/useReceptions";
import PageHeader from "../../components/common/PageHeader";

const STATUT_STYLES = {
  en_cours: "bg-cyan-400/15 text-cyan-600",
  acceptee: "bg-emerald-400/15 text-emerald-600",
  refusee: "bg-rose-400/15 text-rose-600",
  partielle: "bg-amber-400/15 text-amber-600",
};

const STATUT_LABELS = {
  en_cours: "En cours de contrôle",
  acceptee: "Acceptée en stock",
  refusee: "Refusée",
  partielle: "Partielle",
};

export default function Receipts() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useReceptions({ page });
  const validerReception = useValiderReception();

  const receptions = data?.results ?? data ?? [];
  const totalCount = data?.count ?? receptions.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleValider = async (id) => {
    if (
      !window.confirm(
        "Valider cette réception ? Le stock sera mis à jour automatiquement."
      )
    )
      return;
    try {
      const result = await validerReception.mutateAsync(id);
      toast.success(result.message || "Réception validée");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Réceptions" />

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-rose-500">
            Erreur :{" "}
            {error?.message || "impossible de charger les réceptions"}
          </div>
        ) : receptions.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune réception trouvée.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Numéro</th>
                <th className="px-4 py-3 font-medium">Commande</th>
                <th className="px-4 py-3 font-medium">Fournisseur</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">N° BL</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {receptions.map((r) => (
                <tr key={r.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {r.numero}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {r.commande_numero}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {r.fournisseur_nom}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{r.date_reception}</td>
                  <td className="px-4 py-3 text-ink-700">{r.num_bl || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUT_STYLES[r.statut] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {STATUT_LABELS[r.statut] || r.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.statut === "en_cours" && (
                      <button
                        onClick={() => handleValider(r.id)}
                        className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                        title="Valider et entrer en stock"
                      >
                        <Check size={14} />
                        Valider
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-700">
          <span>
            Page {page} sur {totalPages} ({totalCount} réceptions)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-ink-300 px-3 py-1.5 disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-ink-300 px-3 py-1.5 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}