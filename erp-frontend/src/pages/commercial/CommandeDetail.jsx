import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCommande } from "../../hooks/useCommandes";
import PageHeader from "../../components/common/PageHeader";
import StatutBadge from "../../components/ui/StatutBadge";

const LIGNE_STATUT_LABELS = {
  en_attente: "En attente",
  en_cours: "En cours",
  partielle: "Partielle",
  livree: "Livrée",
  annulee: "Annulée",
};

export default function CommandeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: commande, isLoading, isError, error } = useCommande(id);

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-ink-500">Chargement...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-sm text-rose-500">
        Erreur : {error?.message || "impossible de charger la commande"}
      </div>
    );
  }

  const client = commande.client_detail || {};

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => navigate("/commandes")}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft size={16} />
        Retour aux commandes
      </button>

      <PageHeader
        title={commande.numero}
        subtitle={`Créée le ${new Date(commande.date_creation).toLocaleDateString("fr-FR")}`}
        action={<StatutBadge statut={commande.statut} />}
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">Client</p>
          <p className="mt-1 font-medium text-ink-900">
            {client.raison_sociale}
          </p>
          <p className="text-sm text-ink-500">{client.code}</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">Montant total</p>
          <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
            {Number(commande.montant_total).toLocaleString("fr-FR", {
              minimumFractionDigits: 3,
            })}{" "}
            {commande.devise}
          </p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">Taux de livraison</p>
          <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
            {commande.taux_livraison}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink-100 bg-white p-4 text-sm">
        <div>
          <p className="text-xs font-medium text-ink-500">Date de commande</p>
          <p className="text-ink-900">{commande.date_commande}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Livraison souhaitée</p>
          <p className="text-ink-900">{commande.date_livraison_souhaitee || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Livraison confirmée</p>
          <p className="text-ink-900">{commande.date_livraison_confirmee || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Incoterm</p>
          <p className="text-ink-900">{commande.incoterm || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Commercial</p>
          <p className="text-ink-900">{commande.commercial_nom || "—"}</p>
        </div>
        {commande.notes && (
          <div className="col-span-2">
            <p className="text-xs font-medium text-ink-500">Notes</p>
            <p className="text-ink-900">{commande.notes}</p>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        <div className="border-b border-ink-100 px-4 py-3">
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Lignes de commande
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
              <th className="px-4 py-3 font-medium">Produit</th>
              <th className="px-4 py-3 font-medium text-right">Qté commandée</th>
              <th className="px-4 py-3 font-medium text-right">Qté livrée</th>
              <th className="px-4 py-3 font-medium text-right">Qté restante</th>
              <th className="px-4 py-3 font-medium text-right">Prix unit.</th>
              <th className="px-4 py-3 font-medium text-right">Remise</th>
              <th className="px-4 py-3 font-medium text-right">Montant</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {(commande.lignes || []).map((l) => (
              <tr
                key={l.id}
                className="border-b border-ink-100 last:border-0"
              >
                <td className="px-4 py-3 text-ink-900">
                  <span className="font-mono-data text-ink-500">
                    {l.produit_reference}
                  </span>{" "}
                  — {l.produit_designation}
                </td>
                <td className="px-4 py-3 text-right font-mono-data">
                  {l.quantite_commandee}
                </td>
                <td className="px-4 py-3 text-right font-mono-data">
                  {l.quantite_livree}
                </td>
                <td className="px-4 py-3 text-right font-mono-data">
                  {l.quantite_restante}
                </td>
                <td className="px-4 py-3 text-right font-mono-data">
                  {Number(l.prix_unitaire).toLocaleString("fr-FR", {
                    minimumFractionDigits: 3,
                  })}
                </td>
                <td className="px-4 py-3 text-right font-mono-data">
                  {l.remise_pct}%
                </td>
                <td className="px-4 py-3 text-right font-mono-data font-medium text-ink-900">
                  {Number(l.montant_ligne).toLocaleString("fr-FR", {
                    minimumFractionDigits: 3,
                  })}
                </td>
                <td className="px-4 py-3 text-ink-700">
                  {LIGNE_STATUT_LABELS[l.statut] || l.statut}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}