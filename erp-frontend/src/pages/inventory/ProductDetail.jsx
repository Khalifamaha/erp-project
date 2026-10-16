import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, AlertTriangle } from "lucide-react";
import {
  useProduit,
  useProduitLots,
  useProduitMouvements,
} from "../../hooks/useProduits";
import PageHeader from "../../components/common/PageHeader";

const STATUT_LOT_STYLES = {
  disponible: "bg-emerald-400/15 text-emerald-600",
  quarantaine: "bg-amber-400/15 text-amber-600",
  bloque: "bg-rose-400/15 text-rose-600",
  epuise: "bg-ink-100 text-ink-700",
  expire: "bg-rose-400/15 text-rose-600",
  rebut: "bg-ink-100 text-ink-700",
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: produit, isLoading, isError, error } = useProduit(id);
  const { data: lots } = useProduitLots(id);
  const { data: mouvements } = useProduitMouvements(id);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-ink-500">
        Chargement...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-sm text-rose-500">
        Erreur : {error?.message || "impossible de charger le produit"}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => navigate("/produits")}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft size={16} />
        Retour aux produits
      </button>

      <PageHeader
        title={produit.designation}
        subtitle={produit.reference}
        action={
          <button
            onClick={() => navigate(`/produits/${id}/edit`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            <Pencil size={14} />
            Modifier
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">Stock actuel</p>
          <p
            className={`mt-1 flex items-center gap-1.5 font-mono-data text-lg font-semibold ${
              produit.est_rupture
                ? "text-rose-500"
                : produit.est_sous_seuil
                ? "text-amber-600"
                : "text-ink-900"
            }`}
          >
            {(produit.est_rupture || produit.est_sous_seuil) && (
              <AlertTriangle size={16} />
            )}
            {produit.stock_actuel} {produit.unite_mesure}
          </p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">Prix unitaire</p>
          <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
            {Number(produit.prix_unitaire).toLocaleString("fr-FR", {
              minimumFractionDigits: 3,
            })}
          </p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">
            Valeur totale du stock
          </p>
          <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
            {Number(produit.valeur_stock).toLocaleString("fr-FR", {
              minimumFractionDigits: 3,
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink-100 bg-white p-4 text-sm">
        <div>
          <p className="text-xs font-medium text-ink-500">Catégorie</p>
          <p className="text-ink-900">{produit.categorie_nom || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Emplacement</p>
          <p className="text-ink-900">{produit.emplacement_nom || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Stock min / max</p>
          <p className="text-ink-900">
            {produit.stock_minimum} / {produit.stock_maximum}{" "}
            {produit.unite_mesure}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Code-barre</p>
          <p className="text-ink-900">{produit.code_barre || "—"}</p>
        </div>
        {produit.description && (
          <div className="col-span-2">
            <p className="text-xs font-medium text-ink-500">Description</p>
            <p className="text-ink-900">{produit.description}</p>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        <div className="border-b border-ink-100 px-4 py-3">
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Lots ({lots?.length || 0})
          </h3>
        </div>
        {!lots || lots.length === 0 ? (
          <div className="p-6 text-center text-sm text-ink-500">
            Aucun lot pour ce produit.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">N° lot</th>
                <th className="px-4 py-3 font-medium text-right">
                  Qté restante
                </th>
                <th className="px-4 py-3 font-medium">Expiration</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((l) => (
                <tr key={l.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-mono-data text-ink-900">
                    {l.numero_lot}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {l.quantite_restante}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {l.date_expiration || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUT_LOT_STYLES[l.statut] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {l.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        <div className="border-b border-ink-100 px-4 py-3">
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Derniers mouvements
          </h3>
        </div>
        {!mouvements || mouvements.length === 0 ? (
          <div className="p-6 text-center text-sm text-ink-500">
            Aucun mouvement enregistré.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium text-right">Quantité</th>
                <th className="px-4 py-3 font-medium text-right">
                  Stock après
                </th>
              </tr>
            </thead>
            <tbody>
              {mouvements.map((m) => (
                <tr key={m.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 text-ink-700">
                    {new Date(m.date_mouvement).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-ink-900">{m.type_mouvement}</td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {m.quantite}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {m.stock_apres}
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