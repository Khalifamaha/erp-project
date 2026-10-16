import { useNavigate } from "react-router-dom";
import { AlertTriangle, PackageX } from "lucide-react";
import {
  useProduitsStats,
  useProduitsSousSeuil,
  useProduitsRupture,
} from "../../hooks/useProduits";
import PageHeader from "../../components/common/PageHeader";

export default function Stock() {
  const navigate = useNavigate();
  const { data: stats } = useProduitsStats();
  const { data: sousSeuil } = useProduitsSousSeuil();
  const { data: rupture } = useProduitsRupture();

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Stock & produits" />

      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">
              Total produits
            </p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {stats.total_produits}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">
              Valeur totale du stock
            </p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
              {Number(stats.valeur_totale_dt).toLocaleString("fr-FR", {
                minimumFractionDigits: 3,
              })}{" "}
              TND
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">Sous seuil</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-amber-600">
              {stats.sous_seuil}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-medium text-ink-500">En rupture</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-rose-500">
              {stats.en_rupture}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
          <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-3">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="font-display text-sm font-semibold text-ink-900">
              Produits sous seuil ({sousSeuil?.length || 0})
            </h3>
          </div>
          {!sousSeuil || sousSeuil.length === 0 ? (
            <div className="p-6 text-center text-sm text-ink-500">
              Aucun produit sous le seuil minimum.
            </div>
          ) : (
            <div className="divide-y divide-ink-100">
              {sousSeuil.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/produits/${p.id}`)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-ink-100/30"
                >
                  <div>
                    <p className="font-medium text-ink-900">
                      {p.designation}
                    </p>
                    <p className="font-mono-data text-xs text-ink-500">
                      {p.reference}
                    </p>
                  </div>
                  <span className="font-mono-data text-amber-600">
                    {p.stock_actuel} / {p.stock_minimum} {p.unite_mesure}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
          <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-3">
            <PackageX size={16} className="text-rose-500" />
            <h3 className="font-display text-sm font-semibold text-ink-900">
              Produits en rupture ({rupture?.length || 0})
            </h3>
          </div>
          {!rupture || rupture.length === 0 ? (
            <div className="p-6 text-center text-sm text-ink-500">
              Aucun produit en rupture.
            </div>
          ) : (
            <div className="divide-y divide-ink-100">
              {rupture.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/produits/${p.id}`)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-ink-100/30"
                >
                  <div>
                    <p className="font-medium text-ink-900">
                      {p.designation}
                    </p>
                    <p className="font-mono-data text-xs text-ink-500">
                      {p.reference}
                    </p>
                  </div>
                  <span className="font-mono-data text-rose-500">
                    {p.stock_actuel} {p.unite_mesure}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}