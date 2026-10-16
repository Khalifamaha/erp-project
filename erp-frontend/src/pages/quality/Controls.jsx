import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useControles, useControlesStats } from "../../hooks/useQualite";
import { getResultatsControle } from "../../api/quality";
import PageHeader from "../../components/common/PageHeader";

const RESULTAT_LABELS = Object.fromEntries(
  getResultatsControle().map((r) => [r.value, r.label])
);

const RESULTAT_STYLES = {
  conforme: "bg-emerald-400/15 text-emerald-600",
  non_conforme: "bg-rose-400/15 text-rose-600",
  a_verifier: "bg-amber-400/15 text-amber-600",
  accepte_derog: "bg-cyan-400/15 text-cyan-600",
};

export default function Controls() {
  const navigate = useNavigate();
  const { data, isLoading } = useControles({ page_size: 50 });
  const { data: stats } = useControlesStats();
  const controles = data?.results ?? data ?? [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Contrôles qualité"
        action={
          <button
            onClick={() => navigate("/controles/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouveau contrôle
          </button>
        }
      />

      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">
              Total contrôles
            </p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {stats.total_controles}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">
              Taux de conformité
            </p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-emerald-600">
              {stats.taux_conformite}%
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">
              Non-conformités
            </p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-rose-500">
              {stats.non_conformes}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Taux de rebut</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-amber-600">
              {stats.taux_rebut}%
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : controles.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucun contrôle enregistré.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">OF</th>
                <th className="px-4 py-3 font-medium">Critère</th>
                <th className="px-4 py-3 font-medium text-right">Mesure</th>
                <th className="px-4 py-3 font-medium text-right">
                  Conformité
                </th>
                <th className="px-4 py-3 font-medium">Résultat</th>
              </tr>
            </thead>
            <tbody>
              {controles.map((c) => (
                <tr key={c.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 text-ink-700">
                    {new Date(c.date_controle).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 font-mono-data text-ink-900">
                    {c.ordre_numero}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {c.critere_detail?.nom}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {c.valeur_mesuree ?? "—"}{" "}
                    {c.critere_detail?.unite}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {c.taux_conformite}%
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        RESULTAT_STYLES[c.resultat] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {RESULTAT_LABELS[c.resultat] || c.resultat}
                    </span>
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