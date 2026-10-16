import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import toast from "react-hot-toast";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useMouvements } from "../../hooks/useMouvements";
import {
  useEnregistrerEntree,
  useEnregistrerSortie,
} from "../../hooks/useMouvements";
import {
  getProduits,
  getTypesMouvementEntree,
  getTypesMouvementSortie,
} from "../../api/inventory";
import PageHeader from "../../components/common/PageHeader";

function MouvementForm({ mode, onClose }) {
  const isEntree = mode === "entree";
  const types = isEntree ? getTypesMouvementEntree() : getTypesMouvementSortie();
  const enregistrerEntree = useEnregistrerEntree();
  const enregistrerSortie = useEnregistrerSortie();

  const { data: produitsData } = useQuery({
    queryKey: ["produits", { page_size: 500 }],
    queryFn: () => getProduits({ page_size: 500 }),
  });
  const produitOptions = (produitsData?.results ?? produitsData ?? []).map(
    (p) => ({ value: p.id, label: `${p.reference} — ${p.designation}` })
  );

  const [produit, setProduit] = useState(null);
  const [typeMouvement, setTypeMouvement] = useState("");
  const [quantite, setQuantite] = useState("");
  const [motif, setMotif] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!produit || !typeMouvement || !quantite) {
      toast.error("Remplis tous les champs requis");
      return;
    }
    const payload = {
      produit_id: produit.value,
      type_mouvement: typeMouvement,
      quantite: Number(quantite),
      motif,
    };
    try {
      if (isEntree) {
        await enregistrerEntree.mutateAsync(payload);
      } else {
        await enregistrerSortie.mutateAsync(payload);
      }
      toast.success(isEntree ? "Entrée enregistrée" : "Sortie enregistrée");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-4 items-end gap-3 rounded-xl border border-ink-100 bg-white p-4"
    >
      <div className="col-span-2">
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
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Type
        </label>
        <select
          value={typeMouvement}
          onChange={(e) => setTypeMouvement(e.target.value)}
          className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        >
          <option value="">Sélectionner...</option>
          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Quantité
        </label>
        <input
          type="number"
          step="0.001"
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
          className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <div className="col-span-3">
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Motif / référence
        </label>
        <input
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <button
        type="submit"
        className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
          isEntree
            ? "bg-emerald-500 hover:bg-emerald-600"
            : "bg-amber-500 hover:bg-amber-600"
        }`}
      >
        Confirmer
      </button>
    </form>
  );
}

export default function StockMovements() {
  const [page, setPage] = useState(1);
  const [activeForm, setActiveForm] = useState(null);

  const { data, isLoading } = useMouvements({ page });
  const mouvements = data?.results ?? data ?? [];
  const totalCount = data?.count ?? mouvements.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Mouvements de stock"
        action={
          <div className="flex gap-2">
            <button
              onClick={() =>
                setActiveForm(activeForm === "entree" ? null : "entree")
              }
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            >
              <ArrowDownCircle size={16} />
              Entrée
            </button>
            <button
              onClick={() =>
                setActiveForm(activeForm === "sortie" ? null : "sortie")
              }
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
            >
              <ArrowUpCircle size={16} />
              Sortie
            </button>
          </div>
        }
      />

      {activeForm && (
        <MouvementForm mode={activeForm} onClose={() => setActiveForm(null)} />
      )}

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : mouvements.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucun mouvement enregistré.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Produit</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium text-right">Quantité</th>
                <th className="px-4 py-3 font-medium text-right">
                  Stock avant → après
                </th>
                <th className="px-4 py-3 font-medium">Référence</th>
              </tr>
            </thead>
            <tbody>
              {mouvements.map((m) => (
                <tr key={m.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 text-ink-700">
                    {new Date(m.date_mouvement).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-ink-900">
                    {m.produit_detail?.reference} —{" "}
                    {m.produit_detail?.designation}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {m.type_mouvement}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {m.quantite}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data text-ink-500">
                    {m.stock_avant} → {m.stock_apres}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {m.reference_doc || "—"}
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
            Page {page} sur {totalPages} ({totalCount} mouvements)
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
    </div>
  );
}