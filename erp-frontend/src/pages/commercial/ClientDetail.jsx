import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { useClient } from "../../hooks/useClients";
import { useCommandes } from "../../hooks/useCommandes";
import PageHeader from "../../components/common/PageHeader";
import StatutBadge from "../../components/ui/StatutBadge";

const TYPE_LABELS = {
  entreprise: "Entreprise",
  particulier: "Particulier",
  export: "Client export",
};

const STATUT_STYLES = {
  actif: "bg-emerald-400/15 text-emerald-600",
  inactif: "bg-ink-100 text-ink-700",
  prospect: "bg-cyan-400/15 text-cyan-600",
  bloque: "bg-rose-400/15 text-rose-600",
};

const STATUT_LABELS = {
  actif: "Actif",
  inactif: "Inactif",
  prospect: "Prospect",
  bloque: "Bloqué",
};

const CONDITIONS_LABELS = {
  comptant: "Paiement comptant",
  "30j": "30 jours",
  "60j": "60 jours",
  "90j": "90 jours",
};

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: client, isLoading, isError, error } = useClient(id);
  const { data: commandesData } = useCommandes({ client: id });
  const commandes = commandesData?.results ?? commandesData ?? [];

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
        Erreur : {error?.message || "impossible de charger le client"}
      </div>
    );
  }

  const fmtMoney = (v) =>
    Number(v).toLocaleString("fr-FR", { minimumFractionDigits: 3 });

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => navigate("/clients")}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft size={16} />
        Retour aux clients
      </button>

      <PageHeader
        title={client.raison_sociale}
        subtitle={`${client.code} · ${TYPE_LABELS[client.type] || client.type}`}
        action={
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                STATUT_STYLES[client.statut] || "bg-ink-100 text-ink-700"
              }`}
            >
              {STATUT_LABELS[client.statut] || client.statut}
            </span>
            <button
              onClick={() => navigate(`/clients/${id}/edit`)}
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
          <p className="text-xs font-medium text-ink-500">Limite de crédit</p>
          <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
            {fmtMoney(client.limite_credit)} {client.devise}
          </p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">Encours client</p>
          <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
            {fmtMoney(client.encours_client)} {client.devise}
          </p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">Crédit disponible</p>
          <p
            className={`mt-1 font-mono-data text-lg font-semibold ${
              client.credit_disponible <= 0 ? "text-rose-500" : "text-ink-900"
            }`}
          >
            {fmtMoney(client.credit_disponible)} {client.devise}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink-100 bg-white p-4 text-sm">
        <div>
          <p className="text-xs font-medium text-ink-500">Contact principal</p>
          <p className="text-ink-900">{client.contact_principal || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Score crédit</p>
          <p className="text-ink-900">{client.score_credit} / 100</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Email</p>
          <p className="text-ink-900">{client.email || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Téléphone</p>
          <p className="text-ink-900">{client.telephone || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Ville / Pays</p>
          <p className="text-ink-900">
            {client.ville || "—"}, {client.pays}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">N° fiscal</p>
          <p className="text-ink-900">{client.num_fiscal || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">
            Conditions de paiement
          </p>
          <p className="text-ink-900">
            {CONDITIONS_LABELS[client.conditions_paiement] ||
              client.conditions_paiement}{" "}
            ({client.delai_paiement_jours} jours)
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Client depuis</p>
          <p className="text-ink-900">
            {new Date(client.date_creation).toLocaleDateString("fr-FR")}
          </p>
        </div>
        {client.adresse && (
          <div className="col-span-2">
            <p className="text-xs font-medium text-ink-500">Adresse</p>
            <p className="text-ink-900">{client.adresse}</p>
          </div>
        )}
        {client.notes && (
          <div className="col-span-2">
            <p className="text-xs font-medium text-ink-500">Notes</p>
            <p className="text-ink-900">{client.notes}</p>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        <div className="border-b border-ink-100 px-4 py-3">
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Commandes ({commandes.length})
          </h3>
        </div>
        {commandes.length === 0 ? (
          <div className="p-6 text-center text-sm text-ink-500">
            Aucune commande pour ce client.
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
                  className="border-b border-ink-100 last:border-0 hover:bg-ink-100/30 cursor-pointer"
                  onClick={() => navigate(`/commandes/${c.id}`)}
                >
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-900">
                    {c.numero}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {c.date_livraison_confirmee || "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data text-ink-900">
                    {fmtMoney(c.montant_total)} {c.devise || client.devise}
                  </td>
                  <td className="px-4 py-3">
                    <StatutBadge statut={c.statut} />
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