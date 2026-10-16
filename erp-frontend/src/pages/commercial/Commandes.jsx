import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye } from "lucide-react";
import { useCommandes } from "../../hooks/useCommandes";
import PageHeader from "../../components/common/PageHeader";
import StatutBadge from "../../components/ui/StatutBadge";

export default function Commandes() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error } = useCommandes({
    page,
    search: search || undefined,
  });

  const commandes = data?.results ?? data ?? [];
  const totalCount = data?.count ?? commandes.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Commandes"
        action={
          <button
            onClick={() => navigate("/commandes/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouvelle commande
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
          placeholder="Rechercher un numéro ou un client..."
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
            Erreur : {error?.message || "impossible de charger les commandes"}
          </div>
        ) : commandes.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune commande trouvée.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Numéro</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Livraison prévue</th>
                <th className="px-4 py-3 font-medium">Montant</th>
                <th className="px-4 py-3 font-medium">Taux livraison</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-ink-100 last:border-0 hover:bg-ink-100/30 cursor-pointer"
                  onClick={() => navigate(`/commandes/${c.id}`)}
                >
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {c.numero}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {c.client_nom || c.client_detail?.raison_sociale}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {c.date_livraison_confirmee || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono-data text-ink-900">
                    {Number(c.montant_total).toLocaleString("fr-FR", {
                      minimumFractionDigits: 3,
                    })}{" "}
                    {c.devise || "TND"}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {c.taux_livraison}%
                  </td>
                  <td className="px-4 py-3">
                    <StatutBadge statut={c.statut} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/commandes/${c.id}`);
                      }}
                      className="rounded p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                      title="Voir"
                    >
                      <Eye size={16} />
                    </button>
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
            Page {page} sur {totalPages} ({totalCount} commandes)
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