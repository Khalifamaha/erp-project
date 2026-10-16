import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useOrdres, useOrdresStats } from "../../hooks/useOrdres";
import { getStatutsOrdre, getPriorites } from "../../api/production";
import PageHeader from "../../components/common/PageHeader";

const STATUT_LABELS = Object.fromEntries(
  getStatutsOrdre().map((s) => [s.value, s.label])
);
const PRIORITE_LABELS = Object.fromEntries(
  getPriorites().map((p) => [p.value, p.label])
);

const STATUT_STYLES = {
  brouillon: "bg-ink-100 text-ink-700",
  planifie: "bg-cyan-400/15 text-cyan-600",
  lance: "bg-amber-400/15 text-amber-600",
  en_cours: "bg-amber-400/15 text-amber-600",
  pause: "bg-rose-400/15 text-rose-600",
  termine: "bg-emerald-400/15 text-emerald-600",
  annule: "bg-ink-100 text-ink-700",
};

const PRIORITE_STYLES = {
  1: "text-rose-500",
  2: "text-amber-600",
  3: "text-ink-700",
  4: "text-ink-500",
};

export default function Orders() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error } = useOrdres({
    page,
    search: search || undefined,
  });
  const { data: stats } = useOrdresStats();

  const ordres = data?.results ?? data ?? [];
  const totalCount = data?.count ?? ordres.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Ordres de fabrication"
        action={
          <button
            onClick={() => navigate("/of/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouvel OF
          </button>
        }
      />

      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Total OF</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {stats.total_of}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">En cours</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-amber-600">
              {stats.en_cours}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Terminés</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-emerald-600">
              {stats.termines}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Annulés</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-500">
              {stats.annules}
            </p>
          </div>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Rechercher un numéro d'OF, produit..."
          className="w-full rounded-lg border border-ink-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-rose-500">
            Erreur : {error?.message || "impossible de charger les OF"}
          </div>
        ) : ordres.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucun ordre de fabrication.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Numéro</th>
                <th className="px-4 py-3 font-medium">Produit</th>
                <th className="px-4 py-3 font-medium text-right">
                  Avancement
                </th>
                <th className="px-4 py-3 font-medium">Priorité</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {ordres.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/of/${o.id}`)}
                  className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-100/30"
                >
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {o.numero}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {o.produit_reference}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {o.quantite_produite} / {o.quantite_prevue} (
                    {o.taux_avancement}%)
                  </td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      PRIORITE_STYLES[o.priorite] || "text-ink-700"
                    }`}
                  >
                    {PRIORITE_LABELS[o.priorite] || o.priorite}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUT_STYLES[o.statut] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {STATUT_LABELS[o.statut] || o.statut}
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
            Page {page} sur {totalPages} ({totalCount} OF)
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