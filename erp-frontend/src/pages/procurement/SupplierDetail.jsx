import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil, Star } from "lucide-react";
import client from "../../api/client";
import PageHeader from "../../components/common/PageHeader";

async function getFournisseur(id) {
  const { data } = await client.get(`/procurement/fournisseurs/${id}/`);
  return data;
}
async function getCommandesFournisseur(id) {
  const { data } = await client.get(
    `/procurement/fournisseurs/${id}/commandes/`
  );
  return data;
}
async function getFacturesFournisseur(id) {
  const { data } = await client.get(
    `/procurement/fournisseurs/${id}/factures/`
  );
  return data;
}
async function noterFournisseur({ id, score }) {
  const { data } = await client.post(`/procurement/fournisseurs/${id}/noter/`, {
    score_qualite: score,
  });
  return data;
}

const STATUT_STYLES = {
  actif: "bg-emerald-400/15 text-emerald-600",
  inactif: "bg-ink-100 text-ink-700",
  blacklist: "bg-rose-400/15 text-rose-600",
  prospect: "bg-cyan-400/15 text-cyan-600",
};

export default function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingScore, setEditingScore] = useState(false);
  const [newScore, setNewScore] = useState(0);

  const { data: fournisseur, isLoading } = useQuery({
    queryKey: ["fournisseurs", id],
    queryFn: () => getFournisseur(id),
    enabled: !!id,
  });
  const { data: commandes } = useQuery({
    queryKey: ["fournisseurs", id, "commandes"],
    queryFn: () => getCommandesFournisseur(id),
    enabled: !!id,
  });
  const { data: factures } = useQuery({
    queryKey: ["fournisseurs", id, "factures"],
    queryFn: () => getFacturesFournisseur(id),
    enabled: !!id,
  });

  const noter = useMutation({
    mutationFn: noterFournisseur,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fournisseurs", id] });
      toast.success("Score mis à jour");
      setEditingScore(false);
    },
    onError: () => toast.error("Erreur"),
  });

  if (isLoading || !fournisseur) {
    return (
      <div className="p-8 text-center text-sm text-ink-500">
        Chargement...
      </div>
    );
  }

  const fmt = (v) =>
    Number(v || 0).toLocaleString("fr-FR", { minimumFractionDigits: 3 });

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => navigate("/fournisseurs")}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft size={16} />
        Retour aux fournisseurs
      </button>

      <PageHeader
        title={fournisseur.raison_sociale}
        subtitle={fournisseur.code}
        action={
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                STATUT_STYLES[fournisseur.statut] || "bg-ink-100 text-ink-700"
              }`}
            >
              {fournisseur.statut}
            </span>
            <button
              onClick={() => navigate(`/fournisseurs/${id}/edit`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
            >
              <Pencil size={14} />
              Modifier
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">
            Nombre de commandes
          </p>
          <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
            {fournisseur.nombre_commandes}
          </p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">
            Montant total achats
          </p>
          <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
            {fmt(fournisseur.montant_total_achats)}
          </p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-ink-500">Score qualité</p>
            {!editingScore && (
              <button
                onClick={() => {
                  setNewScore(fournisseur.score_qualite);
                  setEditingScore(true);
                }}
                className="text-xs text-brand-600 hover:underline"
              >
                Modifier
              </button>
            )}
          </div>
          {editingScore ? (
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                className="w-20 rounded-lg border border-ink-300 px-2 py-1 text-sm outline-none focus:border-brand-500"
              />
              <button
                onClick={() => noter.mutate({ id, score: Number(newScore) })}
                className="rounded-lg bg-brand-500 px-2 py-1 text-xs font-medium text-white hover:bg-brand-600"
              >
                OK
              </button>
            </div>
          ) : (
            <p className="mt-1 flex items-center gap-1 font-mono-data text-lg font-semibold text-ink-900">
              <Star size={16} className="text-amber-500" />
              {fournisseur.score_qualite}/100
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink-100 bg-white p-4 text-sm">
        <div>
          <p className="text-xs font-medium text-ink-500">Contact</p>
          <p className="text-ink-900">{fournisseur.contact || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Email</p>
          <p className="text-ink-900">{fournisseur.email || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Téléphone</p>
          <p className="text-ink-900">{fournisseur.telephone || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Ville / Pays</p>
          <p className="text-ink-900">
            {fournisseur.ville}, {fournisseur.pays}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">
            Délai de livraison
          </p>
          <p className="text-ink-900">{fournisseur.delai_livraison} jours</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">
            Conditions de paiement
          </p>
          <p className="text-ink-900">
            {fournisseur.conditions_paiement} (
            {fournisseur.delai_paiement_jours} jours)
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        <div className="border-b border-ink-100 px-4 py-3">
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Commandes ({commandes?.length || 0})
          </h3>
        </div>
        {!commandes || commandes.length === 0 ? (
          <div className="p-6 text-center text-sm text-ink-500">
            Aucune commande.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Numéro</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Montant</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/achats/${c.id}`)}
                  className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-100/30"
                >
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {c.numero}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {c.date_commande}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {fmt(c.montant_total)} {c.devise}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{c.statut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        <div className="border-b border-ink-100 px-4 py-3">
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Factures ({factures?.length || 0})
          </h3>
        </div>
        {!factures || factures.length === 0 ? (
          <div className="p-6 text-center text-sm text-ink-500">
            Aucune facture.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
                <th className="px-4 py-3 font-medium">Numéro</th>
                <th className="px-4 py-3 font-medium">Échéance</th>
                <th className="px-4 py-3 font-medium text-right">
                  Solde restant
                </th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {factures.map((f) => (
                <tr key={f.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {f.numero}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {f.date_echeance}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data">
                    {fmt(f.solde_restant)}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{f.statut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}