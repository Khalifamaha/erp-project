import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Check, Banknote } from "lucide-react";
import {
  usePaiements,
  useValiderPaiement,
  useMarquerPayePaiement,
  useResumeMensuel,
} from "../../hooks/usePaie";
import PageHeader from "../../components/common/PageHeader";

const STATUT_STYLES = {
  brouillon: "bg-ink-100 text-ink-700",
  calcule: "bg-cyan-400/15 text-cyan-600",
  valide: "bg-amber-400/15 text-amber-600",
  paye: "bg-emerald-400/15 text-emerald-600",
  annule: "bg-rose-400/15 text-rose-600",
};

const STATUT_LABELS = {
  brouillon: "Brouillon",
  calcule: "Calculé",
  valide: "Validé",
  paye: "Payé",
  annule: "Annulé",
};

export default function Payroll() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statutFilter, setStatutFilter] = useState("");

  const { data, isLoading, isError, error } = usePaiements({
    page,
    statut: statutFilter || undefined,
  });
  const { data: resume } = useResumeMensuel();

  const validerPaiement = useValiderPaiement();
  const marquerPaye = useMarquerPayePaiement();

  const paiements = data?.results ?? data ?? [];
  const totalCount = data?.count ?? paiements.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const fmtMoney = (v) =>
    Number(v || 0).toLocaleString("fr-FR", { minimumFractionDigits: 3 });

  const handleValider = async (id) => {
    try {
      await validerPaiement.mutateAsync(id);
      toast.success("Bulletin validé");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  const handleMarquerPaye = async (id) => {
    if (!window.confirm("Confirmer le paiement de ce bulletin ?")) return;
    try {
      await marquerPaye.mutateAsync({ id });
      toast.success("Paiement enregistré");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Paie"
        action={
          <button
            onClick={() => navigate("/paie/generer")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Générer les bulletins
          </button>
        }
      />

      {resume && (
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">
              Masse salariale nette
            </p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {fmtMoney(resume.total_net)} TND
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">
              Cotisations CNSS
            </p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {fmtMoney(resume.total_cnss)} TND
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Primes</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {fmtMoney(resume.total_primes)} TND
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Bulletins</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {resume.nombre_bulletins}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {["", "brouillon", "calcule", "valide", "paye", "annule"].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatutFilter(s);
              setPage(1);
            }}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              statutFilter === s
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-ink-300 text-ink-700 hover:bg-ink-100"
            }`}
          >
            {s === "" ? "Tous" : STATUT_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-rose-500">
            Erreur : {error?.message || "impossible de charger les paiements"}
          </div>
        ) : paiements.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucun bulletin trouvé.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Employé</th>
                <th className="px-4 py-3 font-medium">Période</th>
                <th className="px-4 py-3 font-medium text-right">Net à payer</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paiements.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-ink-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {p.employe_detail?.nom_complet}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {p.periode_debut} → {p.periode_fin}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data font-medium text-ink-900">
                    {fmtMoney(p.net_paye)} TND
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
                      {["brouillon", "calcule"].includes(p.statut) && (
                        <button
                          onClick={() => handleValider(p.id)}
                          className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-cyan-600 hover:bg-cyan-50"
                          title="Valider"
                        >
                          <Check size={14} />
                          Valider
                        </button>
                      )}
                      {p.statut === "valide" && (
                        <button
                          onClick={() => handleMarquerPaye(p.id)}
                          className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                          title="Marquer payé"
                        >
                          <Banknote size={14} />
                          Marquer payé
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-700">
          <span>
            Page {page} sur {totalPages} ({totalCount} bulletins)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-ink-300 px-3 py-1.5 disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-ink-300 px-3 py-1.5 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}