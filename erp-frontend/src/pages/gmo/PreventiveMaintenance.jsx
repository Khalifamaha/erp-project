import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Check, AlertTriangle } from "lucide-react";
import {
  useMaintenances,
  useCreateMaintenance,
  useEffectuerMaintenance,
  useMaintenancesStats,
} from "../../hooks/useGmo";
import { getMachines } from "../../api/production";
import { getTypesMaintenance } from "../../api/gmo";
import PageHeader from "../../components/common/PageHeader";

export default function PreventiveMaintenance() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useMaintenances({ page_size: 50 });
  const { data: stats } = useMaintenancesStats();
  const { data: machinesData } = useQuery({
    queryKey: ["machines", { page_size: 200 }],
    queryFn: () => getMachines({ page_size: 200 }),
  });
  const machines = machinesData?.results ?? machinesData ?? [];
  const types = getTypesMaintenance();

  const createMaintenance = useCreateMaintenance();
  const effectuer = useEffectuerMaintenance();
  const maintenances = data?.results ?? data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { frequence_jours: 30, duree_prevue_min: 60 },
  });

  const onSubmit = async (values) => {
    try {
      await createMaintenance.mutateAsync({
        ...values,
        prochaine_execution: values.prochaine_execution || null,
      });
      toast.success("Maintenance planifiée");
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

  const handleEffectuer = async (id) => {
    try {
      await effectuer.mutateAsync({
        id,
        payload: { date_execution: new Date().toISOString().slice(0, 10) },
      });
      toast.success("Maintenance marquée effectuée");
    } catch (err) {
      toast.error("Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Maintenance préventive"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Planifier
          </button>
        }
      />

      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">
              Total planifiées
            </p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {stats.total_planifiees}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">En retard</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-rose-500">
              {stats.en_retard}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Cette semaine</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-amber-600">
              {stats.cette_semaine}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Ce mois</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {stats.ce_mois}
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-3 gap-3 rounded-xl border border-ink-100 bg-white p-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Machine *
            </label>
            <select
              {...register("machine", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="">Sélectionner...</option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} — {m.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Type *
            </label>
            <select
              {...register("type_maintenance", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="">Sélectionner...</option>
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Fréquence (jours) *
            </label>
            <input
              type="number"
              {...register("frequence_jours", {
                required: true,
                valueAsNumber: true,
              })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Description *
            </label>
            <input
              {...register("description", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Prochaine échéance
            </label>
            <input
              type="date"
              {...register("prochaine_execution")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Planifier
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : maintenances.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune maintenance planifiée.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Machine</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Fréquence</th>
                <th className="px-4 py-3 font-medium">Prochaine échéance</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.map((m) => (
                <tr key={m.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {m.machine_code}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {m.type_maintenance}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    tous les {m.frequence_jours}j
                  </td>
                  <td
                    className={`px-4 py-3 ${
                      m.est_en_retard
                        ? "font-medium text-rose-500"
                        : "text-ink-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {m.est_en_retard && <AlertTriangle size={14} />}
                      {m.prochaine_execution || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.statut === "planifiee" && (
                      <button
                        onClick={() => handleEffectuer(m.id)}
                        className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                      >
                        <Check size={14} />
                        Marquer effectuée
                      </button>
                    )}
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