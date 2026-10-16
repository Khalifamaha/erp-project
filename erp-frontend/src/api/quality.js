import client from "./client";

/* ── Critères qualité ─────────────────────────────────────────────────── */

export const getCriteres = async (params = {}) => {
  const { data } = await client.get("/quality/criteres/", { params });
  return data;
};

export const createCritere = async (payload) => {
  const { data } = await client.post("/quality/criteres/", payload);
  return data;
};

export const updateCritere = async (id, payload) => {
  const { data } = await client.patch(`/quality/criteres/${id}/`, payload);
  return data;
};

export const deleteCritere = async (id) => {
  await client.delete(`/quality/criteres/${id}/`);
};

export const getCriteresParProduit = async (produit_id) => {
  const { data } = await client.get("/quality/criteres/par_produit/", {
    params: { produit_id },
  });
  return data;
};

export const getTypesMesure = () => [
  { value: "dimensionnel", label: "Dimensionnel (mm, cm)" },
  { value: "masse", label: "Masse (kg, g)" },
  { value: "visuel", label: "Visuel (conforme/non conforme)" },
  { value: "fonctionnel", label: "Test fonctionnel" },
  { value: "electrique", label: "Mesure électrique (V, A, Ohm)" },
  { value: "pression", label: "Pression (bar, Pa)" },
  { value: "temperature", label: "Température (°C, K)" },
  { value: "durete", label: "Dureté (HRC, HB)" },
  { value: "rugosite", label: "Rugosité (Ra, Rz)" },
  { value: "autre", label: "Autre" },
];

/* ── Contrôles qualité ────────────────────────────────────────────────── */

export const getControles = async (params = {}) => {
  const { data } = await client.get("/quality/controles/", { params });
  return data;
};

export const saisieRapideControle = async (payload) => {
  const { data } = await client.post(
    "/quality/controles/saisie_rapide/",
    payload
  );
  return data;
};

export const getControlesStats = async () => {
  const { data } = await client.get("/quality/controles/stats/");
  return data;
};

export const getControlesNonConformes = async () => {
  const { data } = await client.get("/quality/controles/non_conformes/");
  return data;
};

export const getControlesParOF = async (of_id) => {
  const { data } = await client.get("/quality/controles/par_of/", {
    params: { of_id },
  });
  return data;
};

export const getResultatsControle = () => [
  { value: "conforme", label: "Conforme" },
  { value: "non_conforme", label: "Non conforme" },
  { value: "a_verifier", label: "À revérifier" },
  { value: "accepte_derog", label: "Accepté en dérogation" },
];

/* ── Fiches de non-conformité (NC) ────────────────────────────────────── */

export const getFichesNC = async (params = {}) => {
  const { data } = await client.get("/quality/fiches-nc/", { params });
  return data;
};

export const getFicheNC = async (id) => {
  const { data } = await client.get(`/quality/fiches-nc/${id}/`);
  return data;
};

export const createFicheNC = async (payload) => {
  const { data } = await client.post("/quality/fiches-nc/", payload);
  return data;
};

export const cloturerFicheNC = async (id, payload) => {
  const { data } = await client.post(
    `/quality/fiches-nc/${id}/cloturer/`,
    payload
  );
  return data;
};

export const ajouterActionNC = async (id, payload) => {
  const { data } = await client.post(
    `/quality/fiches-nc/${id}/ajouter_action/`,
    payload
  );
  return data;
};

export const validerActionNC = async (ficheId, payload) => {
  const { data } = await client.post(
    `/quality/fiches-nc/${ficheId}/valider_action/`,
    payload
  );
  return data;
};

export const getFichesNCOuvertes = async () => {
  const { data } = await client.get("/quality/fiches-nc/ouvertes/");
  return data;
};

export const getFichesNCEnRetard = async () => {
  const { data } = await client.get("/quality/fiches-nc/en_retard/");
  return data;
};

export const getFichesNCStats = async () => {
  const { data } = await client.get("/quality/fiches-nc/stats/");
  return data;
};

export const getGravitesNC = () => [
  { value: "mineure", label: "Mineure" },
  { value: "moyenne", label: "Moyenne" },
  { value: "haute", label: "Haute" },
  { value: "critique", label: "Critique — arrêt production" },
];

export const getTypesNC = () => [
  { value: "produit", label: "Non-conformité produit" },
  { value: "processus", label: "Non-conformité processus" },
  { value: "matiere", label: "Non-conformité matière première" },
  { value: "fournisseur", label: "Non-conformité fournisseur" },
  { value: "systeme", label: "Non-conformité système" },
];

export const getStatutsNC = () => [
  { value: "ouverte", label: "Ouverte" },
  { value: "en_cours", label: "En cours de traitement" },
  { value: "en_attente", label: "En attente validation" },
  { value: "cloturee", label: "Clôturée" },
  { value: "annulee", label: "Annulée" },
];

export const getTypesActionNC = () => [
  { value: "immediate", label: "Action immédiate" },
  { value: "corrective", label: "Action corrective" },
  { value: "preventive", label: "Action préventive" },
  { value: "verification", label: "Vérification efficacité" },
];

export const getStatutsActionNC = () => [
  { value: "planifiee", label: "Planifiée" },
  { value: "en_cours", label: "En cours" },
  { value: "realisee", label: "Réalisée" },
  { value: "verifiee", label: "Vérifiée efficace" },
  { value: "abandonnee", label: "Abandonnée" },
];