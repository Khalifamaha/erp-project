import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  useProduit,
  useCreateProduit,
  useUpdateProduit,
} from "../../hooks/useProduits";
import { useCategories } from "../../hooks/useCategories";
import { useEmplacements } from "../../hooks/useCategories";
import { getTypesProduit, getUnitesMesure } from "../../api/inventory";
import PageHeader from "../../components/common/PageHeader";

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const typesProduit = getTypesProduit();
  const unites = getUnitesMesure();

  const { data: existing } = useProduit(id);
  const { data: categoriesData } = useCategories({ page_size: 200 });
  const { data: emplacementsData } = useEmplacements({ page_size: 200 });
  const createProduit = useCreateProduit();
  const updateProduit = useUpdateProduit();

  const categories = categoriesData?.results ?? categoriesData ?? [];
  const emplacements = emplacementsData?.results ?? emplacementsData ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      type: "produit_fini",
      unite_mesure: "piece",
      facteur_conversion: 1,
      stock_minimum: 0,
      stock_maximum: 0,
      stock_securite: 0,
      prix_unitaire: 0,
      cout_revient: 0,
      poids_kg: 0,
      volume_m3: 0,
      actif: true,
    },
  });

  useEffect(() => {
    if (existing) reset(existing);
  }, [existing, reset]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await updateProduit.mutateAsync({ id, payload: values });
        toast.success("Produit mis à jour");
      } else {
        await createProduit.mutateAsync(values);
        toast.success("Produit créé");
      }
      navigate("/produits");
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        typeof data === "object"
          ? Object.values(data).flat().join(" — ")
          : "Une erreur est survenue";
      toast.error(msg);
    }
  };

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <PageHeader title={isEdit ? "Modifier le produit" : "Nouveau produit"} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-ink-100 bg-white p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Référence *
            </label>
            <input
              {...register("reference", {
                required: "La référence est requise",
              })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.reference && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.reference.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Désignation *
            </label>
            <input
              {...register("designation", {
                required: "La désignation est requise",
              })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.designation && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.designation.message}
              </p>
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
              {typesProduit.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Code-barre
            </label>
            <input
              {...register("code_barre")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Catégorie
            </label>
            <select
              {...register("categorie")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Emplacement
            </label>
            <select
              {...register("emplacement")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">—</option>
              {emplacements.map((e) => (
                <option key={e.id} value={e.id}>
                  [{e.code}] {e.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Unité de mesure
            </label>
            <select
              {...register("unite_mesure")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              {unites.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Prix unitaire
            </label>
            <input
              type="number"
              step="0.001"
              {...register("prix_unitaire", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Coût de revient
            </label>
            <input
              type="number"
              step="0.001"
              {...register("cout_revient", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Stock minimum
            </label>
            <input
              type="number"
              step="0.001"
              {...register("stock_minimum", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Stock maximum
            </label>
            <input
              type="number"
              step="0.001"
              {...register("stock_maximum", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Stock de sécurité
            </label>
            <input
              type="number"
              step="0.001"
              {...register("stock_securite", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Poids (kg)
            </label>
            <input
              type="number"
              step="0.001"
              {...register("poids_kg", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={2}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
          <button
            type="button"
            onClick={() => navigate("/produits")}
            className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {isEdit ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </form>
    </div>
  );
}