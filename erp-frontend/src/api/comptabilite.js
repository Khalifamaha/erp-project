import client from "./client";

/* ── Exercices comptables ─────────────────────────────────────────────── */

export const getExercices = async (params = {}) => {
  const { data } = await client.get("/comptabilite/exercices/", { params });
  return data;
};

export const createExercice = async (payload) => {
  const { data } = await client.post("/comptabilite/exercices/", payload);
  return data;
};

export const cloturerExercice = async (id) => {
  const { data } = await client.post(
    `/comptabilite/exercices/${id}/cloturer/`
  );
  return data;
};

export const initPlanExercice = async (id) => {
  const { data } = await client.post(
    `/comptabilite/exercices/${id}/init_plan/`
  );
  return data;
};

export const getBilanExercice = async (id) => {
  const { data } = await client.get(`/comptabilite/exercices/${id}/bilan/`);
  return data;
};

export const getResultatExercice = async (id) => {
  const { data } = await client.get(
    `/comptabilite/exercices/${id}/resultat/`
  );
  return data;
};

/* ── Plan comptable ───────────────────────────────────────────────────── */

export const getComptes = async (params = {}) => {
  const { data } = await client.get("/comptabilite/comptes/", { params });
  return data;
};

export const createCompte = async (payload) => {
  const { data } = await client.post("/comptabilite/comptes/", payload);
  return data;
};

export const getTypesCompte = () => [
  { value: "actif", label: "Actif" },
  { value: "passif", label: "Passif" },
  { value: "charge", label: "Charge" },
  { value: "produit", label: "Produit" },
  { value: "bilan", label: "Bilan" },
];

export const getClassesCompte = () => [
  { value: "1", label: "Classe 1 - Capitaux propres" },
  { value: "2", label: "Classe 2 - Actifs fixes" },
  { value: "3", label: "Classe 3 - Stocks" },
  { value: "4", label: "Classe 4 - Tiers" },
  { value: "5", label: "Classe 5 - Trésorerie" },
  { value: "6", label: "Classe 6 - Charges" },
  { value: "7", label: "Classe 7 - Produits" },
];

/* ── Écritures comptables ─────────────────────────────────────────────── */

export const getEcritures = async (params = {}) => {
  const { data } = await client.get("/comptabilite/ecritures/", { params });
  return data;
};

export const createEcriture = async (payload) => {
  const { data } = await client.post("/comptabilite/ecritures/", payload);
  return data;
};

export const validerEcriture = async (id) => {
  const { data } = await client.post(
    `/comptabilite/ecritures/${id}/valider/`
  );
  return data;
};

export const getGrandLivre = async (compte_id, params = {}) => {
  const { data } = await client.get("/comptabilite/ecritures/grand_livre/", {
    params: { compte_id, ...params },
  });
  return data;
};

export const getBalance = async (exercice_id) => {
  const { data } = await client.get("/comptabilite/ecritures/balance/", {
    params: { exercice_id },
  });
  return data;
};

export const getJournalType = async (journal, params = {}) => {
  const { data } = await client.get("/comptabilite/ecritures/journal/", {
    params: { journal, ...params },
  });
  return data;
};

export const getJournaux = () => [
  { value: "achats", label: "Journal des achats" },
  { value: "ventes", label: "Journal des ventes" },
  { value: "banque", label: "Journal de banque" },
  { value: "caisse", label: "Journal de caisse" },
  { value: "od", label: "Opérations diverses" },
  { value: "salaires", label: "Journal des salaires" },
  { value: "stock", label: "Journal des stocks" },
];

/* ── Factures (vente) ─────────────────────────────────────────────────── */

export const getFacturesVente = async (params = {}) => {
  const { data } = await client.get("/comptabilite/factures/", { params });
  return data;
};

export const createFactureVente = async (payload) => {
  const { data } = await client.post("/comptabilite/factures/", payload);
  return data;
};

export const emettreFacture = async (id) => {
  const { data } = await client.post(`/comptabilite/factures/${id}/emettre/`);
  return data;
};

export const payerFactureVente = async (id, payload) => {
  const { data } = await client.post(
    `/comptabilite/factures/${id}/payer/`,
    payload
  );
  return data;
};

export const getFacturesVenteEnRetard = async () => {
  const { data } = await client.get("/comptabilite/factures/en_retard/");
  return data;
};

export const getFacturesAEncaisser = async () => {
  const { data } = await client.get("/comptabilite/factures/a_encaisser/");
  return data;
};

export const getFacturesVenteStats = async () => {
  const { data } = await client.get("/comptabilite/factures/stats/");
  return data;
};

export const getStatutsFactureVente = () => [
  { value: "brouillon", label: "Brouillon" },
  { value: "emise", label: "Émise" },
  { value: "payee", label: "Payée" },
  { value: "partiellement_payee", label: "Partiellement payée" },
  { value: "en_retard", label: "En retard" },
  { value: "annulee", label: "Annulée" },
];