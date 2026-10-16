import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useEmploye,
  useCreateEmploye,
  useUpdateEmploye,
} from "../../hooks/useEmployes";
import {
  getDepartements,
  getTypesContrat,
  getStatutsEmploye,
} from "../../api/hr";
import PageHeader from "../../components/common/PageHeader";

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const departements = getDepartements();
  const typesContrat = getTypesContrat();
  const statuts = getStatutsEmploye();

  const { data: existing } = useEmploye(id);
  const createEmploye = useCreateEmploye();
  const updateEmploye = useUpdateEmploye();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      type_contrat: "cdi",
      statut: "actif",
      salaire_base: 0,
    },
  });

  useEffect(() => {
    if (existing) reset(existing);
  }, [existing, reset]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await updateEmploye.mutateAsync({ id, payload: values });
        toast.success("Employé mis à jour");
      } else {
        await createEmploye.mutateAsync(values);
        toast.success("Employé créé");
      }
      navigate("/employes");
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
      <PageHeader
        title={isEdit ? "Modifier l'employé" : "Nouvel employé"}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-ink-100 bg-white p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Matricule *
            </label>
            <input
              {...register("matricule", {
                required: "Le matricule est requis",
              })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.matricule && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.matricule.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              CIN *
            </label>
            <input
              {...register("cin", { required: "Le CIN est requis" })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.cin && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.cin.message}
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
              Prénom *
            </label>
            <input
              {...register("prenom", { required: "Le prénom est requis" })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.prenom && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.prenom.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Poste *
            </label>
            <input
              {...register("poste", { required: "Le poste est requis" })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.poste && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.poste.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Département *
            </label>
            <select
              {...register("departement", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Sélectionner...</option>
              {departements.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            {errors.departement && (
              <p className="mt-1 text-xs text-rose-500">Requis</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Type de contrat
            </label>
            <select
              {...register("type_contrat")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              {typesContrat.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {isEdit && (
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
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Date d'embauche *
            </label>
            <input
              type="date"
              {...register("date_embauche", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {isEdit && (
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">
                Date fin de contrat
              </label>
              <input
                type="date"
                {...register("date_fin_contrat")}
                className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Salaire de base *
            </label>
            <input
              type="number"
              step="0.001"
              {...register("salaire_base", {
                required: true,
                valueAsNumber: true,
              })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              N° CNSS
            </label>
            <input
              {...register("num_cnss")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              RIB bancaire
            </label>
            <input
              {...register("rib_bancaire")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Niveau de qualification
            </label>
            <input
              {...register("niveau_qualification")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Téléphone
            </label>
            <input
              {...register("telephone")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Téléphone urgence
            </label>
            <input
              {...register("telephone_urgence")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Contact d'urgence
            </label>
            <input
              {...register("contact_urgence")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
          <button
            type="button"
            onClick={() => navigate("/employes")}
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