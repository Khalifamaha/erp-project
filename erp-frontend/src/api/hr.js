import client from "./client";

export const getEmployes = async (params = {}) => {
  const { data } = await client.get("/hr/employes/", { params });
  return data;
};

export const getEmploye = async (id) => {
  const { data } = await client.get(`/hr/employes/${id}/`);
  return data;
};

export const createEmploye = async (payload) => {
  const { data } = await client.post("/hr/employes/", payload);
  return data;
};

export const updateEmploye = async (id, payload) => {
  const { data } = await client.patch(`/hr/employes/${id}/`, payload);
  return data;
};

export const deleteEmploye = async (id) => {
  await client.delete(`/hr/employes/${id}/`);
};

export const getDepartements = () => [
  { value: "production", label: "Production" },
  { value: "qualite", label: "Qualité" },
  { value: "maintenance", label: "Maintenance" },
  { value: "rh", label: "Ressources humaines" },
  { value: "comptabilite", label: "Comptabilité" },
  { value: "logistique", label: "Logistique" },
  { value: "commercial", label: "Commercial" },
  { value: "direction", label: "Direction" },
  { value: "informatique", label: "Informatique" },
  { value: "achats", label: "Achats" },
];

export const getTypesContrat = () => [
  { value: "cdi", label: "CDI" },
  { value: "cdd", label: "CDD" },
  { value: "stage", label: "Stage" },
  { value: "interim", label: "Intérim" },
  { value: "apprentissage", label: "Apprentissage" },
];

export const getStatutsEmploye = () => [
  { value: "actif", label: "Actif" },
  { value: "suspendu", label: "Suspendu" },
  { value: "conge", label: "En congé" },
  { value: "demissionnaire", label: "Démissionnaire" },
  { value: "licencie", label: "Licencié" },
];

/* ── Pointages ────────────────────────────────────────────────────────── */

export const getPointages = async (params = {}) => {
  const { data } = await client.get("/hr/pointages/", { params });
  return data;
};

export const getPointagesDuJour = async () => {
  const { data } = await client.get("/hr/pointages/du_jour/");
  return data;
};

export const badgerEntree = async (payload) => {
  const { data } = await client.post("/hr/pointages/entree/", payload);
  return data;
};

export const badgerSortie = async (pointageId) => {
  const { data } = await client.post("/hr/pointages/sortie/", {
    pointage_id: pointageId,
  });
  return data;
};

export const validerPointage = async (id) => {
  const { data } = await client.post(`/hr/pointages/${id}/valider/`);
  return data;
};

export const getTypesPointage = () => [
  { value: "normal", label: "Normal" },
  { value: "heures_sup", label: "Heures supplémentaires" },
  { value: "nuit", label: "Travail de nuit" },
  { value: "weekend", label: "Week-end" },
  { value: "ferie", label: "Jour férié" },
];

/* ── Congés ───────────────────────────────────────────────────────────── */

export const getConges = async (params = {}) => {
  const { data } = await client.get("/hr/conges/", { params });
  return data;
};

export const getCongesEnAttente = async () => {
  const { data } = await client.get("/hr/conges/en_attente/");
  return data;
};

export const createConge = async (payload) => {
  const { data } = await client.post("/hr/conges/", payload);
  return data;
};

export const decisionConge = async (id, decision, commentaire_rh = "") => {
  const { data } = await client.post(`/hr/conges/${id}/decision/`, {
    decision,
    commentaire_rh,
  });
  return data;
};

export const annulerConge = async (id) => {
  const { data } = await client.post(`/hr/conges/${id}/annuler/`);
  return data;
};

export const getTypesConge = () => [
  { value: "annuel", label: "Congé annuel" },
  { value: "maladie", label: "Congé maladie" },
  { value: "maternite", label: "Congé maternité" },
  { value: "paternite", label: "Congé paternité" },
  { value: "sans_solde", label: "Sans solde" },
  { value: "exceptionnel", label: "Exceptionnel" },
  { value: "recuperation", label: "Récupération" },
];

/* ── Paiements ────────────────────────────────────────────────────────── */

export const getPaiements = async (params = {}) => {
  const { data } = await client.get("/hr/paiements/", { params });
  return data;
};

export const getPaiement = async (id) => {
  const { data } = await client.get(`/hr/paiements/${id}/`);
  return data;
};

export const createPaiement = async (payload) => {
  const { data } = await client.post("/hr/paiements/", payload);
  return data;
};

export const genererBulkPaiements = async (payload) => {
  const { data } = await client.post("/hr/paiements/generer_bulk/", payload);
  return data;
};

export const validerPaiement = async (id) => {
  const { data } = await client.post(`/hr/paiements/${id}/valider/`);
  return data;
};

export const marquerPayePaiement = async (id, reference_virement = "") => {
  const { data } = await client.post(`/hr/paiements/${id}/marquer_paye/`, {
    reference_virement,
  });
  return data;
};

export const getResumeMensuel = async (periode_debut) => {
  const { data } = await client.get("/hr/paiements/resume_mensuel/", {
    params: periode_debut ? { periode_debut } : {},
  });
  return data;
};

export const getStatutsPaiement = () => [
  { value: "brouillon", label: "Brouillon" },
  { value: "calcule", label: "Calculé" },
  { value: "valide", label: "Validé" },
  { value: "paye", label: "Payé" },
  { value: "annule", label: "Annulé" },
];

export const getModesPaiement = () => [
  { value: "virement", label: "Virement bancaire" },
  { value: "especes", label: "Espèces" },
  { value: "cheque", label: "Chèque" },
];