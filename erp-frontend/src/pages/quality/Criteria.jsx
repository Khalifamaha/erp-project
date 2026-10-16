import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import {
  useCriteres,
  useCreateCritere,
  useDeleteCritere,
} from "../../hooks/useQualite";
import { getProduits } from "../../api/inventory";
import { getTypesMesure } from "../../api/quality";
import PageHeader from "../../components/common/PageHeader";

export default function Criteria() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useCriteres({ page_size: 200 });
  const { data: produitsData } = useQuery({
    queryKey: ["produits", { page_size: 500 }],
    queryFn: () => getProduits({ page_size: 500 }),
  });
  const createCritere = useCreateCritere();
  const deleteCritere = useDeleteCritere();

  const criteres = data?.results ?? data ?? [];
  const produits = produitsData?.results ?? produitsData ?? [];
  const typesMesure = getTypesMesure();
  const TYPE_LABELS = Object.fromEntries(
    typesMesure.map((t) => [t.value, t.label])
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await createCritere.mutateAsync({
        ...values,
        valeur_min: values.valeur_min || null,
        valeur_max: values.valeur_max || null,
        valeur_cible: values.valeur_cible || null,
        critique: Boolean(values.critique),
      });
      toast.success("Critère créé");
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
    if (window.confirm(`Supprimer le critère "${nom}" ?`)) {
      deleteCritere.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Critères qualité"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouveau critère
          </button>
        }
      />

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-3 gap-3 rounded-xl border border-ink-100 bg-white p-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Produit *
            </label>
            <select
              {...register("produit", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Sélectionner...</option>
              {produits.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.reference} — {p.designation}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Nom *
            </label>
            <input
              {...register("nom", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Type de mesure *
            </label>
            <select
              {...register("type_mesure", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Sélectionner...</option>
              {typesMesure.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Valeur min
            </label>
            <input
              type="number"
              step="0.0001"
              {...register("valeur_min")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Valeur max
            </label>
            <input
              type="number"
              step="0.0001"
              {...register("valeur_max")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Unité
            </label>
            <input
              {...register("unite")}
              placeholder="mm, kg, V..."
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Fréquence de contrôle
            </label>
            <input
              {...register("frequence")}
              placeholder="1 pièce sur 10, début de série..."
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="critique"
              {...register("critique")}
              className="h-4 w-4 rounded border-ink-300"
            />
            <label htmlFor="critique" className="text-sm text-ink-700">
              Critère critique
            </label>
          </div>
          <div className="col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Créer
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : criteres.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucun critère qualité.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Produit</th>
                <th className="px-4 py-3 font-medium">Critère</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Tolérance</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {criteres.map((c) => (
                <tr key={c.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-mono-data text-ink-500">
                    {c.produit_reference}
                  </td>
                  <td className="px-4 py-3 text-ink-900">
                    <div className="flex items-center gap-1.5">
                      {c.critique && (
                        <AlertTriangle size={14} className="text-rose-500" />
                      )}
                      {c.nom}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {TYPE_LABELS[c.type_mesure] || c.type_mesure}
                  </td>
                  <td className="px-4 py-3 font-mono-data text-ink-700">
                    {c.tolerance_label}
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