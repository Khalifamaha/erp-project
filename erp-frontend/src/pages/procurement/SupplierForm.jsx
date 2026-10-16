import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useFournisseur,
  useCreateFournisseur,
  useUpdateFournisseur,
} from "../../hooks/useFournisseurs";
import {
  getStatutsFournisseur,
  getCategoriesFournisseur,
  getConditionsPaiementFournisseur,
} from "../../api/procurement";
import PageHeader from "../../components/common/PageHeader";

export default function SupplierForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const statuts = getStatutsFournisseur();
  const categories = getCategoriesFournisseur();
  const conditions = getConditionsPaiementFournisseur();

  const { data: existing } = useFournisseur(id);
  const createFournisseur = useCreateFournisseur();
  const updateFournisseur = useUpdateFournisseur();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      statut: "actif",
      categorie: "matiere_premiere",
      pays: "Tunisie",
      devise_pref: "TND",
      conditions_paiement: "30j",
      delai_paiement_jours: 30,
      delai_livraison: 7,
      score_qualite: 100,
    },
  });

  useEffect(() => {
    if (existing) reset(existing);
  }, [existing, reset]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await updateFournisseur.mutateAsync({ id, payload: values });
        toast.success("Fournisseur mis à jour");
      } else {
        await createFournisseur.mutateAsync(values);
        toast.success("Fournisseur créé");
      }
      navigate("/fournisseurs");
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
        title={isEdit ? "Modifier le fournisseur" : "Nouveau fournisseur"}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-ink-100 bg-white p-6"
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
              Raison sociale *
            </label>
            <input
              {...register("raison_sociale", {
                required: "La raison sociale est requise",
              })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.raison_sociale && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.raison_sociale.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Catégorie
            </label>
            <select
              {...register("categorie")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
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
              Contact
            </label>
            <input
              {...register("contact")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
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
              Téléphone 2
            </label>
            <input
              {...register("telephone2")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Ville
            </label>
            <input
              {...register("ville")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Pays
            </label>
            <input
              {...register("pays")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              N° fiscal
            </label>
            <input
              {...register("num_fiscal")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              N° RC
            </label>
            <input
              {...register("num_rc")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Délai de livraison (jours)
            </label>
            <input
              type="number"
              {...register("delai_livraison", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Conditions de paiement
            </label>
            <select
              {...register("conditions_paiement")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              {conditions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Délai de paiement (jours)
            </label>
            <input
              type="number"
              {...register("delai_paiement_jours", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Adresse
          </label>
          <textarea
            {...register("adresse")}
            rows={2}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
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

        <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
          <button
            type="button"
            onClick={() => navigate("/fournisseurs")}
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