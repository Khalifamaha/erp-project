import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useExercices, useComptes, useCreateEcriture } from "../../hooks/useComptabilite";
import { getJournaux } from "../../api/comptabilite";
import PageHeader from "../../components/common/PageHeader";

export default function JournalEntryForm() {
  const navigate = useNavigate();
  const journaux = getJournaux();
  const { data: exercicesData } = useExercices({ page_size: 50 });
  const exercices = exercicesData?.results ?? exercicesData ?? [];
  const { data: comptesData } = useComptes({ page_size: 200 });
  const comptes = comptesData?.results ?? comptesData ?? [];
  const createEcriture = useCreateEcriture();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      date_ecriture: new Date().toISOString().slice(0, 10),
      journal: "od",
    },
  });

  const onSubmit = async (values) => {
    try {
      await createEcriture.mutateAsync({
        ...values,
        montant: Number(values.montant),
      });
      toast.success("Écriture créée");
      navigate("/ecritures");
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
      <PageHeader title="Nouvelle écriture comptable" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-ink-100 bg-white p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Exercice *
            </label>
            <select
              {...register("exercice", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Sélectionner...</option>
              {exercices.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.libelle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Journal *
            </label>
            <select
              {...register("journal", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              {journaux.map((j) => (
                <option key={j.value} value={j.value}>
                  {j.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Compte à débiter *
            </label>
            <select
              {...register("compte_debit", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Sélectionner...</option>
              {comptes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numero_compte} — {c.libelle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Compte à créditer *
            </label>
            <select
              {...register("compte_credit", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Sélectionner...</option>
              {comptes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numero_compte} — {c.libelle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Montant *
            </label>
            <input
              type="number"
              step="0.001"
              {...register("montant", { required: true, min: 0.001 })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Date *
            </label>
            <input
              type="date"
              {...register("date_ecriture", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Libellé *
          </label>
          <input
            {...register("libelle", { required: "Le libellé est requis" })}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          {errors.libelle && (
            <p className="mt-1 text-xs text-rose-500">
              {errors.libelle.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Référence externe
          </label>
          <input
            {...register("reference_externe")}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
          <button
            type="button"
            onClick={() => navigate("/ecritures")}
            className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Créer
          </button>
        </div>
      </form>
    </div>
  );
}