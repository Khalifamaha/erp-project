import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Check, Lock } from "lucide-react";
import {
  useFicheNC,
  useCloturerFicheNC,
  useAjouterActionNC,
  useValiderActionNC,
} from "../../hooks/useFichesNC";
import { getTypesActionNC, getStatutsActionNC } from "../../api/quality";
import PageHeader from "../../components/common/PageHeader";

const GRAVITE_STYLES = {
  mineure: "bg-ink-100 text-ink-700",
  moyenne: "bg-cyan-400/15 text-cyan-600",
  haute: "bg-amber-400/15 text-amber-600",
  critique: "bg-rose-400/15 text-rose-600",
};

const STATUT_ACTION_LABELS = Object.fromEntries(
  getStatutsActionNC().map((s) => [s.value, s.label])
);
const TYPE_ACTION_LABELS = Object.fromEntries(
  getTypesActionNC().map((t) => [t.value, t.label])
);

function AjouterActionForm({ ficheId, onDone }) {
  const ajouterAction = useAjouterActionNC();
  const types = getTypesActionNC();
  const [typeAction, setTypeAction] = useState("corrective");
  const [description, setDescription] = useState("");
  const [datePrevue, setDatePrevue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !datePrevue) {
      toast.error("Remplis la description et la date prévue");
      return;
    }
    try {
      await ajouterAction.mutateAsync({
        id: ficheId,
        payload: {
          type_action: typeAction,
          description,
          date_prevue: datePrevue,
        },
      });
      toast.success("Action ajoutée");
      onDone();
    } catch (err) {
      toast.error("Erreur");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-4 items-end gap-3 rounded-lg border border-ink-100 bg-ink-100/20 p-3"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-700">
          Type
        </label>
        <select
          value={typeAction}
          onChange={(e) => setTypeAction(e.target.value)}
          className="w-full rounded-lg border border-ink-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
        >
          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-2">
        <label className="mb-1 block text-xs font-medium text-ink-700">
          Description
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-ink-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-700">
          Date prévue
        </label>
        <input
          type="date"
          value={datePrevue}
          onChange={(e) => setDatePrevue(e.target.value)}
          className="w-full rounded-lg border border-ink-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <button
        type="submit"
        className="col-span-4 rounded-lg bg-brand-500 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
      >
        Ajouter
      </button>
    </form>
  );
}

export default function NCWorkflow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showActionForm, setShowActionForm] = useState(false);
  const [showCloture, setShowCloture] = useState(false);
  const [causeRacine, setCauseRacine] = useState("");
  const [actionCorrective, setActionCorrective] = useState("");
  const [actionPreventive, setActionPreventive] = useState("");

  const { data: fiche, isLoading, isError, error } = useFicheNC(id);
  const cloturer = useCloturerFicheNC();
  const validerAction = useValiderActionNC();

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-ink-500">Chargement...</div>;
  }
  if (isError) {
    return (
      <div className="p-8 text-center text-sm text-rose-500">
        Erreur : {error?.message || "impossible de charger la fiche"}
      </div>
    );
  }

  const handleCloturer = async (e) => {
    e.preventDefault();
    if (!causeRacine || !actionCorrective) {
      toast.error("La cause racine et l'action corrective sont requises");
      return;
    }
    try {
      await cloturer.mutateAsync({
        id,
        payload: {
          cause_racine: causeRacine,
          action_corrective: actionCorrective,
          action_preventive: actionPreventive,
        },
      });
      toast.success("Fiche NC clôturée");
      setShowCloture(false);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  const handleValiderAction = async (actionId) => {
    try {
      await validerAction.mutateAsync({
        ficheId: id,
        payload: { action_id: actionId, statut: "realisee" },
      });
      toast.success("Action validée");
    } catch (err) {
      toast.error("Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => navigate("/nc")}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft size={16} />
        Retour aux fiches NC
      </button>

      <PageHeader
        title={fiche.numero_nc}
        subtitle={`${fiche.produit_reference} — ${fiche.produit_designation}`}
        action={
          <div className="flex items-center gap-3">
            {fiche.lot_bloque && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-400/15 px-2.5 py-1 text-xs font-medium text-rose-600">
                <Lock size={12} />
                Lot bloqué
              </span>
            )}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                GRAVITE_STYLES[fiche.gravite] || "bg-ink-100 text-ink-700"
              }`}
            >
              {fiche.gravite}
            </span>
          </div>
        }
      />

      <div className="rounded-xl border border-ink-100 bg-white p-4 text-sm">
        <p className="text-xs font-medium text-ink-500">
          Description du défaut
        </p>
        <p className="mt-1 text-ink-900">{fiche.description_defaut}</p>
      </div>

      {fiche.statut !== "cloturee" && !showCloture && (
        <button
          onClick={() => setShowCloture(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
        >
          <Check size={14} />
          Clôturer la fiche
        </button>
      )}

      {showCloture && (
        <form
          onSubmit={handleCloturer}
          className="space-y-3 rounded-xl border border-ink-100 bg-white p-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Cause racine *
            </label>
            <textarea
              value={causeRacine}
              onChange={(e) => setCauseRacine(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Action corrective *
            </label>
            <textarea
              value={actionCorrective}
              onChange={(e) => setActionCorrective(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Action préventive
            </label>
            <textarea
              value={actionPreventive}
              onChange={(e) => setActionPreventive(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCloture(false)}
              className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            >
              Confirmer la clôture
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Actions 8D ({fiche.actions?.length || 0})
          </h3>
          {fiche.statut !== "cloturee" && (
            <button
              onClick={() => setShowActionForm((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-100"
            >
              <Plus size={14} />
              Ajouter une action
            </button>
          )}
        </div>

        {showActionForm && (
          <div className="p-4">
            <AjouterActionForm
              ficheId={id}
              onDone={() => setShowActionForm(false)}
            />
          </div>
        )}

        {(fiche.actions || []).length === 0 ? (
          <div className="p-6 text-center text-sm text-ink-500">
            Aucune action enregistrée.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Date prévue</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fiche.actions.map((a) => (
                <tr key={a.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 text-ink-700">
                    {TYPE_ACTION_LABELS[a.type_action] || a.type_action}
                  </td>
                  <td className="px-4 py-3 text-ink-900">{a.description}</td>
                  <td className="px-4 py-3 text-ink-700">{a.date_prevue}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {STATUT_ACTION_LABELS[a.statut] || a.statut}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {["planifiee", "en_cours"].includes(a.statut) && (
                      <button
                        onClick={() => handleValiderAction(a.id)}
                        className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                      >
                        <Check size={14} />
                        Valider
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