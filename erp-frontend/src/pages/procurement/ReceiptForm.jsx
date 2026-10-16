import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import toast from "react-hot-toast";
import client from "../../api/client";
import PageHeader from "../../components/common/PageHeader";

const today = () => new Date().toISOString().slice(0, 10);

async function getCommandesConfirmees() {
  const { data } = await client.get("/procurement/commandes/", {
    params: { page_size: 200 },
  });
  const list = data?.results ?? data ?? [];
  return list.filter((c) => ["confirmee", "partielle"].includes(c.statut));
}

async function getCommandeDetail(id) {
  const { data } = await client.get(`/procurement/commandes/${id}/`);
  return data;
}

async function createReception(payload) {
  const { data } = await client.post("/procurement/receptions/", payload);
  return data;
}

export default function ReceiptForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCommande, setSelectedCommande] = useState(null);

  const { data: commandes } = useQuery({
    queryKey: ["commandes-achat", "confirmees"],
    queryFn: getCommandesConfirmees,
  });
  const commandeOptions = (commandes || []).map((c) => ({
    value: c.id,
    label: `${c.numero} — ${c.fournisseur_detail?.raison_sociale}`,
  }));

  const { data: commandeDetail } = useQuery({
    queryKey: ["commandes-achat", selectedCommande?.value],
    queryFn: () => getCommandeDetail(selectedCommande.value),
    enabled: !!selectedCommande,
  });

  const creerReception = useMutation({
    mutationFn: createReception,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receptions"] });
    },
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      numero: "",
      commande: null,
      date_reception: today(),
      num_bl: "",
      num_camion: "",
      observations: "",
      lignes: [],
    },
  });

  const { fields, replace } = useFieldArray({ control, name: "lignes" });

  const handleCommandeChange = (opt) => {
    setSelectedCommande(opt);
    setValue("commande", opt);
  };

  // Une fois le détail de la commande chargé, initialiser les lignes
  useState(() => {}, []); // no-op to keep hooks order stable
  if (
    commandeDetail &&
    fields.length === 0 &&
    commandeDetail.lignes?.length > 0
  ) {
    replace(
      commandeDetail.lignes
        .filter((l) => l.quantite_restante > 0)
        .map((l) => ({
          ligne_commande: l.id,
          produit_label: `${l.produit_reference} — ${l.produit_designation}`,
          quantite_restante: l.quantite_restante,
          quantite_recue: l.quantite_restante,
          numero_lot: "",
          date_expiration_lot: "",
        }))
    );
  }

  const onSubmit = async (values) => {
    if (!values.commande) {
      toast.error("Sélectionne une commande");
      return;
    }
    if (!values.lignes || values.lignes.length === 0) {
      toast.error("Aucune ligne à réceptionner");
      return;
    }
    const payload = {
      numero: values.numero,
      commande: values.commande.value,
      date_reception: values.date_reception,
      num_bl: values.num_bl,
      num_camion: values.num_camion,
      observations: values.observations,
      lignes: values.lignes.map((l) => ({
        ligne_commande: l.ligne_commande,
        quantite_recue: Number(l.quantite_recue),
        numero_lot: l.numero_lot || "",
        date_expiration_lot: l.date_expiration_lot || null,
      })),
    };
    try {
      await creerReception.mutateAsync(payload);
      toast.success("Réception créée");
      navigate("/receptions");
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
      <PageHeader title="Nouvelle réception" />

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
              placeholder="REC-2026-0001"
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
              Commande d'achat *
            </label>
            <Controller
              name="commande"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={commandeOptions}
                  placeholder="Rechercher une commande confirmée..."
                  classNamePrefix="rs"
                  onChange={handleCommandeChange}
                />
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Date de réception *
            </label>
            <input
              type="date"
              {...register("date_reception", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              N° bon de livraison
            </label>
            <input
              {...register("num_bl")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              N° camion
            </label>
            <input
              {...register("num_camion")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {selectedCommande && (
          <div>
            <h3 className="mb-2 font-display text-sm font-semibold text-ink-900">
              Lignes à réceptionner
            </h3>
            {fields.length === 0 ? (
              <p className="text-sm text-ink-500">
                Cette commande n'a plus de quantité restante à recevoir.
              </p>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-2 rounded-lg border border-ink-100 p-3"
                  >
                    <div className="col-span-4 flex items-center text-sm text-ink-900">
                      {field.produit_label}
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs text-ink-500">
                        Qté restante : {field.quantite_restante}
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        {...register(`lignes.${index}.quantite_recue`, {
                          required: true,
                          valueAsNumber: true,
                          min: 0.001,
                        })}
                        className="w-full rounded-lg border border-ink-300 px-2 py-2 text-sm outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="mb-1 block text-xs text-ink-500">
                        N° lot
                      </label>
                      <input
                        {...register(`lignes.${index}.numero_lot`)}
                        className="w-full rounded-lg border border-ink-300 px-2 py-2 text-sm outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="mb-1 block text-xs text-ink-500">
                        Date expiration lot
                      </label>
                      <input
                        type="date"
                        {...register(`lignes.${index}.date_expiration_lot`)}
                        className="w-full rounded-lg border border-ink-300 px-2 py-2 text-sm outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Observations
          </label>
          <textarea
            {...register("observations")}
            rows={2}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
          <button
            type="button"
            onClick={() => navigate("/receptions")}
            className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || fields.length === 0}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Créer la réception
          </button>
        </div>
      </form>
    </div>
  );
}