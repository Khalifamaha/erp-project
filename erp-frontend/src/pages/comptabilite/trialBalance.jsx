import { useState } from "react";
import { useExercices, useBalance } from "../../hooks/useComptabilite";
import PageHeader from "../../components/common/PageHeader";

export default function TrialBalance() {
  const [exerciceId, setExerciceId] = useState("");
  const { data: exercicesData } = useExercices({ page_size: 50 });
  const exercices = exercicesData?.results ?? exercicesData ?? [];
  const { data: balance, isLoading } = useBalance(exerciceId);

  const fmt = (v) =>
    Number(v || 0).toLocaleString("fr-FR", { minimumFractionDigits: 3 });

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Balance générale"
        action={
          <select
            value={exerciceId}
            onChange={(e) => setExerciceId(e.target.value)}
            className="rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Sélectionner un exercice...</option>
            {exercices.map((e) => (
              <option key={e.id} value={e.id}>
                {e.libelle}
              </option>
            ))}
          </select>
        }
      />

      {!exerciceId ? (
        <div className="rounded-xl border border-ink-100 bg-white p-8 text-center text-sm text-ink-500">
          Sélectionne un exercice pour afficher la balance.
        </div>
      ) : isLoading ? (
        <div className="p-8 text-center text-sm text-ink-500">
          Chargement...
        </div>
      ) : (
        <>
          <div
            className={`rounded-xl border p-4 text-sm font-medium ${
              balance?.equilibre
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {balance?.equilibre
              ? "✓ Balance équilibrée"
              : "⚠ Balance déséquilibrée — vérifier les écritures"}
          </div>

          <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                  <th className="px-4 py-3 font-medium">N° compte</th>
                  <th className="px-4 py-3 font-medium">Libellé</th>
                  <th className="px-4 py-3 font-medium">Classe</th>
                  <th className="px-4 py-3 font-medium text-right">Débit</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Crédit
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Solde</th>
                </tr>
              </thead>
              <tbody>
                {(balance?.lignes || []).map((l) => (
                  <tr key={l.numero} className="border-b border-ink-100 last:border-0">
                    <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                      {l.numero}
                    </td>
                    <td className="px-4 py-3 text-ink-700">{l.libelle}</td>
                    <td className="px-4 py-3 text-ink-500">
                      Classe {l.classe}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-data">
                      {fmt(l.debit)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-data">
                      {fmt(l.credit)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono-data font-medium ${
                        l.solde < 0 ? "text-rose-500" : "text-ink-900"
                      }`}
                    >
                      {fmt(l.solde)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ink-300 bg-ink-100/40 font-semibold">
                  <td className="px-4 py-3 text-ink-900" colSpan={3}>
                    Total
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data text-ink-900">
                    {fmt(balance?.total_debit)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data text-ink-900">
                    {fmt(balance?.total_credit)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}