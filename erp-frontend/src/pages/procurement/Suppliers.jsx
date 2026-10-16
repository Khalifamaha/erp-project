import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { useFournisseurs, useDeleteFournisseur } from "../../hooks/useFournisseurs";
import { getCategoriesFournisseur } from "../../api/procurement";
import PageHeader from "../../components/common/PageHeader";

const CATEGORIE_LABELS = Object.fromEntries(
  getCategoriesFournisseur().map((c) => [c.value, c.label])
);

const STATUT_STYLES = {
  actif: "bg-emerald-400/15 text-emerald-600",
  inactif: "bg-ink-100 text-ink-700",
  blacklist: "bg-rose-400/15 text-rose-600",
  prospect: "bg-cyan-400/15 text-cyan-600",
};

const STATUT_LABELS = {
  actif: "Actif",
  inactif: "Inactif",
  blacklist: "Liste noire",
  prospect: "Prospect",
};

export default function Suppliers() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error } = useFournisseurs({
    page,
    search: search || undefined,
  });
  const deleteFournisseur = useDeleteFournisseur();

  const fournisseurs = data?.results ?? data ?? [];
  const totalCount = data?.count ?? fournisseurs.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleDelete = (id, nom) => {
    if (window.confirm(`Supprimer le fournisseur "${nom}" ?`)) {
      deleteFournisseur.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Fournisseurs"
        action={
          <button
            onClick={() => navigate("/fournisseurs/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouveau fournisseur
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
          placeholder="Rechercher un fournisseur..."
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
            {error?.message || "impossible de charger les fournisseurs"}
          </div>
        ) : fournisseurs.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucun fournisseur trouvé.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Raison sociale</th>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium text-right">
                  Score qualité
                </th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fournisseurs.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-ink-100 last:border-0 hover:bg-ink-100/30"
                >
                  <td className="px-4 py-3 font-mono-data text-ink-500">
                    {f.code}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {f.raison_sociale}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {CATEGORIE_LABELS[f.categorie] || f.categorie}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {f.score_qualite}/100
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
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/fournisseurs/${f.id}`)}
                        className="rounded p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                        title="Voir"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/fournisseurs/${f.id}/edit`)}
                        className="rounded p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id, f.raison_sociale)}
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
            Page {page} sur {totalPages} ({totalCount} fournisseurs)
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