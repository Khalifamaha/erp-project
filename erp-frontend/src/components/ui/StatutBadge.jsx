const STYLES = {
  brouillon: "bg-ink-100 text-ink-700",
  confirmee: "bg-cyan-400/15 text-cyan-600",
  en_cours: "bg-amber-400/15 text-amber-600",
  partielle: "bg-amber-400/15 text-amber-600",
  livree: "bg-emerald-400/15 text-emerald-600",
  facturee: "bg-emerald-400/15 text-emerald-600",
  annulee: "bg-rose-400/15 text-rose-600",
};

const LABELS = {
  brouillon: "Brouillon",
  confirmee: "Confirmée",
  en_cours: "En cours",
  partielle: "Livraison partielle",
  livree: "Livrée",
  facturee: "Facturée",
  annulee: "Annulée",
};

export default function StatutBadge({ statut }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        STYLES[statut] || "bg-ink-100 text-ink-700"
      }`}
    >
      {LABELS[statut] || statut}
    </span>
  );
}