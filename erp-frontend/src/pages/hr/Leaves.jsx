import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Check, X, Ban } from "lucide-react";
import {
  useConges,
  useCreateConge,
  useDecisionConge,
  useAnnulerConge,
} from "../../hooks/useConges";
import { getTypesConge, getStatutsConge } from "../../api/conges";
import client from "../../api/client";
import PageHeader from "../../components/common/PageHeader";

const TYPE_LABELS = Object.fromEntries(
  getTypesConge().map((t) => [t.value, t.label])
);

const STATUT_STYLES = {
  en_attente: "bg-amber-400/15 text-amber-600",
  approuve: "bg-emerald-400/15 text-emerald-600",
  refuse: "bg-rose-400/15 text-rose-600",
  annule: "bg-ink-100 text-ink-700",
};

const STATUT_LABELS = Object.fromEntries(
  getStatutsConge().map((s) => [s.value, s.label])
);

export default function Leaves() {
  const [showForm, setShowForm] = useState(false);
  const [statutFilter, setStatutFilter] = useState("");

  const { data, isLoading } = useConges({
    statut: statutFilter || undefined,
    page_size: 50,
  });
  const { data: employesData } = useQuery({
    queryKey: ["employes", { page_size: 300 }],
    queryFn: async () => {
      const { data } = await client.get("/hr/employes/", {
        params: { page_size: 300 },
      });
      return data;
    },
  });
  const employes = employesData?.results ?? employesData ?? [];
  const createConge = useCreateConge();
  const decisionConge = useDecisionConge();
  const annulerConge = useAnnulerConge();
  const conges = data?.results ?? data ?? [];
  const types = getTypesConge();
  const statuts = getStatutsConge();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { type_conge: "annuel" } });

  const onSubmit = async (values) => {
    try {
      await createConge.mutateAsync(values);
      toast.success("Demande de congé créée");
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

  const handleDecision = async (id, decision) => {
    try {
      await decisionConge.mutateAsync({ id, decision });
      toast.success(decision === "approuve" ? "Congé approuvé" : "Congé refusé");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  const handleAnnuler = async (id) => {
    if (!window.confirm("Annuler cette demande de congé ?")) return;
    try {
      await annulerConge.mutateAsync(id);
      toast.success("Demande annulée");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Congés"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouvelle demande
          </button>
        }
      />

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-4 gap-3 rounded-xl border border-ink-100 bg-white p-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Employé *
            </label>
            <select
              {...register("employe", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="">Sélectionner...</option>
              {employes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.matricule} — {e.nom_complet}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Type de congé
            </label>
            <select
              {...register("type_conge")}
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
              Date début *
            </label>
            <input
              type="date"
              {...register("date_debut", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Date fin *
            </label>
            <input
              type="date"
              {...register("date_fin", { required: true })}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="col-span-4">
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Motif
            </label>
            <textarea
              {...register("motif")}
              rows={2}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Soumettre la demande
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatutFilter("")}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            statutFilter === ""
              ? "border-brand-500 bg-brand-50 text-brand-600"
              : "border-ink-300 text-ink-700 hover:bg-ink-100"
          }`}
        >
          Tous
        </button>
        {statuts.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatutFilter(s.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              statutFilter === s.value
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-ink-300 text-ink-700 hover:bg-ink-100"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : conges.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune demande de congé.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Employé</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Période</th>
                <th className="px-4 py-3 font-medium text-right">Jours</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {conges.map((c) => (
                <tr key={c.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {c.employe_detail?.nom_complet}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {TYPE_LABELS[c.type_conge] || c.type_conge}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {c.date_debut} → {c.date_fin}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {c.nombre_jours}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUT_STYLES[c.statut] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {STATUT_LABELS[c.statut] || c.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {c.statut === "en_attente" && (
                        <>
                          <button
                            onClick={() => handleDecision(c.id, "approuve")}
                            className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                            title="Approuver"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleDecision(c.id, "refuse")}
                            className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50"
                            title="Refuser"
                          >
                            <X size={14} />
                          </button>
                          <button
                            onClick={() => handleAnnuler(c.id)}
                            className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-ink-500 hover:bg-ink-100"
                            title="Annuler la demande"
                          >
                            <Ban size={14} />
                          </button>
                        </>
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