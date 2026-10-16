import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import toast from "react-hot-toast";
import { getProduits } from "../../api/inventory";
import { getGammes, getPriorites } from "../../api/production";
import { useCreateOrdre } from "../../hooks/useOrdres";
import PageHeader from "../../components/common/PageHeader";

export default function OrderForm() {
  const navigate = useNavigate();
  const createOrdre = useCreateOrdre();
  const priorites = getPriorites();
  const [selectedProduit, setSelectedProduit] = useState(null);

  const { data: produitsData } = useQuery({
    queryKey: ["produits", { page_size: 500 }],
    queryFn: () => getProduits({ page_size: 500 }),
  });
  const { data: gammesData } = useQuery({
    queryKey: ["gammes", { produit: selectedProduit?.value, page_size: 50 }],
    queryFn: () =>
      getGammes({ produit: selectedProduit?.value, page_size: 50 }),
    enabled: !!selectedProduit,
  });

  const produitOptions = (produitsData?.results ?? produitsData ?? []).map(
    (p) => ({ value: p.id, label: `${p.reference} — ${p.designation}` })
  );
  const gammeOptions = (gammesData?.results ?? gammesData ?? []).map((g) => ({
    value: g.id,
    label: `${g.nom} — v${g.version}${g.active ? " (active)" : ""}`,
  }));

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      numero: "",
      produit: null,
      gamme: null,
      quantite_prevue: 1,
      date_debut_prev: "",
      date_fin_prev: "",
      priorite: 3,
      notes_operateur: "",
    },
  });

  const onSubmit = async (values) => {
    if (!values.produit || !values.gamme) {
      toast.error("Sélectionne un produit et une gamme");
      return;
    }
    const payload = {
      numero: values.numero,
      produit: values.produit.value,
      gamme: values.gamme.value,
      quantite_prevue: values.quantite_prevue,
      date_debut_prev: values.date_debut_prev || null,
      date_fin_prev: values.date_fin_prev || null,
      priorite: Number(values.priorite),
      notes_operateur: values.notes_operateur,
    };
    try {
      await createOrdre.mutateAsync(payload);
      toast.success("Ordre de fabrication créé");
      navigate("/of");
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
    <div className="p-6 max-w-2xl space-y-6">
      <PageHeader title="Nouvel ordre de fabrication" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-ink-100 bg-white p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Numéro *
          </label>
          <input
            {...register("numero", { required: "Le numéro est requis" })}
            placeholder="OF-2026-0001"
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          {errors.numero && (
            <p className="mt-1 text-xs text-rose-500">
              {errors.numero.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Produit *
          </label>
          <Controller
            name="produit"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                {...field}
                options={produitOptions}
                placeholder="Rechercher un produit..."
                classNamePrefix="rs"
                onChange={(opt) => {
                  field.onChange(opt);
                  setSelectedProduit(opt);
                }}
              />
            )}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Gamme opératoire *
          </label>
          <Controller
            name="gamme"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                {...field}
                options={gammeOptions}
                placeholder={
                  selectedProduit
                    ? "Sélectionner une gamme..."
                    : "Choisis d'abord un produit"
                }
                isDisabled={!selectedProduit}
                classNamePrefix="rs"
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Quantité prévue *
            </label>
            <input
              type="number"
              step="0.001"
              {...register("quantite_prevue", {
                required: true,
                valueAsNumber: true,
                min: 0.001,
              })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Priorité
            </label>
            <select
              {...register("priorite")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              {priorites.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Début prévu
            </label>
            <input
              type="date"
              {...register("date_debut_prev")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Fin prévue
            </label>
            <input
              type="date"
              {...register("date_fin_prev")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Notes
          </label>
          <textarea
            {...register("notes_operateur")}
            rows={2}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
          <button
            type="button"
            onClick={() => navigate("/of")}
            className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Créer l'OF
          </button>
        </div>
      </form>
    </div>
  );
}