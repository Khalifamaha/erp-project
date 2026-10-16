import { useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { LogIn, LogOut, Check } from "lucide-react";
import {
  usePointagesDuJour,
  useBadgerEntree,
  useBadgerSortie,
  useValiderPointage,
} from "../../hooks/usePaie";
import { getEmployes } from "../../api/hr";
import PageHeader from "../../components/common/PageHeader";

const STATUT_STYLES = {
  en_cours: "bg-cyan-400/15 text-cyan-600",
  termine: "bg-amber-400/15 text-amber-600",
  valide: "bg-emerald-400/15 text-emerald-600",
  rejete: "bg-rose-400/15 text-rose-600",
};

const STATUT_LABELS = {
  en_cours: "En cours",
  termine: "Terminé",
  valide: "Validé",
  rejete: "Rejeté",
};

export default function Attendance() {
  const [selectedEmploye, setSelectedEmploye] = useState(null);

  const { data: employesData } = useQuery({
    queryKey: ["employes", { page_size: 300 }],
    queryFn: () => getEmployes({ page_size: 300 }),
  });
  const { data: pointages, isLoading } = usePointagesDuJour();

  const badgerEntree = useBadgerEntree();
  const badgerSortie = useBadgerSortie();
  const validerPointage = useValiderPointage();

  const employeOptions = (employesData?.results ?? employesData ?? []).map(
    (e) => ({ value: e.id, label: `${e.matricule} — ${e.nom_complet}` })
  );

  const handleEntree = async () => {
    if (!selectedEmploye) {
      toast.error("Sélectionne un employé");
      return;
    }
    try {
      await badgerEntree.mutateAsync({ employe_id: selectedEmploye.value });
      toast.success("Entrée enregistrée");
      setSelectedEmploye(null);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur lors du badgeage");
    }
  };

  const handleSortie = async (pointageId) => {
    try {
      await badgerSortie.mutateAsync(pointageId);
      toast.success("Sortie enregistrée");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur lors du badgeage");
    }
  };

  const handleValider = async (id) => {
    try {
      await validerPointage.mutateAsync(id);
      toast.success("Pointage validé");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Pointages du jour" />

      <div className="flex items-end gap-3 rounded-xl border border-ink-100 bg-white p-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Badger une entrée
          </label>
          <Select
            value={selectedEmploye}
            onChange={setSelectedEmploye}
            options={employeOptions}
            placeholder="Sélectionner un employé..."
            classNamePrefix="rs"
          />
        </div>
        <button
          onClick={handleEntree}
          disabled={badgerEntree.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          <LogIn size={16} />
          Badger entrée
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        <div className="border-b border-ink-100 px-4 py-3">
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Pointages d'aujourd'hui
          </h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : !pointages || pointages.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucun pointage aujourd'hui.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Employé</th>
                <th className="px-4 py-3 font-medium">Entrée</th>
                <th className="px-4 py-3 font-medium">Sortie</th>
                <th className="px-4 py-3 font-medium text-right">
                  Heures travaillées
                </th>
                <th className="px-4 py-3 font-medium text-right">
                  Heures sup
                </th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pointages.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-ink-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {p.employe_detail?.nom_complet}
                  </td>
                  <td className="px-4 py-3 font-mono-data text-ink-700">
                    {new Date(p.heure_entree).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 font-mono-data text-ink-700">
                    {p.heure_sortie
                      ? new Date(p.heure_sortie).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {p.heures_travaillees}h
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {p.heures_sup}h
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUT_STYLES[p.statut] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {STATUT_LABELS[p.statut] || p.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {p.statut === "en_cours" && (
                        <button
                          onClick={() => handleSortie(p.id)}
                          className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                          title="Badger sortie"
                        >
                          <LogOut size={14} />
                          Sortie
                        </button>
                      )}
                      {p.statut === "termine" && (
                        <button
                          onClick={() => handleValider(p.id)}
                          className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                          title="Valider"
                        >
                          <Check size={14} />
                          Valider
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