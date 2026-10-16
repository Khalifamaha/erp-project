import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Lock, Settings } from "lucide-react";
import {
  useExercices,
  useCreateExercice,
  useCloturerExercice,
  useInitPlanExercice,
} from "../../hooks/useComptabilite";
import PageHeader from "../../components/common/PageHeader";

const STATUT_STYLES = {
  ouvert: "bg-emerald-400/15 text-emerald-600",
  cloture: "bg-ink-100 text-ink-700",
  archive: "bg-ink-100 text-ink-500",
};

export default function FiscalYear() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useExercices({ page_size: 50 });
  const createExercice = useCreateExercice();
  const cloturerExercice = useCloturerExercice();
  const initPlan = useInitPlanExercice();
  const exercices = data?.results ?? data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await createExercice.mutateAsync(values);
      toast.success("Exercice créé");
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

  const handleInitPlan = async (id) => {
    try {
      const result = await initPlan.mutateAsync(id);
      toast.success(result.message || "Plan comptable initialisé");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  const handleCloturer = async (id, libelle) => {
    if (!window.confirm(`Clôturer l'exercice "${libelle}" ? Action définitive.`))
      return;
    try {
      await cloturerExercice.mutateAsync(id);
      toast.success("Exercice clôturé");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Exercices comptables"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouvel exercice
          </button>
        }
      />

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-4 items-end gap-3 rounded-xl border border-ink-100 bg-white p-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Libellé *
            </label>
            <input
              {...register("libelle", { required: true })}
              placeholder="Exercice 2026"
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Date début *
            </label>
            <input
              type="date"
              {...register("date_debut", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Date fin *
            </label>
            <input
              type="date"
              {...register("date_fin", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Créer
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : exercices.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucun exercice comptable.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Libellé</th>
                <th className="px-4 py-3 font-medium">Période</th>
                <th className="px-4 py-3 font-medium text-right">
                  Comptes
                </th>
                <th className="px-4 py-3 font-medium text-right">
                  Écritures
                </th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exercices.map((e) => (
                <tr key={e.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {e.libelle}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {e.date_debut} → {e.date_fin}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {e.nb_comptes}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {e.nb_ecritures}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUT_STYLES[e.statut] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {e.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {e.nb_comptes === 0 && (
                        <button
                          onClick={() => handleInitPlan(e.id)}
                          className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-cyan-600 hover:bg-cyan-50"
                          title="Initialiser le plan comptable"
                        >
                          <Settings size={14} />
                          Init. plan
                        </button>
                      )}
                      {!e.cloture && (
                        <button
                          onClick={() => handleCloturer(e.id, e.libelle)}
                          className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50"
                          title="Clôturer"
                        >
                          <Lock size={14} />
                          Clôturer
                        </button>
                      )}
                    </div>
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