import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useCamion,
  useCreateCamion,
  useUpdateCamion,
} from "../../hooks/useLogistics";
import { getCamionStatuts } from "../../api/commercial";
import PageHeader from "../../components/common/PageHeader";

export default function CamionForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const statuts = getCamionStatuts();

  const { data: existing } = useCamion(id);
  const createCamion = useCreateCamion();
  const updateCamion = useUpdateCamion();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      statut: "disponible",
      capacite_kg: 0,
      volume_m3: 0,
    },
  });

  useEffect(() => {
    if (existing) reset(existing);
  }, [existing, reset]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await updateCamion.mutateAsync({ id, payload: values });
        toast.success("Camion mis à jour");
      } else {
        await createCamion.mutateAsync(values);
        toast.success("Camion créé");
      }
      navigate("/camions");
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
      <PageHeader title={isEdit ? "Modifier le camion" : "Nouveau camion"} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-ink-100 bg-white p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Immatriculation *
            </label>
            <input
              {...register("immatriculation", {
                required: "L'immatriculation est requise",
              })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.immatriculation && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.immatriculation.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Statut
            </label>
            <select
              {...register("statut")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              {statuts.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Marque
            </label>
            <input
              {...register("marque")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Modèle
            </label>
            <input
              {...register("modele")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              N° de série
            </label>
            <input
              {...register("numero_serie")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Type de transport
            </label>
            <input
              {...register("type_transport")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Capacité (kg)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("capacite_kg", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Volume (m³)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("volume_m3", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Prochaine révision
            </label>
            <input
              type="date"
              {...register("prochaine_revision")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Chauffeur
            </label>
            <input
              {...register("chauffeur_nom")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Téléphone chauffeur
            </label>
            <input
              {...register("chauffeur_telephone")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              N° permis
            </label>
            <input
              {...register("numero_permis")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
          <button
            type="button"
            onClick={() => navigate("/camions")}
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