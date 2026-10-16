import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useExpeditions } from "../../hooks/useLogistics";
import PageHeader from "../../components/common/PageHeader";

const STATUT_STYLES = {
  preparee: "bg-ink-100 text-ink-700",
  chargee: "bg-cyan-400/15 text-cyan-600",
  en_route: "bg-amber-400/15 text-amber-600",
  livree: "bg-emerald-400/15 text-emerald-600",
  refusee: "bg-rose-400/15 text-rose-600",
  annulee: "bg-rose-400/15 text-rose-600",
};

const STATUT_LABELS = {
  preparee: "En préparation",
  chargee: "Chargée",
  en_route: "En route",
  livree: "Livrée",
  refusee: "Refusée par client",
  annulee: "Annulée",
};

export default function Expeditions() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error } = useExpeditions({
    page,
    search: search || undefined,
  });

  const expeditions = data?.results ?? data ?? [];
  const totalCount = data?.count ?? expeditions.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Expéditions"
        action={
          <button
            onClick={() => navigate("/expeditions/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouvelle expédition
          </button>
        }
      />

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
          placeholder="Rechercher un numéro ou destination..."
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
            Erreur :{" "}
            {error?.message || "impossible de charger les expéditions"}
          </div>
        ) : expeditions.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune expédition trouvée.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Numéro</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Camion</th>
                <th className="px-4 py-3 font-medium">Départ</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {expeditions.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-ink-100 last:border-0 hover:bg-ink-100/30"
                >
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {e.numero}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {e.client_nom || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {e.destination}, {e.pays_destination}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {e.camion_detail?.immatriculation || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{e.date_depart}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUT_STYLES[e.statut] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {STATUT_LABELS[e.statut] || e.statut}
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
            Page {page} sur {totalPages} ({totalCount} expéditions)
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