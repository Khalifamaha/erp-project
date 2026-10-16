import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import toast from "react-hot-toast";
import { getOrdres } from "../../api/production";
import { useCriteresParProduit, useSaisieRapideControle } from "../../hooks/useQualite";
import PageHeader from "../../components/common/PageHeader";

export default function ControlForm() {
  const navigate = useNavigate();
  const [selectedOrdre, setSelectedOrdre] = useState(null);
  const saisieRapide = useSaisieRapideControle();

  const { data: ordresData } = useQuery({
    queryKey: ["ordres", { page_size: 200 }],
    queryFn: () => getOrdres({ page_size: 200 }),
  });
  const ordreOptions = (ordresData?.results ?? ordresData ?? []).map((o) => ({
    value: o.id,
    label: `${o.numero} — ${o.produit_reference}`,
    produitId: o.produit,
  }));

  const { data: criteres } = useCriteresParProduit(selectedOrdre?.produitId);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      ordre: null,
      critere: "",
      valeur_mesuree: "",
      quantite_controlee: 1,
      quantite_rebut: 0,
      observations: "",
    },
  });

  const critereId = watch("critere");
  const critereSelectionne = (criteres || []).find((c) => c.id === critereId);

  const onSubmit = async (values) => {
    if (!values.ordre || !values.critere) {
      toast.error("Sélectionne un OF et un critère");
      return;
    }
    try {
      const result = await saisieRapide.mutateAsync({
        ordre_id: values.ordre.value,
        critere_id: values.critere,
        valeur_mesuree: values.valeur_mesuree || undefined,
        quantite_controlee: values.quantite_controlee,
        quantite_rebut: values.quantite_rebut || 0,
        observations: values.observations,
      });
      toast.success(
        result.fiche_nc_creee
          ? "Contrôle enregistré — fiche NC ouverte automatiquement"
          : "Contrôle enregistré"
      );
      navigate("/controles");
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
      <PageHeader title="Nouveau contrôle qualité" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-ink-100 bg-white p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Ordre de fabrication *
          </label>
          <Controller
            name="ordre"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                {...field}
                options={ordreOptions}
                placeholder="Rechercher un OF..."
                classNamePrefix="rs"
                onChange={(opt) => {
                  field.onChange(opt);
                  setSelectedOrdre(opt);
                }}
              />
            )}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Critère qualité *
          </label>
          <select
            {...register("critere", { required: true })}
            disabled={!selectedOrdre}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-ink-100"
          >
            <option value="">
              {selectedOrdre ? "Sélectionner..." : "Choisis d'abord un OF"}
            </option>
            {(criteres || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} {c.critique && "⚠️"} ({c.tolerance_label})
              </option>
            ))}
          </select>
        </div>

        {critereSelectionne && critereSelectionne.type_mesure !== "visuel" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Valeur mesurée ({critereSelectionne.unite})
            </label>
            <input
              type="number"
              step="0.0001"
              {...register("valeur_mesuree")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Quantité contrôlée
            </label>
            <input
              type="number"
              step="0.001"
              {...register("quantite_controlee", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Quantité rebutée
            </label>
            <input
              type="number"
              step="0.001"
              {...register("quantite_rebut", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

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

        {critereSelectionne?.critique && (
          <p className="rounded-lg bg-rose-400/10 px-3 py-2 text-xs text-rose-600">
            ⚠️ Critère critique — une fiche NC sera ouverte automatiquement si
            le résultat est non conforme.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
          <button
            type="button"
            onClick={() => navigate("/controles")}
            className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}