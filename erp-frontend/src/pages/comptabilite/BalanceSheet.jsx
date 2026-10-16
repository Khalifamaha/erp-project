import { useState } from "react";
import { useExercices, useBilanExercice } from "../../hooks/useComptabilite";
import PageHeader from "../../components/common/PageHeader";

export default function BalanceSheet() {
  const [exerciceId, setExerciceId] = useState("");
  const { data: exercicesData } = useExercices({ page_size: 50 });
  const exercices = exercicesData?.results ?? exercicesData ?? [];
  const { data: bilan, isLoading } = useBilanExercice(exerciceId);

  const fmt = (v) =>
    Number(v || 0).toLocaleString("fr-FR", { minimumFractionDigits: 3 });

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Bilan comptable"
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
          Sélectionne un exercice pour afficher le bilan.
        </div>
      ) : isLoading ? (
        <div className="p-8 text-center text-sm text-ink-500">
          Chargement...
        </div>
      ) : (
        <>
          <div
            className={`rounded-xl border p-4 text-sm font-medium ${
              bilan?.equilibre
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {bilan?.equilibre
              ? "✓ Bilan équilibré"
              : "⚠ Bilan déséquilibré"}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
              <div className="border-b border-ink-100 bg-brand-50 px-4 py-3">
                <h3 className="font-display text-sm font-semibold text-brand-700">
                  Actif
                </h3>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {(bilan?.actif || []).map((l) => (
                    <tr key={l.numero} className="border-b border-ink-100 last:border-0">
                      <td className="px-4 py-2.5 font-mono-data text-ink-500">
                        {l.numero}
                      </td>
                      <td className="px-4 py-2.5 text-ink-700">
                        {l.libelle}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono-data text-ink-900">
                        {fmt(l.solde)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-ink-300 bg-ink-100/40 font-semibold">
                    <td className="px-4 py-3 text-ink-900" colSpan={2}>
                      Total Actif
                    </td>
                    <td className="px-4 py-3 text-right font-mono-data text-ink-900">
                      {fmt(bilan?.total_actif)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
              <div className="border-b border-ink-100 bg-cyan-50 px-4 py-3">
                <h3 className="font-display text-sm font-semibold text-cyan-700">
                  Passif
                </h3>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {(bilan?.passif || []).map((l) => (
                    <tr key={l.numero} className="border-b border-ink-100 last:border-0">
                      <td className="px-4 py-2.5 font-mono-data text-ink-500">
                        {l.numero}
                      </td>
                      <td className="px-4 py-2.5 text-ink-700">
                        {l.libelle}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono-data text-ink-900">
                        {fmt(l.solde)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-ink-300 bg-ink-100/40 font-semibold">
                    <td className="px-4 py-3 text-ink-900" colSpan={2}>
                      Total Passif
                    </td>
                    <td className="px-4 py-3 text-right font-mono-data text-ink-900">
                      {fmt(bilan?.total_passif)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}