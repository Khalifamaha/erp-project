import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { getClients, getIncoterms } from "../../api/commercial";
import { getProduits } from "../../api/inventory";
import { useCreateCommande } from "../../hooks/useCommandes";
import PageHeader from "../../components/common/PageHeader";

const today = () => new Date().toISOString().slice(0, 10);

export default function CommandeForm() {
  const navigate = useNavigate();
  const createCommande = useCreateCommande();
  const incoterms = getIncoterms();

  const { data: clientsData } = useQuery({
    queryKey: ["clients", { page_size: 200 }],
    queryFn: () => getClients({ page_size: 200 }),
  });
  const { data: produitsData } = useQuery({
    queryKey: ["produits", { page_size: 500 }],
    queryFn: () => getProduits({ page_size: 500 }),
  });

  const clientOptions = (clientsData?.results ?? clientsData ?? []).map(
    (c) => ({ value: c.id, label: c.raison_sociale || c.nom })
  );
  const produitOptions = (produitsData?.results ?? produitsData ?? []).map(
    (p) => ({
      value: p.id,
      label: `${p.reference} — ${p.designation}`,
      prix_unitaire: p.prix_unitaire,
    })
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      numero: "",
      client: null,
      date_commande: today(),
      date_livraison_souhaitee: "",
      devise: "TND",
      incoterm: "EXW",
      notes: "",
      lignes: [
        {
          produit: null,
          quantite_commandee: 1,
          prix_unitaire: 0,
          remise_pct: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lignes",
  });

  const lignes = watch("lignes");
  const montantTotal = (lignes || []).reduce((sum, l) => {
    const base = (l.quantite_commandee || 0) * (l.prix_unitaire || 0);
    const remise = base * ((l.remise_pct || 0) / 100);
    return sum + (base - remise);
  }, 0);

  const onSubmit = async (values) => {
    if (!values.client) {
      toast.error("Sélectionne un client");
      return;
    }
    if (values.lignes.some((l) => !l.produit)) {
      toast.error("Chaque ligne doit avoir un produit");
      return;
    }

    const payload = {
      numero: values.numero,
      client: values.client.value,
      date_commande: values.date_commande,
      date_livraison_souhaitee: values.date_livraison_souhaitee || null,
      devise: values.devise,
      incoterm: values.incoterm,
      notes: values.notes,
      lignes: values.lignes.map((l) => ({
        produit: l.produit.value,
        quantite_commandee: l.quantite_commandee,
        prix_unitaire: l.prix_unitaire,
        remise_pct: l.remise_pct || 0,
      })),
    };

    try {
      await createCommande.mutateAsync(payload);
      toast.success("Commande créée");
      navigate("/commandes");
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
      <PageHeader title="Nouvelle commande" />

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
              placeholder="CMD-2026-0001"
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
              Client *
            </label>
            <Controller
              name="client"
              control={control}
              rules={{ required: "Le client est requis" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={clientOptions}
                  placeholder="Rechercher un client..."
                  classNamePrefix="rs"
                />
              )}
            />
            {errors.client && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.client.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Date de commande *
            </label>
            <input
              type="date"
              {...register("date_commande", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Livraison souhaitée
            </label>
            <input
              type="date"
              {...register("date_livraison_souhaitee")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Devise
            </label>
            <input
              {...register("devise")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
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
              {incoterms.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lignes de commande */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-ink-900">
              Lignes de commande
            </h3>
            <button
              type="button"
              onClick={() =>
                append({
                  produit: null,
                  quantite_commandee: 1,
                  prix_unitaire: 0,
                  remise_pct: 0,
                })
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
                <div className="col-span-5">
                  <Controller
                    name={`lignes.${index}.produit`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={produitOptions}
                        placeholder="Produit..."
                        classNamePrefix="rs"
                        onChange={(opt) => {
                          field.onChange(opt);
                          if (opt?.prix_unitaire) {
                            control._formValues.lignes[index].prix_unitaire =
                              opt.prix_unitaire;
                          }
                        }}
                      />
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Qté"
                    {...register(`lignes.${index}.quantite_commandee`, {
                      required: true,
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
                    placeholder="Prix unit."
                    {...register(`lignes.${index}.prix_unitaire`, {
                      required: true,
                      valueAsNumber: true,
                      min: 0.001,
                    })}
                    className="w-full rounded-lg border border-ink-300 px-2 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Remise %"
                    {...register(`lignes.${index}.remise_pct`, {
                      valueAsNumber: true,
                      min: 0,
                      max: 100,
                    })}
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

        <div className="flex items-center justify-between border-t border-ink-100 pt-4">
          <div className="font-mono-data text-sm text-ink-900">
            Total estimé :{" "}
            <span className="text-base font-semibold">
              {montantTotal.toLocaleString("fr-FR", {
                minimumFractionDigits: 3,
              })}{" "}
              {watch("devise") || "TND"}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/commandes")}
              className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Créer la commande
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}