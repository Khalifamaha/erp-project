import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useGenererBulkPaiements } from "../../hooks/usePaie";
import { getDepartements } from "../../api/hr";
import PageHeader from "../../components/common/PageHeader";

export default function PayrollGeneration() {
  const navigate = useNavigate();
  const departements = getDepartements();
  const genererBulk = useGenererBulkPaiements();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      const result = await genererBulk.mutateAsync({
        periode_debut: values.periode_debut,
        periode_fin: values.periode_fin,
        departement: values.departement || undefined,
      });
      toast.success(result.message || "Bulletins générés");
      navigate("/paie");
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
    <div className="p-6 max-w-xl space-y-6">
      <PageHeader title="Générer les bulletins de paie" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-ink-100 bg-white p-6"
      >
        <p className="text-sm text-ink-500">
          Un bulletin en brouillon sera créé pour chaque employé actif de la
          période sélectionnée (ceux qui en ont déjà un pour cette période
          seront ignorés).
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Début de période *
            </label>
            <input
              type="date"
              {...register("periode_debut", { required: "Requis" })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.periode_debut && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.periode_debut.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Fin de période *
            </label>
            <input
              type="date"
              {...register("periode_fin", { required: "Requis" })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.periode_fin && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.periode_fin.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Département (optionnel)
          </label>
          <select
            {...register("departement")}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Tous les départements</option>
            {departements.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
          <button
            type="button"
            onClick={() => navigate("/paie")}
            className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Générer
          </button>
        </div>
      </form>
    </div>
  );
}