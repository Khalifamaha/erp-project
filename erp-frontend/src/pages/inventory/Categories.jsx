import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import {
  useCategories,
  useCreateCategorie,
  useDeleteCategorie,
} from "../../hooks/useCategories";
import { getTypesProduit } from "../../api/inventory";
import PageHeader from "../../components/common/PageHeader";

const TYPE_LABELS = Object.fromEntries(
  getTypesProduit().map((t) => [t.value, t.label])
);

export default function Categories() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useCategories({ page_size: 200 });
  const createCategorie = useCreateCategorie();
  const deleteCategorie = useDeleteCategorie();
  const categories = data?.results ?? data ?? [];
  const typesProduit = getTypesProduit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await createCategorie.mutateAsync({
        ...values,
        parent: values.parent || null,
      });
      toast.success("Catégorie créée");
      reset();
      setShowForm(false);
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        typeof data === "object"
          ? Object.values(data).flat().join(" — ")
          : "Une erreur est survenue";
      toast.error(msg);
    }
  };

  const handleDelete = (id, nom) => {
    if (window.confirm(`Supprimer la catégorie "${nom}" ?`)) {
      deleteCategorie.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Catégories"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouvelle catégorie
          </button>
        }
      />

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-4 items-end gap-3 rounded-xl border border-ink-100 bg-white p-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Nom *
            </label>
            <input
              {...register("nom", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.nom && (
              <p className="mt-1 text-xs text-rose-500">Requis</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Type *
            </label>
            <select
              {...register("type", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Sélectionner...</option>
              {typesProduit.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Catégorie parente
            </label>
            <select
              {...register("parent")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Aucune (racine)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Créer
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune catégorie.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium text-right">Produits</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 text-ink-900">
                    {"—".repeat(c.niveau_arbre)} {c.nom}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {TYPE_LABELS[c.type] || c.type}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {c.nombre_produits}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id, c.nom)}
                      className="rounded p-1.5 text-ink-500 hover:bg-rose-50 hover:text-rose-500"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
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