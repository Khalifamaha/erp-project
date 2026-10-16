import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { useEmployes, useDeleteEmploye } from "../../hooks/useEmployes";
import { getDepartements } from "../../api/hr";
import PageHeader from "../../components/common/PageHeader";

const DEPARTEMENT_LABELS = Object.fromEntries(
  getDepartements().map((d) => [d.value, d.label])
);

const STATUT_STYLES = {
  actif: "bg-emerald-400/15 text-emerald-600",
  suspendu: "bg-amber-400/15 text-amber-600",
  conge: "bg-cyan-400/15 text-cyan-600",
  demissionnaire: "bg-ink-100 text-ink-700",
  licencie: "bg-rose-400/15 text-rose-600",
};

const STATUT_LABELS = {
  actif: "Actif",
  suspendu: "Suspendu",
  conge: "En congé",
  demissionnaire: "Démissionnaire",
  licencie: "Licencié",
};

export default function Employees() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error } = useEmployes({
    page,
    search: search || undefined,
  });
  const deleteEmploye = useDeleteEmploye();

  const employes = data?.results ?? data ?? [];
  const totalCount = data?.count ?? employes.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleDelete = (id, nom) => {
    if (window.confirm(`Supprimer l'employé "${nom}" ?`)) {
      deleteEmploye.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Employés"
        action={
          <button
            onClick={() => navigate("/employes/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouvel employé
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
          placeholder="Rechercher un employé..."
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
            Erreur : {error?.message || "impossible de charger les employés"}
          </div>
        ) : employes.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucun employé trouvé.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Matricule</th>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Poste</th>
                <th className="px-4 py-3 font-medium">Département</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employes.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-ink-100 last:border-0 hover:bg-ink-100/30"
                >
                  <td className="px-4 py-3 font-mono-data text-ink-500">
                    {e.matricule}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {e.nom_complet || `${e.prenom} ${e.nom}`}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{e.poste}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {DEPARTEMENT_LABELS[e.departement] || e.departement}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUT_STYLES[e.statut] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {STATUT_LABELS[e.statut] || e.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/employes/${e.id}`)}
                        className="rounded p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                        title="Voir"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/employes/${e.id}/edit`)}
                        className="rounded p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(e.id, e.nom_complet || e.nom)
                        }
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
            Page {page} sur {totalPages} ({totalCount} employés)
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