import { useState } from "react";
import toast from "react-hot-toast";
import { Send, Banknote } from "lucide-react";
import {
  useFacturesVente,
  useFacturesVenteStats,
  useEmettreFacture,
  usePayerFactureVente,
} from "../../hooks/useFacturesVente";
import PageHeader from "../../components/common/PageHeader";

const STATUT_STYLES = {
  brouillon: "bg-ink-100 text-ink-700",
  emise: "bg-cyan-400/15 text-cyan-600",
  payee: "bg-emerald-400/15 text-emerald-600",
  partiellement_payee: "bg-amber-400/15 text-amber-600",
  en_retard: "bg-rose-400/15 text-rose-600",
  annulee: "bg-ink-100 text-ink-700",
};

const STATUT_LABELS = {
  brouillon: "Brouillon",
  emise: "Émise",
  payee: "Payée",
  partiellement_payee: "Partiellement payée",
  en_retard: "En retard",
  annulee: "Annulée",
};

function PayModal({ facture, onClose }) {
  const payer = usePayerFactureVente();
  const [montant, setMontant] = useState(facture.solde_restant);
  const [datePaiement, setDatePaiement] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [reference, setReference] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await payer.mutateAsync({
        id: facture.id,
        payload: {
          montant: Number(montant),
          date_paiement: datePaiement,
          reference,
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
          Encaisser {facture.numero}
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
  const { data, isLoading } = useFacturesVente({ page });
  const { data: stats } = useFacturesVenteStats();
  const emettreFacture = useEmettreFacture();

  const factures = data?.results ?? data ?? [];
  const totalCount = data?.count ?? factures.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const fmt = (v) =>
    Number(v || 0).toLocaleString("fr-FR", { minimumFractionDigits: 3 });

  const handleEmettre = async (id) => {
    try {
      await emettreFacture.mutateAsync(id);
      toast.success("Facture émise");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Factures clients" />

      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">CA total TTC</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {fmt(stats.ca_total_ttc)} TND
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Encaissé</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-emerald-600">
              {fmt(stats.encaisse)} TND
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">À encaisser</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-amber-600">
              {fmt(stats.a_encaisser)} TND
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">En retard</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-rose-500">
              {stats.en_retard_nb}
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : factures.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune facture.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Numéro</th>
                <th className="px-4 py-3 font-medium">Client</th>
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
                  <td className="px-4 py-3 text-ink-700">{f.client_nom}</td>
                  <td
                    className={`px-4 py-3 ${
                      f.est_en_retard
                        ? "text-rose-500 font-medium"
                        : "text-ink-700"
                    }`}
                  >
                    {f.date_echeance}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {fmt(f.montant_ttc)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data font-medium text-ink-900">
                    {fmt(f.solde_restant)}
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
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {f.statut === "brouillon" && (
                        <button
                          onClick={() => handleEmettre(f.id)}
                          className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-cyan-600 hover:bg-cyan-50"
                        >
                          <Send size={14} />
                          Émettre
                        </button>
                      )}
                      {f.solde_restant > 0 && f.statut !== "brouillon" && (
                        <button
                          onClick={() => setPayingFacture(f)}
                          className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                        >
                          <Banknote size={14} />
                          Encaisser
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