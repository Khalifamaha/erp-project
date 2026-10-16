import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { getCamions, getCommandes, getIncoterms } from "../../api/commercial";
import { getProduits } from "../../api/inventory";
import { useCreateExpedition } from "../../hooks/useLogistics";
import PageHeader from "../../components/common/PageHeader";

const today = () => new Date().toISOString().slice(0, 10);

export default function ExpeditionForm() {
  const navigate = useNavigate();
  const createExpedition = useCreateExpedition();
  const incoterms = getIncoterms();

  const { data: camionsData } = useQuery({
    queryKey: ["camions", { page_size: 200 }],
    queryFn: () => getCamions({ page_size: 200 }),
  });
  const { data: commandesData } = useQuery({
    queryKey: ["commandes", { page_size: 200 }],
    queryFn: () => getCommandes({ page_size: 200 }),
  });
  const { data: produitsData } = useQuery({
    queryKey: ["produits", { page_size: 500 }],
    queryFn: () => getProduits({ page_size: 500 }),
  });

  const camionOptions = (camionsData?.results ?? camionsData ?? []).map(
    (c) => ({ value: c.id, label: c.immatriculation })
  );
  const commandeOptions = (commandesData?.results ?? commandesData ?? []).map(
    (c) => ({
      value: c.id,
      label: `${c.numero} — ${c.client_nom || ""}`,
    })
  );
  const produitOptions = (produitsData?.results ?? produitsData ?? []).map(
    (p) => ({
      value: p.id,
      label: `${p.reference} — ${p.designation}`,
    })
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      numero: "",
      camion: null,
      commande_client: null,
      date_depart: today(),
      date_arrivee_prev: "",
      destination: "",
      pays_destination: "Tunisie",
      incoterm: "",
      notes: "",
      lignes: [{ produit: null, quantite: 1, poids: 0, unite: "piece" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lignes",
  });

  const onSubmit = async (values) => {
    const payload = {
      numero: values.numero,
      camion: values.camion?.value || null,
      commande_client: values.commande_client?.value || null,
      date_depart: values.date_depart,
      date_arrivee_prev: values.date_arrivee_prev || null,
      destination: values.destination,
      pays_destination: values.pays_destination,
      incoterm: values.incoterm || "",
      notes: values.notes,
      lignes: values.lignes
        .filter((l) => l.produit)
        .map((l) => ({
          produit: l.produit.value,
          quantite: l.quantite,
          poids: l.poids || 0,
          unite: l.unite || "piece",
        })),
    };

    try {
      await createExpedition.mutateAsync(payload);
      toast.success("Expédition créée");
      navigate("/expeditions");
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
    <div className="p-6 max-w-4xl space-y-6">
      <PageHeader title="Nouvelle expédition" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-ink-100 bg-white p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Numéro *
            </label>
            <input
              {...register("numero", { required: "Le numéro est requis" })}
              placeholder="EXP-2026-0001"
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
              Commande client liée
            </label>
            <Controller
              name="commande_client"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={commandeOptions}
                  placeholder="Rechercher une commande..."
                  classNamePrefix="rs"
                  isClearable
                />
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Camion
            </label>
            <Controller
              name="camion"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={camionOptions}
                  placeholder="Sélectionner un camion..."
                  classNamePrefix="rs"
                  isClearable
                />
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Incoterm
            </label>
            <select
              {...register("incoterm")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">—</option>
              {incoterms.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Date de départ *
            </label>
            <input
              type="date"
              {...register("date_depart", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Arrivée prévue
            </label>
            <input
              type="date"
              {...register("date_arrivee_prev")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Destination
            </label>
            <input
              {...register("destination")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Pays destination
            </label>
            <input
              {...register("pays_destination")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Lignes d'expédition */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-ink-900">
              Produits expédiés
            </h3>
            <button
              type="button"
              onClick={() =>
                append({ produit: null, quantite: 1, poids: 0, unite: "piece" })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-100"
            >
              <Plus size={14} />
              Ajouter une ligne
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-2 rounded-lg border border-ink-100 p-3"
              >
                <div className="col-span-6">
                  <Controller
                    name={`lignes.${index}.produit`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={produitOptions}
                        placeholder="Produit..."
                        classNamePrefix="rs"
                      />
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Qté"
                    {...register(`lignes.${index}.quantite`, {
                      valueAsNumber: true,
                      min: 0.001,
                    })}
                    className="w-full rounded-lg border border-ink-300 px-2 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Poids (kg)"
                    {...register(`lignes.${index}.poids`, {
                      valueAsNumber: true,
                      min: 0,
                    })}
                    className="w-full rounded-lg border border-ink-300 px-2 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    placeholder="Unité"
                    {...register(`lignes.${index}.unite`)}
                    className="w-full rounded-lg border border-ink-300 px-2 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="rounded p-1.5 text-ink-500 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Notes
          </label>
          <textarea
            {...register("notes")}
            rows={2}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
          <button
            type="button"
            onClick={() => navigate("/expeditions")}
            className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Créer l'expédition
          </button>
        </div>
      </form>
    </div>
  );
}