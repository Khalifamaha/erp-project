import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { useEmploye } from "../../hooks/useEmployes";
import { getDepartements, getTypesContrat } from "../../api/hr";
import PageHeader from "../../components/common/PageHeader";

const DEPARTEMENT_LABELS = Object.fromEntries(
  getDepartements().map((d) => [d.value, d.label])
);
const TYPE_CONTRAT_LABELS = Object.fromEntries(
  getTypesContrat().map((t) => [t.value, t.label])
);

const STATUT_STYLES = {
  actif: "bg-emerald-400/15 text-emerald-600",
  suspendu: "bg-amber-400/15 text-amber-600",
  conge: "bg-cyan-400/15 text-cyan-600",
  demissionnaire: "bg-ink-100 text-ink-700",
  licencie: "bg-rose-400/15 text-rose-600",
};

const STATUT_LABELS = {
  actif: "Actif",
  suspendu: "Suspendu",
  conge: "En congé",
  demissionnaire: "Démissionnaire",
  licencie: "Licencié",
};

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: employe, isLoading, isError, error } = useEmploye(id);

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
        Erreur : {error?.message || "impossible de charger l'employé"}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => navigate("/employes")}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft size={16} />
        Retour aux employés
      </button>

      <PageHeader
        title={employe.nom_complet || `${employe.prenom} ${employe.nom}`}
        subtitle={`${employe.matricule} · ${employe.poste}`}
        action={
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                STATUT_STYLES[employe.statut] || "bg-ink-100 text-ink-700"
              }`}
            >
              {STATUT_LABELS[employe.statut] || employe.statut}
            </span>
            <button
              onClick={() => navigate(`/employes/${id}/edit`)}
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
          <p className="text-xs font-medium text-ink-500">Département</p>
          <p className="mt-1 font-medium text-ink-900">
            {DEPARTEMENT_LABELS[employe.departement] || employe.departement}
          </p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">Salaire de base</p>
          <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
            {Number(employe.salaire_base).toLocaleString("fr-FR", {
              minimumFractionDigits: 3,
            })}{" "}
            TND
          </p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-medium text-ink-500">Solde congé</p>
          <p className="mt-1 font-mono-data text-lg font-semibold text-ink-900">
            {employe.solde_conge} jours
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink-100 bg-white p-4 text-sm">
        <div>
          <p className="text-xs font-medium text-ink-500">CIN</p>
          <p className="text-ink-900">{employe.cin}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Type de contrat</p>
          <p className="text-ink-900">
            {TYPE_CONTRAT_LABELS[employe.type_contrat] || employe.type_contrat}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Date d'embauche</p>
          <p className="text-ink-900">{employe.date_embauche}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Fin de contrat</p>
          <p className="text-ink-900">{employe.date_fin_contrat || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Téléphone</p>
          <p className="text-ink-900">{employe.telephone || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">
            Contact d'urgence
          </p>
          <p className="text-ink-900">
            {employe.contact_urgence || "—"}
            {employe.telephone_urgence && ` (${employe.telephone_urgence})`}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">N° CNSS</p>
          <p className="text-ink-900">{employe.num_cnss || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">RIB bancaire</p>
          <p className="text-ink-900">{employe.rib_bancaire || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">
            Niveau de qualification
          </p>
          <p className="text-ink-900">
            {employe.niveau_qualification || "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Employé depuis</p>
          <p className="text-ink-900">
            {new Date(employe.date_creation).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
    </div>
  );
}