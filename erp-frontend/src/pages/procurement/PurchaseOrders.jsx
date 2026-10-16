import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Search, Send, Check, X } from "lucide-react";
import {
  useCommandesAchat,
  useSoumettreCommandeAchat,
  useConfirmerCommandeAchat,
  useAnnulerCommandeAchat,
} from "../../hooks/useCommandesAchat";
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

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error } = useCommandesAchat({
    page,
    search: search || undefined,
  });
  const soumettre = useSoumettreCommandeAchat();
  const confirmer = useConfirmerCommandeAchat();
  const annuler = useAnnulerCommandeAchat();

  const commandes = data?.results ?? data ?? [];
  const totalCount = data?.count ?? commandes.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleAction = async (mutation, id, successMsg) => {
    try {
      await mutation.mutateAsync(id);
      toast.success(successMsg);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Commandes d'achat"
        action={
          <button
            onClick={() => navigate("/achats/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <Plus size={16} />
            Nouvelle commande
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Rechercher un numéro ou fournisseur..."
          className="w-full rounded-lg border border-ink-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Chargement...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-rose-500">
            Erreur : {error?.message || "impossible de charger les commandes"}
          </div>
        ) : commandes.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Aucune commande trouvée.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Numéro</th>
                <th className="px-4 py-3 font-medium">Fournisseur</th>
                <th className="px-4 py-3 font-medium">Livraison prévue</th>
                <th className="px-4 py-3 font-medium text-right">Montant</th>
                <th className="px-4 py-3 font-medium text-right">
                  Taux réception
                </th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-ink-100 last:border-0 hover:bg-ink-100/30 cursor-pointer"
                  onClick={() => navigate(`/achats/${c.id}`)}
                >
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {c.numero}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {c.fournisseur_detail?.raison_sociale}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {c.date_livraison_prev || "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {Number(c.montant_total).toLocaleString("fr-FR", {
                      minimumFractionDigits: 3,
                    })}{" "}
                    {c.devise}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {c.taux_reception}%
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUT_STYLES[c.statut] || "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {STATUT_LABELS[c.statut] || c.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {c.statut === "brouillon" && (
                        <button
                          onClick={() =>
                            handleAction(soumettre, c.id, "Commande soumise")
                          }
                          className="rounded p-1.5 text-cyan-600 hover:bg-cyan-50"
                          title="Soumettre"
                        >
                          <Send size={14} />
                        </button>
                      )}
                      {c.statut === "soumise" && (
                        <button
                          onClick={() =>
                            handleAction(
                              confirmer,
                              c.id,
                              "Commande confirmée"
                            )
                          }
                          className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
                          title="Confirmer"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      {["brouillon", "soumise", "confirmee"].includes(
                        c.statut
                      ) && (
                        <button
                          onClick={() =>
                            handleAction(annuler, c.id, "Commande annulée")
                          }
                          className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                          title="Annuler"
                        >
                          <X size={14} />
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
            Page {page} sur {totalPages} ({totalCount} commandes)
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