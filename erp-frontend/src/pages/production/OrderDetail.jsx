import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Play, Square, Pause, PlayCircle, X } from "lucide-react";
import {
  useOrdre,
  useLancerOrdre,
  useTerminerOrdre,
  usePauseOrdre,
  useReprendreOrdre,
  useAnnulerOrdre,
  useMajQuantiteOrdre,
} from "../../hooks/useOrdres";
import { getStatutsOrdre, getPriorites } from "../../api/production";
import PageHeader from "../../components/common/PageHeader";

const STATUT_LABELS = Object.fromEntries(
  getStatutsOrdre().map((s) => [s.value, s.label])
);
const PRIORITE_LABELS = Object.fromEntries(
  getPriorites().map((p) => [p.value, p.label])
);

const STATUT_STYLES = {
  brouillon: "bg-ink-100 text-ink-700",
  planifie: "bg-cyan-400/15 text-cyan-600",
  lance: "bg-amber-400/15 text-amber-600",
  en_cours: "bg-amber-400/15 text-amber-600",
  pause: "bg-rose-400/15 text-rose-600",
  termine: "bg-emerald-400/15 text-emerald-600",
  annule: "bg-ink-100 text-ink-700",
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: of, isLoading, isError, error } = useOrdre(id);
  const [quantiteProduite, setQuantiteProduite] = useState("");
  const [quantiteRebutee, setQuantiteRebutee] = useState("");

  const lancer = useLancerOrdre();
  const terminer = useTerminerOrdre();
  const pause = usePauseOrdre();
  const reprendre = useReprendreOrdre();
  const annuler = useAnnulerOrdre();
  const majQuantite = useMajQuantiteOrdre();

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-ink-500">Chargement...</div>;
  }
  if (isError) {
    return (
      <div className="p-8 text-center text-sm text-rose-500">
        Erreur : {error?.message || "impossible de charger l'OF"}
      </div>
    );
  }

  const handleAction = async (mutation, successMsg) => {
    try {
      await mutation.mutateAsync(id);
      toast.success(successMsg);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  const handleMajQuantite = async (e) => {
    e.preventDefault();
    if (quantiteProduite === "") {
      toast.error("Indique la quantité produite");
      return;
    }
    try {
      await majQuantite.mutateAsync({
        id,
        payload: {
          quantite_produite: Number(quantiteProduite),
          quantite_rebutee: quantiteRebutee ? Number(quantiteRebutee) : 0,
        },
      });
      toast.success("Quantité mise à jour");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => navigate("/of")}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft size={16} />
        Retour aux OF
      </button>

      <PageHeader
        title={of.numero}
        subtitle={`${of.produit_reference} — ${of.produit_designation}`}
        action={
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              STATUT_STYLES[of.statut] || "bg-ink-100 text-ink-700"
            }`}
          >
            {STATUT_LABELS[of.statut] || of.statut}
          </span>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">Avancement</p>
          <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
            {of.quantite_produite} / {of.quantite_prevue} ({of.taux_avancement}
            %)
          </p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">Rebuts</p>
          <p className="mt-1 font-mono-data text-lg font-semibold text-rose-500">
            {of.quantite_rebutee}
          </p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">Priorité</p>
          <p className="mt-1 font-medium text-ink-900">
            {PRIORITE_LABELS[of.priorite] || of.priorite}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["brouillon", "planifie"].includes(of.statut) && (
          <button
            onClick={() => handleAction(lancer, "OF lancé")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            <Play size={14} />
            Lancer
          </button>
        )}
        {["lance", "en_cours", "pause"].includes(of.statut) && (
          <button
            onClick={() => handleAction(terminer, "OF terminé")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Square size={14} />
            Terminer
          </button>
        )}
        {["lance", "en_cours"].includes(of.statut) && (
          <button
            onClick={() => handleAction(pause, "OF mis en pause")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            <Pause size={14} />
            Pause
          </button>
        )}
        {of.statut === "pause" && (
          <button
            onClick={() => handleAction(reprendre, "OF repris")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            <PlayCircle size={14} />
            Reprendre
          </button>
        )}
        {!["termine", "annule"].includes(of.statut) && (
          <button
            onClick={() => handleAction(annuler, "OF annulé")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50"
          >
            <X size={14} />
            Annuler
          </button>
        )}
      </div>

      {["lance", "en_cours"].includes(of.statut) && (
        <form
          onSubmit={handleMajQuantite}
          className="grid grid-cols-3 items-end gap-3 rounded-xl border border-ink-100 bg-white p-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Quantité produite
            </label>
            <input
              type="number"
              step="0.001"
              value={quantiteProduite}
              onChange={(e) => setQuantiteProduite(e.target.value)}
              placeholder={String(of.quantite_produite)}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Quantité rebutée
            </label>
            <input
              type="number"
              step="0.001"
              value={quantiteRebutee}
              onChange={(e) => setQuantiteRebutee(e.target.value)}
              placeholder={String(of.quantite_rebutee)}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Mettre à jour
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink-100 bg-white p-4 text-sm">
        <div>
          <p className="text-xs font-medium text-ink-500">Gamme</p>
          <p className="text-ink-900">{of.gamme_nom}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Responsable</p>
          <p className="text-ink-900">{of.responsable_nom || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Début prévu</p>
          <p className="text-ink-900">{of.date_debut_prev || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Fin prévue</p>
          <p className="text-ink-900">{of.date_fin_prev || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Début réel</p>
          <p className="text-ink-900">
            {of.date_debut_reel
              ? new Date(of.date_debut_reel).toLocaleString("fr-FR")
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Fin réelle</p>
          <p className="text-ink-900">
            {of.date_fin_reel
              ? new Date(of.date_fin_reel).toLocaleString("fr-FR")
              : "—"}
          </p>
        </div>
        {of.duree_reelle_heures !== null && (
          <div>
            <p className="text-xs font-medium text-ink-500">Durée réelle</p>
            <p className="text-ink-900">{of.duree_reelle_heures} h</p>
          </div>
        )}
        {of.notes_operateur && (
          <div className="col-span-2">
            <p className="text-xs font-medium text-ink-500">Notes</p>
            <p className="text-ink-900">{of.notes_operateur}</p>
          </div>
        )}
      </div>

      {(of.consommations || []).length > 0 && (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
          <div className="border-b border-ink-100 px-4 py-3">
            <h3 className="font-display text-sm font-semibold text-ink-900">
              Consommations matière
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Produit</th>
                <th className="px-4 py-3 font-medium text-right">Prévue</th>
                <th className="px-4 py-3 font-medium text-right">Réelle</th>
              </tr>
            </thead>
            <tbody>
              {of.consommations.map((c) => (
                <tr key={c.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 text-ink-900">
                    {c.produit_reference} — {c.produit_designation}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {c.quantite_prevue}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {c.quantite_reelle}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}