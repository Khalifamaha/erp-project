import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, AlertTriangle } from "lucide-react";
import { useFichesNC, useFichesNCStats } from "../../hooks/useFichesNC";
import { getGravitesNC, getStatutsNC } from "../../api/quality";
import PageHeader from "../../components/common/PageHeader";

const GRAVITE_LABELS = Object.fromEntries(
  getGravitesNC().map((g) => [g.value, g.label])
);
const STATUT_LABELS = Object.fromEntries(
  getStatutsNC().map((s) => [s.value, s.label])
);

const GRAVITE_STYLES = {
  mineure: "bg-ink-100 text-ink-700",
  moyenne: "bg-cyan-400/15 text-cyan-600",
  haute: "bg-amber-400/15 text-amber-600",
  critique: "bg-rose-400/15 text-rose-600",
};

const STATUT_STYLES = {
  ouverte: "bg-rose-400/15 text-rose-600",
  en_cours: "bg-amber-400/15 text-amber-600",
  en_attente: "bg-cyan-400/15 text-cyan-600",
  cloturee: "bg-emerald-400/15 text-emerald-600",
  annulee: "bg-ink-100 text-ink-700",
};

export default function NCReports() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFichesNC({ page });
  const { data: stats } = useFichesNCStats();

  const fiches = data?.results ?? data ?? [];
  const totalCount = data?.count ?? fiches.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Fiches de non-conformité"
        action={
          <button
            onClick={() => navigate("/nc/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouvelle fiche NC
          </button>
        }
      />

      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Total NC</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {stats.total_nc}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Ouvertes</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-rose-500">
              {stats.ouvertes}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">En retard</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-amber-600">
              {stats.en_retard}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Lots bloqués</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {stats.lots_bloques}
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : fiches.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune fiche NC.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Numéro</th>
                <th className="px-4 py-3 font-medium">Produit</th>
                <th className="px-4 py-3 font-medium">Gravité</th>
                <th className="px-4 py-3 font-medium">Délai résolution</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {fiches.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => navigate(`/nc/${f.id}`)}
                  className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-100/30"
                >
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {f.numero_nc}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {f.produit_reference}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        GRAVITE_STYLES[f.gravite] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {f.gravite === "critique" && (
                        <AlertTriangle size={12} />
                      )}
                      {GRAVITE_LABELS[f.gravite] || f.gravite}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {f.delai_resolution || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUT_STYLES[f.statut] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {STATUT_LABELS[f.statut] || f.statut}
                    </span>
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
            Page {page} sur {totalPages} ({totalCount} fiches)
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