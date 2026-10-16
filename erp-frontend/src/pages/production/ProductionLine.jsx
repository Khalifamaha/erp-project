import toast from "react-hot-toast";
import { Play, Square, Plus } from "lucide-react";
import {
  useChaineDashboard,
  useDemarrerSessionChaine,
  useTerminerSessionChaine,
  useIncrementerCompteurChaine,
} from "../../hooks/useChaines";
import PageHeader from "../../components/common/PageHeader";

export default function ProductionLine() {
  const { data: chaines, isLoading } = useChaineDashboard();
  const demarrer = useDemarrerSessionChaine();
  const terminer = useTerminerSessionChaine();
  const incrementer = useIncrementerCompteurChaine();

  const handleDemarrer = async (id) => {
    try {
      await demarrer.mutateAsync({ id, payload: { shift: "matin" } });
      toast.success("Session démarrée");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  const handleTerminer = async (id) => {
    if (!window.confirm("Terminer la session en cours sur cette chaîne ?"))
      return;
    try {
      await terminer.mutateAsync({ id, payload: {} });
      toast.success("Session terminée");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  const handleIncrementer = async (id) => {
    try {
      await incrementer.mutateAsync({ id, payload: { quantite: 1 } });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Ligne de production — temps réel" />

      {isLoading ? (
        <div className="p-8 text-center text-sm text-ink-500">
          Chargement...
        </div>
      ) : !chaines || chaines.length === 0 ? (
        <div className="p-8 text-center text-sm text-ink-500">
          Aucune chaîne de production.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {chaines.map((c) => {
            const session = c.session_en_cours;
            return (
              <div
                key={c.id}
                className="rounded-xl border border-ink-100 bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-sm font-semibold text-ink-900">
                      {c.nom}
                    </p>
                    <p className="font-mono-data text-xs text-ink-500">
                      {c.code}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      c.statut === "active"
                        ? "bg-emerald-400/15 text-emerald-600"
                        : c.statut === "panne"
                        ? "bg-rose-400/15 text-rose-600"
                        : "bg-ink-100 text-ink-700"
                    }`}
                  >
                    {c.statut}
                  </span>
                </div>

                {session ? (
                  <div className="mt-4 space-y-3">
                    <div className="text-center">
                      <p className="font-mono-data text-4xl font-bold text-brand-500">
                        {session.compteur_pieces}
                      </p>
                      <p className="text-xs text-ink-500">
                        / {session.objectif_session} pièces — shift{" "}
                        {session.shift}
                      </p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full bg-brand-500 transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            session.taux_realisation
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleIncrementer(c.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600"
                      >
                        <Plus size={14} />
                        Pièce
                      </button>
                      <button
                        onClick={() => handleTerminer(c.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
                      >
                        <Square size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="mb-3 text-center text-sm text-ink-500">
                      Aucune session en cours
                    </p>
                    <button
                      onClick={() => handleDemarrer(c.id)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                    >
                      <Play size={14} />
                      Démarrer session (matin)
                    </button>
                  </div>
                )}

                <p className="mt-3 text-xs text-ink-500">
                  {c.employes_actifs} employé(s) affecté(s) · objectif{" "}
                  {c.objectif_heure} pcs/h
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}