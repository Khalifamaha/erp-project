import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import client from "../../api/client";
import PageHeader from "../../components/common/PageHeader";

const TYPES_SHIFT = [
  { value: "1x8", label: "1 shift x 8h" },
  { value: "2x8", label: "2 shifts x 8h" },
  { value: "3x8", label: "3 shifts x 8h" },
  { value: "5j", label: "5 jours / semaine" },
  { value: "6j", label: "6 jours / semaine" },
  { value: "7j", label: "7 jours / semaine" },
];

async function createChaine(payload) {
  const { data } = await client.post("/production/chaines/", payload);
  return data;
}

export default function ChaineForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const creerChaine = useMutation({ mutationFn: createChaine });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      type_shift: "2x8",
      statut: "active",
      objectif_heure: 0,
      objectif_jour: 0,
      objectif_shift: 0,
      capacite_max: 0,
    },
  });

  const onSubmit = async (values) => {
    try {
      await creerChaine.mutateAsync(values);
      toast.success("Chaîne de production créée");
      queryClient.invalidateQueries({ queryKey: ["chaines"] });
      navigate("/production");
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
      <PageHeader title="Nouvelle chaîne de production" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-ink-100 bg-white p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Code *
            </label>
            <input
              {...register("code", { required: "Le code est requis" })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.code && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.code.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Nom *
            </label>
            <input
              {...register("nom", { required: "Le nom est requis" })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.nom && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.nom.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Objectif / heure (pcs)
            </label>
            <input
              type="number"
              {...register("objectif_heure", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Objectif / jour (pcs)
            </label>
            <input
              type="number"
              {...register("objectif_jour", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Objectif / shift (pcs)
            </label>
            <input
              type="number"
              {...register("objectif_shift", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Capacité max
            </label>
            <input
              type="number"
              step="0.01"
              {...register("capacite_max", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Type de shift
            </label>
            <select
              {...register("type_shift")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              {TYPES_SHIFT.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
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
            onClick={() => navigate("/production")}
            className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Créer la chaîne
          </button>
        </div>
      </form>
    </div>
  );
}