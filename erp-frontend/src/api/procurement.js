import client from "./client";

/* ── Fournisseurs ─────────────────────────────────────────────────────── */

export const getFournisseurs = async (params = {}) => {
  const { data } = await client.get("/procurement/fournisseurs/", { params });
  return data;
};

export const getFournisseur = async (id) => {
  const { data } = await client.get(`/procurement/fournisseurs/${id}/`);
  return data;
};

export const createFournisseur = async (payload) => {
  const { data } = await client.post("/procurement/fournisseurs/", payload);
  return data;
};

export const updateFournisseur = async (id, payload) => {
  const { data } = await client.patch(
    `/procurement/fournisseurs/${id}/`,
    payload
  );
  return data;
};

export const deleteFournisseur = async (id) => {
  await client.delete(`/procurement/fournisseurs/${id}/`);
};

export const getFournisseurCommandes = async (id) => {
  const { data } = await client.get(
    `/procurement/fournisseurs/${id}/commandes/`
  );
  return data;
};

export const getFournisseurFactures = async (id) => {
  const { data } = await client.get(
    `/procurement/fournisseurs/${id}/factures/`
  );
  return data;
};

export const noterFournisseur = async (id, score_qualite) => {
  const { data } = await client.post(
    `/procurement/fournisseurs/${id}/noter/`,
    { score_qualite }
  );
  return data;
};

export const getFournisseursStats = async () => {
  const { data } = await client.get("/procurement/fournisseurs/stats/");
  return data;
};

export const getStatutsFournisseur = () => [
  { value: "actif", label: "Actif" },
  { value: "inactif", label: "Inactif" },
  { value: "blacklist", label: "Liste noire" },
  { value: "prospect", label: "Prospect" },
];

export const getCategoriesFournisseur = () => [
  { value: "matiere_premiere", label: "Matière première" },
  { value: "piece_rechange", label: "Pièce de rechange" },
  { value: "consommable", label: "Consommable" },
  { value: "service", label: "Prestataire service" },
  { value: "transport", label: "Transport logistique" },
  { value: "autre", label: "Autre" },
];

export const getConditionsPaiementFournisseur = () => [
  { value: "comptant", label: "Paiement comptant" },
  { value: "30j", label: "30 jours" },
  { value: "60j", label: "60 jours" },
  { value: "90j", label: "90 jours" },
  { value: "avance", label: "Paiement à l'avance" },
];

/* ── Commandes achat ──────────────────────────────────────────────────── */

export const getCommandesAchat = async (params = {}) => {
  const { data } = await client.get("/procurement/commandes/", { params });
  return data;
};

export const getCommandeAchat = async (id) => {
  const { data } = await client.get(`/procurement/commandes/${id}/`);
  return data;
};

export const createCommandeAchat = async (payload) => {
  const { data } = await client.post("/procurement/commandes/", payload);
  return data;
};

export const soumettreCommandeAchat = async (id) => {
  const { data } = await client.post(
    `/procurement/commandes/${id}/soumettre/`
  );
  return data;
};

export const confirmerCommandeAchat = async (id) => {
  const { data } = await client.post(
    `/procurement/commandes/${id}/confirmer/`
  );
  return data;
};

export const annulerCommandeAchat = async (id) => {
  const { data } = await client.post(`/procurement/commandes/${id}/annuler/`);
  return data;
};

export const getCommandeAchatReceptions = async (id) => {
  const { data } = await client.get(
    `/procurement/commandes/${id}/receptions/`
  );
  return data;
};

export const getCommandesAchatEnAttente = async () => {
  const { data } = await client.get("/procurement/commandes/en_attente/");
  return data;
};

export const getStatutsCommandeAchat = () => [
  { value: "brouillon", label: "Brouillon" },
  { value: "soumise", label: "Soumise au fournisseur" },
  { value: "confirmee", label: "Confirmée par fournisseur" },
  { value: "partielle", label: "Livraison partielle" },
  { value: "livree", label: "Livrée complètement" },
  { value: "annulee", label: "Annulée" },
];

export const getDevises = () => [
  { value: "TND", label: "Dinar tunisien" },
  { value: "EUR", label: "Euro" },
  { value: "USD", label: "Dollar US" },
];

/* ── Réceptions ───────────────────────────────────────────────────────── */

export const getReceptions = async (params = {}) => {
  const { data } = await client.get("/procurement/receptions/", { params });
  return data;
};

export const getReception = async (id) => {
  const { data } = await client.get(`/procurement/receptions/${id}/`);
  return data;
};

export const createReception = async (payload) => {
  const { data } = await client.post("/procurement/receptions/", payload);
  return data;
};

export const validerReception = async (id) => {
  const { data } = await client.post(`/procurement/receptions/${id}/valider/`);
  return data;
};

export const getStatutsReception = () => [
  { value: "en_cours", label: "En cours de contrôle" },
  { value: "acceptee", label: "Acceptée en stock" },
  { value: "refusee", label: "Refusée — retour fournisseur" },
  { value: "partielle", label: "Acceptée partiellement" },
];

/* ── Factures achat ───────────────────────────────────────────────────── */

export const getFacturesAchat = async (params = {}) => {
  const { data } = await client.get("/procurement/factures/", { params });
  return data;
};

export const createFactureAchat = async (payload) => {
  const { data } = await client.post("/procurement/factures/", payload);
  return data;
};

export const payerFactureAchat = async (id, payload) => {
  const { data } = await client.post(
    `/procurement/factures/${id}/payer/`,
    payload
  );
  return data;
};

export const getFacturesEnRetard = async () => {
  const { data } = await client.get("/procurement/factures/en_retard/");
  return data;
};

export const getFacturesAPayer = async () => {
  const { data } = await client.get("/procurement/factures/a_payer/");
  return data;
};

export const getFacturesAchatStats = async () => {
  const { data } = await client.get("/procurement/factures/stats/");
  return data;
};

export const getStatutsFactureAchat = () => [
  { value: "recue", label: "Reçue" },
  { value: "verifiee", label: "Vérifiée" },
  { value: "approuvee", label: "Approuvée" },
  { value: "payee", label: "Payée" },
  { value: "partiellement_payee", label: "Partiellement payée" },
  { value: "contestee", label: "Contestée" },
  { value: "annulee", label: "Annulée" },
];

export const getModesPaiementFacture = () => [
  { value: "virement", label: "Virement bancaire" },
  { value: "cheque", label: "Chèque" },
  { value: "especes", label: "Espèces" },
  { value: "traite", label: "Traite" },
  { value: "lc", label: "Lettre de crédit" },
];