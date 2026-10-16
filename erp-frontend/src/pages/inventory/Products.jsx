import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Eye, AlertTriangle } from "lucide-react";
import { useProduits, useDeleteProduit } from "../../hooks/useProduits";
import { getTypesProduit } from "../../api/inventory";
import PageHeader from "../../components/common/PageHeader";

const TYPE_LABELS = Object.fromEntries(
  getTypesProduit().map((t) => [t.value, t.label])
);

export default function Products() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error } = useProduits({
    page,
    search: search || undefined,
  });
  const deleteProduit = useDeleteProduit();

  const produits = data?.results ?? data ?? [];
  const totalCount = data?.count ?? produits.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleDelete = (id, ref) => {
    if (window.confirm(`Supprimer le produit "${ref}" ?`)) {
      deleteProduit.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Produits"
        action={
          <button
            onClick={() => navigate("/produits/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouveau produit
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
          placeholder="Rechercher une référence, désignation..."
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
            Erreur : {error?.message || "impossible de charger les produits"}
          </div>
        ) : produits.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucun produit trouvé.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Référence</th>
                <th className="px-4 py-3 font-medium">Désignation</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium text-right">Stock</th>
                <th className="px-4 py-3 font-medium text-right">
                  Prix unit.
                </th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-ink-100 last:border-0 hover:bg-ink-100/30"
                >
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {p.reference}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{p.designation}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {TYPE_LABELS[p.type] || p.type}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.est_rupture ? (
                        <AlertTriangle size={14} className="text-rose-500" />
                      ) : p.est_sous_seuil ? (
                        <AlertTriangle size={14} className="text-amber-500" />
                      ) : null}
                      <span
                        className={`font-mono-data ${
                          p.est_rupture
                            ? "text-rose-500 font-semibold"
                            : p.est_sous_seuil
                            ? "text-amber-600 font-semibold"
                            : "text-ink-900"
                        }`}
                      >
                        {p.stock_actuel} {p.unite_mesure}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {Number(p.prix_unitaire).toLocaleString("fr-FR", {
                      minimumFractionDigits: 3,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/produits/${p.id}`)}
                        className="rounded p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                        title="Voir"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/produits/${p.id}/edit`)}
                        className="rounded p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.reference)}
                        className="rounded p-1.5 text-ink-500 hover:bg-rose-50 hover:text-rose-500"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
            Page {page} sur {totalPages} ({totalCount} produits)
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