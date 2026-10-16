import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import toast from "react-hot-toast";
import { AlertTriangle, Plus, Check } from "lucide-react";
import {
  usePannes,
  useDeclarerPanne,
  useCloturerPanne,
} from "../../hooks/useGmo";
import { getMachines } from "../../api/production";
import { getTypesPanne, getGravitesPanne } from "../../api/gmo";
import PageHeader from "../../components/common/PageHeader";

const GRAVITE_STYLES = {
  faible: "bg-ink-100 text-ink-700",
  moyenne: "bg-cyan-400/15 text-cyan-600",
  haute: "bg-amber-400/15 text-amber-600",
  critique: "bg-rose-400/15 text-rose-600",
};

const STATUT_LABELS = {
  declaree: "Déclarée",
  assignee: "Assignée",
  en_cours: "Intervention en cours",
  resolue: "Résolue",
  non_resolue: "Non résolue",
};

function DeclarationForm({ onClose }) {
  const declarer = useDeclarerPanne();
  const types = getTypesPanne();
  const gravites = getGravitesPanne();
  const { data: machinesData } = useQuery({
    queryKey: ["machines", { page_size: 200 }],
    queryFn: () => getMachines({ page_size: 200 }),
  });
  const machineOptions = (machinesData?.results ?? machinesData ?? []).map(
    (m) => ({ value: m.id, label: `${m.code} — ${m.nom}` })
  );

  const [machine, setMachine] = useState(null);
  const [typePanne, setTypePanne] = useState("mecanique");
  const [gravite, setGravite] = useState("moyenne");
  const [description, setDescription] = useState("");
  const [arretProduction, setArretProduction] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!machine || !description) {
      toast.error("Sélectionne une machine et décris le problème");
      return;
    }
    try {
      await declarer.mutateAsync({
        machine: machine.value,
        type_panne: typePanne,
        gravite,
        description,
        arret_production: arretProduction,
      });
      toast.success("Panne déclarée");
      onClose();
    } catch (err) {
      toast.error("Erreur");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-ink-100 bg-white p-4"
    >
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Machine
          </label>
          <Select
            value={machine}
            onChange={setMachine}
            options={machineOptions}
            placeholder="Sélectionner..."
            classNamePrefix="rs"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Type
          </label>
          <select
            value={typePanne}
            onChange={(e) => setTypePanne(e.target.value)}
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
            Gravité
          </label>
          <select
            value={gravite}
            onChange={(e) => setGravite(e.target.value)}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            {gravites.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="arret"
          checked={arretProduction}
          onChange={(e) => setArretProduction(e.target.checked)}
          className="h-4 w-4 rounded border-ink-300"
        />
        <label htmlFor="arret" className="text-sm text-ink-700">
          Arrêt de production
        </label>
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-rose-500 py-2 text-sm font-medium text-white hover:bg-rose-600"
      >
        Déclarer la panne
      </button>
    </form>
  );
}

export default function Breakdowns() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = usePannes({ page_size: 50 });
  const cloturerPanne = useCloturerPanne();
  const pannes = data?.results ?? data ?? [];

  const handleCloturer = async (id) => {
    try {
      await cloturerPanne.mutateAsync(id);
      toast.success("Panne clôturée");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Pannes"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 transition"
          >
            <Plus size={16} />
            Déclarer une panne
          </button>
        }
      />

      {showForm && <DeclarationForm onClose={() => setShowForm(false)} />}

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : pannes.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune panne enregistrée.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Machine</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Gravité</th>
                <th className="px-4 py-3 font-medium">Début</th>
                <th className="px-4 py-3 font-medium text-right">Durée</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pannes.map((p) => (
                <tr key={p.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {p.machine_code}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{p.type_panne}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        GRAVITE_STYLES[p.gravite] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {p.gravite === "critique" && <AlertTriangle size={12} />}
                      {p.gravite}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {new Date(p.date_debut).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {p.duree_heures ? `${p.duree_heures}h` : "en cours"}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {STATUT_LABELS[p.statut] || p.statut}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.statut !== "resolue" && (
                      <button
                        onClick={() => handleCloturer(p.id)}
                        className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                      >
                        <Check size={14} />
                        Clôturer
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