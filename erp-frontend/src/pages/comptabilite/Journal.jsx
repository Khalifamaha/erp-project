import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Check } from "lucide-react";
import { useEcritures, useValiderEcriture } from "../../hooks/useComptabilite";
import { getJournaux } from "../../api/comptabilite";
import PageHeader from "../../components/common/PageHeader";

const journaux = getJournaux();
const JOURNAL_LABELS = Object.fromEntries(
  journaux.map((j) => [j.value, j.label])
);

export default function Journal() {
  const navigate = useNavigate();
  const [journalFilter, setJournalFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useEcritures({
    journal: journalFilter || undefined,
    page,
  });
  const validerEcriture = useValiderEcriture();
  const ecritures = data?.results ?? data ?? [];
  const totalCount = data?.count ?? ecritures.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleValider = async (id) => {
    try {
      await validerEcriture.mutateAsync(id);
      toast.success("Écriture validée");
    } catch (err) {
      toast.error("Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Journal comptable"
        action={
          <button
            onClick={() => navigate("/ecritures/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouvelle écriture
          </button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setJournalFilter("");
            setPage(1);
          }}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            journalFilter === ""
              ? "border-brand-500 bg-brand-50 text-brand-600"
              : "border-ink-300 text-ink-700 hover:bg-ink-100"
          }`}
        >
          Tous
        </button>
        {journaux.map((j) => (
          <button
            key={j.value}
            onClick={() => {
              setJournalFilter(j.value);
              setPage(1);
            }}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              journalFilter === j.value
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-ink-300 text-ink-700 hover:bg-ink-100"
            }`}
          >
            {j.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : ecritures.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune écriture.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Journal</th>
                <th className="px-4 py-3 font-medium">Libellé</th>
                <th className="px-4 py-3 font-medium">Débit</th>
                <th className="px-4 py-3 font-medium">Crédit</th>
                <th className="px-4 py-3 font-medium text-right">Montant</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ecritures.map((e) => (
                <tr key={e.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 text-ink-700">{e.date_ecriture}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {JOURNAL_LABELS[e.journal] || e.journal}
                  </td>
                  <td className="px-4 py-3 text-ink-900">{e.libelle}</td>
                  <td className="px-4 py-3 font-mono-data text-ink-700">
                    {e.compte_debit_detail?.numero_compte}
                  </td>
                  <td className="px-4 py-3 font-mono-data text-ink-700">
                    {e.compte_credit_detail?.numero_compte}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data font-medium text-ink-900">
                    {Number(e.montant).toLocaleString("fr-FR", {
                      minimumFractionDigits: 3,
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {e.validee ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <Check size={12} />
                        Validée
                      </span>
                    ) : (
                      <button
                        onClick={() => handleValider(e.id)}
                        className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-cyan-600 hover:bg-cyan-50"
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-700">
          <span>
            Page {page} sur {totalPages} ({totalCount} écritures)
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