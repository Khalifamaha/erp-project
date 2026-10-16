import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { useExercices } from "../../hooks/useComptabilite";
import { useComptes, useCreateCompte } from "../../hooks/useComptabilite";
import { getTypesCompte, getClassesCompte } from "../../api/comptabilite";
import PageHeader from "../../components/common/PageHeader";

export default function AccountChart() {
  const [exerciceId, setExerciceId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { data: exercicesData } = useExercices({ page_size: 50 });
  const exercices = exercicesData?.results ?? exercicesData ?? [];

  const { data, isLoading } = useComptes({
    exercice: exerciceId || undefined,
    page_size: 200,
  });
  const createCompte = useCreateCompte();
  const comptes = data?.results ?? data ?? [];
  const types = getTypesCompte();
  const classes = getClassesCompte();
  const TYPE_LABELS = Object.fromEntries(types.map((t) => [t.value, t.label]));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await createCompte.mutateAsync(values);
      toast.success("Compte créé");
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

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Plan comptable"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouveau compte
          </button>
        }
      />

      <select
        value={exerciceId}
        onChange={(e) => setExerciceId(e.target.value)}
        className="rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      >
        <option value="">Tous les exercices</option>
        {exercices.map((e) => (
          <option key={e.id} value={e.id}>
            {e.libelle}
          </option>
        ))}
      </select>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-5 items-end gap-3 rounded-xl border border-ink-100 bg-white p-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Exercice *
            </label>
            <select
              {...register("exercice", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
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
              N° compte *
            </label>
            <input
              {...register("numero_compte", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Libellé *
            </label>
            <input
              {...register("libelle", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Type *
            </label>
            <select
              {...register("type_compte", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Classe *
            </label>
            <select
              {...register("classe", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              {classes.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.value}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-5 flex justify-end gap-3">
            <input
              type="hidden"
              {...register("sens_normal")}
              value="debiteur"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Créer
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : comptes.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucun compte. Initialise le plan comptable depuis la page Exercices.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">N° compte</th>
                <th className="px-4 py-3 font-medium">Libellé</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Classe</th>
                <th className="px-4 py-3 font-medium text-right">Solde</th>
              </tr>
            </thead>
            <tbody>
              {comptes.map((c) => (
                <tr key={c.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {c.numero_compte}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{c.libelle}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {TYPE_LABELS[c.type_compte] || c.type_compte}
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    Classe {c.classe}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono-data font-medium ${
                      c.solde < 0 ? "text-rose-500" : "text-ink-900"
                    }`}
                  >
                    {Number(c.solde).toLocaleString("fr-FR", {
                      minimumFractionDigits: 3,
                    })}
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