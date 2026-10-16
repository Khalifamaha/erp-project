import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import client from "../../api/client";
import PageHeader from "../../components/common/PageHeader";

const TYPES_MACHINE = [
  { value: "laser", label: "Découpe laser" },
  { value: "presse", label: "Presse hydraulique" },
  { value: "tour", label: "Tour CNC" },
  { value: "fraiseuse", label: "Fraiseuse CNC" },
  { value: "soudure", label: "Poste de soudure" },
  { value: "pliage", label: "Plieuse" },
  { value: "injection", label: "Presse injection plastique" },
  { value: "assemblage", label: "Poste assemblage" },
  { value: "controle", label: "Poste contrôle qualité" },
  { value: "autre", label: "Autre" },
];

const STATUTS_MACHINE = [
  { value: "disponible", label: "Disponible" },
  { value: "en_marche", label: "En marche" },
  { value: "panne", label: "En panne" },
  { value: "maintenance", label: "En maintenance" },
  { value: "arret", label: "À l'arrêt" },
];

async function getMachine(id) {
  const { data } = await client.get(`/production/machines/${id}/`);
  return data;
}
async function createMachine(payload) {
  const { data } = await client.post("/production/machines/", payload);
  return data;
}
async function updateMachine({ id, payload }) {
  const { data } = await client.patch(`/production/machines/${id}/`, payload);
  return data;
}

export default function MachineForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existing } = useQuery({
    queryKey: ["machines", id],
    queryFn: () => getMachine(id),
    enabled: isEdit,
  });

  const createMut = useMutation({ mutationFn: createMachine });
  const updateMut = useMutation({ mutationFn: updateMachine });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      type: "autre",
      statut: "disponible",
      cadence_horaire: 0,
      cadence_theorique: 0,
    },
  });

  useEffect(() => {
    if (existing) reset(existing);
  }, [existing, reset]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await updateMut.mutateAsync({ id, payload: values });
        toast.success("Machine mise à jour");
      } else {
        await createMut.mutateAsync(values);
        toast.success("Machine créée");
      }
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      navigate("/machines");
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
      <PageHeader title={isEdit ? "Modifier la machine" : "Nouvelle machine"} />

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
              Type *
            </label>
            <select
              {...register("type", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              {TYPES_MACHINE.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
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
              {STATUTS_MACHINE.map((s) => (
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
              Emplacement
            </label>
            <input
              {...register("emplacement")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Cadence horaire (pcs/h)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("cadence_horaire", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Cadence théorique max
            </label>
            <input
              type="number"
              step="0.01"
              {...register("cadence_theorique", { valueAsNumber: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Date de mise en service
            </label>
            <input
              type="date"
              {...register("date_mise_service")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Prochaine maintenance
            </label>
            <input
              type="date"
              {...register("prochaine_maintenance")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Fabricant
            </label>
            <input
              {...register("fabricant")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
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
            onClick={() => navigate("/machines")}
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