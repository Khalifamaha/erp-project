import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getProduits } from "../../api/inventory";
import { getGravitesNC, getTypesNC } from "../../api/quality";
import { useCreateFicheNC } from "../../hooks/useFichesNC";
import PageHeader from "../../components/common/PageHeader";

export default function NCForm() {
  const navigate = useNavigate();
  const createFicheNC = useCreateFicheNC();
  const gravites = getGravitesNC();
  const typesNC = getTypesNC();

  const { data: produitsData } = useQuery({
    queryKey: ["produits", { page_size: 500 }],
    queryFn: () => getProduits({ page_size: 500 }),
  });
  const produits = produitsData?.results ?? produitsData ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      gravite: "moyenne",
      type_nc: "produit",
      lot_bloque: false,
    },
  });

  const onSubmit = async (values) => {
    try {
      await createFicheNC.mutateAsync(values);
      toast.success("Fiche NC créée");
      navigate("/nc");
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
      <PageHeader title="Nouvelle fiche de non-conformité" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-ink-100 bg-white p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              N° NC *
            </label>
            <input
              {...register("numero_nc", { required: "Requis" })}
              placeholder="NC-2026-0001"
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.numero_nc && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.numero_nc.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Produit *
            </label>
            <select
              {...register("produit", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Sélectionner...</option>
              {produits.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.reference} — {p.designation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Gravité
            </label>
            <select
              {...register("gravite")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              {gravites.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Type de NC
            </label>
            <select
              {...register("type_nc")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              {typesNC.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Délai de résolution
            </label>
            <input
              type="date"
              {...register("delai_resolution")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="lot_bloque"
              {...register("lot_bloque")}
              className="h-4 w-4 rounded border-ink-300"
            />
            <label htmlFor="lot_bloque" className="text-sm text-ink-700">
              Bloquer le lot associé
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Description du défaut *
          </label>
          <textarea
            {...register("description_defaut", { required: "Requis" })}
            rows={3}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          {errors.description_defaut && (
            <p className="mt-1 text-xs text-rose-500">
              {errors.description_defaut.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Action immédiate
          </label>
          <textarea
            {...register("action_immediate")}
            rows={2}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
          <button
            type="button"
            onClick={() => navigate("/nc")}
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