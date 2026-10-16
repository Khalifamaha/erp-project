import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import toast from "react-hot-toast";
import { useEnregistrerAjustement } from "../../hooks/useMouvements";
import { getProduits } from "../../api/inventory";
import PageHeader from "../../components/common/PageHeader";

export default function StockAdjustment() {
  const [produit, setProduit] = useState(null);
  const [quantiteReelle, setQuantiteReelle] = useState("");
  const [motif, setMotif] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const enregistrerAjustement = useEnregistrerAjustement();

  const { data: produitsData } = useQuery({
    queryKey: ["produits", { page_size: 500 }],
    queryFn: () => getProduits({ page_size: 500 }),
  });
  const produitOptions = (produitsData?.results ?? produitsData ?? []).map(
    (p) => ({
      value: p.id,
      label: `${p.reference} — ${p.designation}`,
      stock_actuel: p.stock_actuel,
      unite_mesure: p.unite_mesure,
    })
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!produit || quantiteReelle === "") {
      toast.error("Sélectionne un produit et indique la quantité réelle");
      return;
    }
    try {
      const result = await enregistrerAjustement.mutateAsync({
        produit_id: produit.value,
        quantite_reelle: Number(quantiteReelle),
        motif: motif || undefined,
      });
      setLastResult(result);
      toast.success(result.message || "Ajustement effectué");
      setProduit(null);
      setQuantiteReelle("");
      setMotif("");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <PageHeader title="Ajustement d'inventaire" />

      <p className="text-sm text-ink-500">
        Corrige le stock système pour le faire correspondre au comptage
        physique réel. Un mouvement d'ajustement (positif ou négatif) sera
        généré automatiquement.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-ink-100 bg-white p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Produit
          </label>
          <Select
            value={produit}
            onChange={setProduit}
            options={produitOptions}
            placeholder="Rechercher un produit..."
            classNamePrefix="rs"
          />
          {produit && (
            <p className="mt-1 text-xs text-ink-500">
              Stock système actuel : {produit.stock_actuel}{" "}
              {produit.unite_mesure}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Quantité physique réelle *
          </label>
          <input
            type="number"
            step="0.001"
            value={quantiteReelle}
            onChange={(e) => setQuantiteReelle(e.target.value)}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Motif
          </label>
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            rows={2}
            placeholder="Inventaire annuel, écart constaté..."
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={enregistrerAjustement.isPending}
          className="w-full rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          Appliquer l'ajustement
        </button>
      </form>

      {lastResult && lastResult.ecart !== undefined && (
        <div className="rounded-xl border border-ink-100 bg-white p-4 text-sm">
          <p className="font-medium text-ink-900">Dernier ajustement</p>
          <p className="mt-1 text-ink-700">
            Stock avant : {lastResult.stock_avant} → après :{" "}
            {lastResult.stock_apres}
          </p>
          <p
            className={`font-mono-data font-semibold ${
              lastResult.ecart > 0 ? "text-emerald-600" : "text-rose-500"
            }`}
          >
            Écart : {lastResult.ecart > 0 ? "+" : ""}
            {lastResult.ecart}
          </p>
        </div>
      )}
    </div>
  );
}