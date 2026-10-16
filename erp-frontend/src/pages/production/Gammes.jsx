import { useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, ChevronRight, Check, Copy } from "lucide-react";
import { useGammes, useActiverGamme, useDupliquerGamme } from "../../hooks/useMachinesGammes";
import { getTypesOperation } from "../../api/production";
import PageHeader from "../../components/common/PageHeader";

const TYPE_OP_LABELS = Object.fromEntries(
  getTypesOperation().map((t) => [t.value, t.label])
);

export default function Gammes() {
  const [expanded, setExpanded] = useState(null);
  const { data, isLoading } = useGammes({ page_size: 200 });
  const activerGamme = useActiverGamme();
  const dupliquerGamme = useDupliquerGamme();
  const gammes = data?.results ?? data ?? [];

  const handleActiver = async (id, e) => {
    e.stopPropagation();
    try {
      await activerGamme.mutateAsync(id);
      toast.success("Gamme activée");
    } catch (err) {
      toast.error("Erreur");
    }
  };

  const handleDupliquer = async (id, e) => {
    e.stopPropagation();
    try {
      await dupliquerGamme.mutateAsync(id);
      toast.success("Nouvelle version créée");
    } catch (err) {
      toast.error("Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Gammes opératoires" />

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : gammes.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune gamme opératoire.
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {gammes.map((g) => (
              <div key={g.id}>
                <button
                  onClick={() =>
                    setExpanded(expanded === g.id ? null : g.id)
                  }
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-ink-100/30"
                >
                  <div className="flex items-center gap-2">
                    {expanded === g.id ? (
                      <ChevronDown size={16} className="text-ink-500" />
                    ) : (
                      <ChevronRight size={16} className="text-ink-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-ink-900">
                        {g.nom} — v{g.version}
                        {g.active && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-medium text-emerald-600">
                            Active
                          </span>
                        )}
                      </p>
                      <p className="font-mono-data text-xs text-ink-500">
                        {g.produit_reference} — {g.produit_designation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-ink-500">
                      {g.temps_total_min?.toFixed?.(1) ?? g.temps_total_min} min/pièce
                    </span>
                    {!g.active && (
                      <button
                        onClick={(e) => handleActiver(g.id, e)}
                        className="inline-flex items-center gap-1 rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
                        title="Activer"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDupliquer(g.id, e)}
                      className="inline-flex items-center gap-1 rounded p-1.5 text-ink-500 hover:bg-ink-100"
                      title="Dupliquer (nouvelle version)"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </button>

                {expanded === g.id && (
                  <div className="bg-ink-100/20 px-4 py-3">
                    {(g.operations || []).length === 0 ? (
                      <p className="text-sm text-ink-500">
                        Aucune opération définie.
                      </p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-ink-500">
                            <th className="py-1.5 pr-4 font-medium">#</th>
                            <th className="py-1.5 pr-4 font-medium">
                              Opération
                            </th>
                            <th className="py-1.5 pr-4 font-medium">
                              Machine
                            </th>
                            <th className="py-1.5 pr-4 font-medium">Type</th>
                            <th className="py-1.5 pr-4 font-medium text-right">
                              Temps unit.
                            </th>
                            <th className="py-1.5 font-medium text-right">
                              Opérateurs
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {g.operations
                            .sort((a, b) => a.ordre - b.ordre)
                            .map((op) => (
                              <tr key={op.id} className="border-t border-ink-100">
                                <td className="py-2 pr-4 text-ink-500">
                                  {op.ordre}
                                </td>
                                <td className="py-2 pr-4 text-ink-900">
                                  {op.nom}
                                </td>
                                <td className="py-2 pr-4 text-ink-700">
                                  {op.machine_detail?.nom}
                                </td>
                                <td className="py-2 pr-4 text-ink-700">
                                  {TYPE_OP_LABELS[op.type_operation] ||
                                    op.type_operation}
                                </td>
                                <td className="py-2 pr-4 text-right font-mono-data">
                                  {op.temps_unitaire_min} min
                                </td>
                                <td className="py-2 text-right font-mono-data">
                                  {op.operateurs_requis}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}