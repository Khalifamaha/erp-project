import { useState } from "react";
import toast from "react-hot-toast";
import { Banknote } from "lucide-react";
import {
  useFacturesAchat,
  useFacturesAchatStats,
  usePayerFactureAchat,
} from "../../hooks/useReceptions";
import PageHeader from "../../components/common/PageHeader";

const STATUT_STYLES = {
  recue: "bg-ink-100 text-ink-700",
  verifiee: "bg-cyan-400/15 text-cyan-600",
  approuvee: "bg-cyan-400/15 text-cyan-600",
  payee: "bg-emerald-400/15 text-emerald-600",
  partiellement_payee: "bg-amber-400/15 text-amber-600",
  contestee: "bg-rose-400/15 text-rose-600",
  annulee: "bg-rose-400/15 text-rose-600",
};

const STATUT_LABELS = {
  recue: "Reçue",
  verifiee: "Vérifiée",
  approuvee: "Approuvée",
  payee: "Payée",
  partiellement_payee: "Partiellement payée",
  contestee: "Contestée",
  annulee: "Annulée",
};

function PayModal({ facture, onClose }) {
  const payerFacture = usePayerFactureAchat();
  const [montant, setMontant] = useState(facture.solde_restant);
  const [modePaiement, setModePaiement] = useState("virement");
  const [datePaiement, setDatePaiement] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [reference, setReference] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await payerFacture.mutateAsync({
        id: facture.id,
        payload: {
          montant: Number(montant),
          mode_paiement: modePaiement,
          reference_paiement: reference,
          date_paiement: datePaiement,
        },
      });
      toast.success("Paiement enregistré");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-xl"
      >
        <h3 className="font-display text-base font-semibold text-ink-900">
          Payer {facture.numero}
        </h3>
        <p className="text-sm text-ink-500">
          Solde restant : {facture.solde_restant}
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Montant
          </label>
          <input
            type="number"
            step="0.001"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Mode de paiement
          </label>
          <select
            value={modePaiement}
            onChange={(e) => setModePaiement(e.target.value)}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="virement">Virement bancaire</option>
            <option value="cheque">Chèque</option>
            <option value="especes">Espèces</option>
            <option value="traite">Traite</option>
            <option value="lc">Lettre de crédit</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Date de paiement
          </label>
          <input
            type="date"
            value={datePaiement}
            onChange={(e) => setDatePaiement(e.target.value)}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Référence
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Confirmer
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Invoices() {
  const [page, setPage] = useState(1);
  const [payingFacture, setPayingFacture] = useState(null);

  const { data, isLoading, isError, error } = useFacturesAchat({ page });
  const { data: stats } = useFacturesAchatStats();

  const factures = data?.results ?? data ?? [];
  const totalCount = data?.count ?? factures.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const fmtMoney = (v) =>
    Number(v || 0).toLocaleString("fr-FR", { minimumFractionDigits: 3 });

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Factures fournisseurs" />

      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Total factures</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {stats.total_factures}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Montant TTC</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {fmtMoney(stats.montant_total_ttc)} TND
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">
              Solde restant dû
            </p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-amber-600">
              {fmtMoney(stats.solde_restant)} TND
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">En retard</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-rose-500">
              {stats.en_retard}
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-rose-500">
            Erreur : {error?.message || "impossible de charger les factures"}
          </div>
        ) : factures.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune facture trouvée.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Numéro</th>
                <th className="px-4 py-3 font-medium">Fournisseur</th>
                <th className="px-4 py-3 font-medium">Échéance</th>
                <th className="px-4 py-3 font-medium text-right">TTC</th>
                <th className="px-4 py-3 font-medium text-right">
                  Solde restant
                </th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {factures.map((f) => (
                <tr key={f.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {f.numero}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {f.fournisseur_detail?.raison_sociale}
                  </td>
                  <td
                    className={`px-4 py-3 ${
                      f.est_en_retard ? "text-rose-500 font-medium" : "text-ink-700"
                    }`}
                  >
                    {f.date_echeance}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {fmtMoney(f.montant_ttc)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data font-medium text-ink-900">
                    {fmtMoney(f.solde_restant)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUT_STYLES[f.statut] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {STATUT_LABELS[f.statut] || f.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {f.solde_restant > 0 && (
                      <button
                        onClick={() => setPayingFacture(f)}
                        className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                        title="Payer"
                      >
                        <Banknote size={14} />
                        Payer
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
            Page {page} sur {totalPages} ({totalCount} factures)
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

      {payingFacture && (
        <PayModal
          facture={payingFacture}
          onClose={() => setPayingFacture(null)}
        />
      )}
    </div>
  );
}