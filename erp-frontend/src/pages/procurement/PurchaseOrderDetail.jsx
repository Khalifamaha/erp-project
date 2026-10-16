import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCommandeAchat } from "../../hooks/useCommandesAchat";
import PageHeader from "../../components/common/PageHeader";

const STATUT_STYLES = {
  brouillon: "bg-ink-100 text-ink-700",
  soumise: "bg-cyan-400/15 text-cyan-600",
  confirmee: "bg-amber-400/15 text-amber-600",
  partielle: "bg-amber-400/15 text-amber-600",
  livree: "bg-emerald-400/15 text-emerald-600",
  annulee: "bg-rose-400/15 text-rose-600",
};

const STATUT_LABELS = {
  brouillon: "Brouillon",
  soumise: "Soumise",
  confirmee: "Confirmée",
  partielle: "Livraison partielle",
  livree: "Livrée",
  annulee: "Annulée",
};

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: commande, isLoading, isError, error } = useCommandeAchat(id);

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

  const fournisseur = commande.fournisseur_detail || {};

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => navigate("/achats")}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft size={16} />
        Retour aux commandes
      </button>

      <PageHeader
        title={commande.numero}
        subtitle={`Créée le ${new Date(commande.date_creation).toLocaleDateString("fr-FR")}`}
        action={
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              STATUT_STYLES[commande.statut] || "bg-ink-100 text-ink-700"
            }`}
          >
            {STATUT_LABELS[commande.statut] || commande.statut}
          </span>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">Fournisseur</p>
          <p className="mt-1 font-medium text-ink-900">
            {fournisseur.raison_sociale}
          </p>
          <p className="text-sm text-ink-500">{fournisseur.code}</p>
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
          <p className="text-xs font-medium text-ink-500">Taux de réception</p>
          <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
            {commande.taux_reception}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink-100 bg-white p-4 text-sm">
        <div>
          <p className="text-xs font-medium text-ink-500">Date de commande</p>
          <p className="text-ink-900">{commande.date_commande}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Livraison prévue</p>
          <p className="text-ink-900">{commande.date_livraison_prev || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Livraison réelle</p>
          <p className="text-ink-900">{commande.date_livraison_reel || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">
            Conditions de livraison
          </p>
          <p className="text-ink-900">{commande.conditions_livraison || "—"}</p>
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
              <th className="px-4 py-3 font-medium text-right">Qté reçue</th>
              <th className="px-4 py-3 font-medium text-right">Prix unit.</th>
              <th className="px-4 py-3 font-medium text-right">Montant</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {(commande.lignes || []).map((l) => (
              <tr key={l.id} className="border-b border-ink-100 last:border-0">
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
                  {l.quantite_recue}
                </td>
                <td className="px-4 py-3 text-right font-mono-data">
                  {Number(l.prix_unitaire).toLocaleString("fr-FR", {
                    minimumFractionDigits: 3,
                  })}
                </td>
                <td className="px-4 py-3 text-right font-mono-data font-medium text-ink-900">
                  {Number(l.montant_ligne).toLocaleString("fr-FR", {
                    minimumFractionDigits: 3,
                  })}
                </td>
                <td className="px-4 py-3 text-ink-700">{l.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}