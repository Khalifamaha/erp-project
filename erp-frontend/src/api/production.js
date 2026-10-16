import client from "./client";

/* ── Machines ─────────────────────────────────────────────────────────── */

export const getMachines = async (params = {}) => {
  const { data } = await client.get("/production/machines/", { params });
  return data;
};

export const getMachine = async (id) => {
  const { data } = await client.get(`/production/machines/${id}/`);
  return data;
};

export const createMachine = async (payload) => {
  const { data } = await client.post("/production/machines/", payload);
  return data;
};

export const updateMachine = async (id, payload) => {
  const { data } = await client.patch(`/production/machines/${id}/`, payload);
  return data;
};

export const changerStatutMachine = async (id, statut) => {
  const { data } = await client.post(
    `/production/machines/${id}/changer_statut/`,
    { statut }
  );
  return data;
};

export const getMachinesStats = async () => {
  const { data } = await client.get("/production/machines/stats/");
  return data;
};

export const getTypesMachine = () => [
  { value: "laser", label: "Découpe laser" },
  { value: "presse", label: "Presse hydraulique" },
  { value: "tour", label: "Tour CNC" },
  { value: "fraiseuse", label: "Fraiseuse CNC" },
  { value: "soudure", label: "Poste de soudure" },
  { value: "pliage", label: "Plieuse" },
  { value: "injection", label: "Presse injection plastique" },
  { value: "assemblage", label: "Poste assemblage" },
  { value: "controle", label: "Poste contrôle qualité" },
  { value: "autre", label: "Autre" },
];

export const getStatutsMachine = () => [
  { value: "disponible", label: "Disponible" },
  { value: "en_marche", label: "En marche" },
  { value: "panne", label: "En panne" },
  { value: "maintenance", label: "En maintenance" },
  { value: "arret", label: "À l'arrêt" },
];

/* ── Gammes opératoires ───────────────────────────────────────────────── */

export const getGammes = async (params = {}) => {
  const { data } = await client.get("/production/gammes/", { params });
  return data;
};

export const getGamme = async (id) => {
  const { data } = await client.get(`/production/gammes/${id}/`);
  return data;
};

export const createGamme = async (payload) => {
  const { data } = await client.post("/production/gammes/", payload);
  return data;
};

export const activerGamme = async (id) => {
  const { data } = await client.post(`/production/gammes/${id}/activer/`);
  return data;
};

export const validerGamme = async (id) => {
  const { data } = await client.post(`/production/gammes/${id}/valider/`);
  return data;
};

export const dupliquerGamme = async (id) => {
  const { data } = await client.post(`/production/gammes/${id}/dupliquer/`);
  return data;
};

export const getChargeGamme = async (id, quantite) => {
  const { data } = await client.get(`/production/gammes/${id}/charge/`, {
    params: { quantite },
  });
  return data;
};

export const getTypesOperation = () => [
  { value: "usinage", label: "Usinage" },
  { value: "decoupe", label: "Découpe" },
  { value: "soudure", label: "Soudure" },
  { value: "assemblage", label: "Assemblage" },
  { value: "pliage", label: "Pliage" },
  { value: "controle", label: "Contrôle qualité" },
  { value: "finition", label: "Finition" },
  { value: "emballage", label: "Emballage" },
  { value: "autre", label: "Autre" },
];

/* ── Ordres de fabrication ────────────────────────────────────────────── */

export const getOrdres = async (params = {}) => {
  const { data } = await client.get("/production/ordres/", { params });
  return data;
};

export const getOrdre = async (id) => {
  const { data } = await client.get(`/production/ordres/${id}/`);
  return data;
};

export const createOrdre = async (payload) => {
  const { data } = await client.post("/production/ordres/", payload);
  return data;
};

export const lancerOrdre = async (id) => {
  const { data } = await client.post(`/production/ordres/${id}/lancer/`);
  return data;
};

export const terminerOrdre = async (id) => {
  const { data } = await client.post(`/production/ordres/${id}/terminer/`);
  return data;
};

export const pauseOrdre = async (id) => {
  const { data } = await client.post(`/production/ordres/${id}/pause/`);
  return data;
};

export const reprendreOrdre = async (id) => {
  const { data } = await client.post(`/production/ordres/${id}/reprendre/`);
  return data;
};

export const annulerOrdre = async (id) => {
  const { data } = await client.post(`/production/ordres/${id}/annuler/`);
  return data;
};

export const majQuantiteOrdre = async (id, payload) => {
  const { data } = await client.post(
    `/production/ordres/${id}/maj_quantite/`,
    payload
  );
  return data;
};

export const getOrdresEnCours = async () => {
  const { data } = await client.get("/production/ordres/en_cours/");
  return data;
};

export const getOrdresStats = async () => {
  const { data } = await client.get("/production/ordres/stats/");
  return data;
};

export const createConsommation = async (payload) => {
  const { data } = await client.post(
    "/production/consommations/",
    payload
  );
  return data;
};

export const getStatutsOrdre = () => [
  { value: "brouillon", label: "Brouillon" },
  { value: "planifie", label: "Planifié" },
  { value: "lance", label: "Lancé" },
  { value: "en_cours", label: "En cours" },
  { value: "pause", label: "En pause" },
  { value: "termine", label: "Terminé" },
  { value: "annule", label: "Annulé" },
];

export const getPriorites = () => [
  { value: 1, label: "Urgente" },
  { value: 2, label: "Haute" },
  { value: 3, label: "Normale" },
  { value: 4, label: "Basse" },
];

/* ── Chaînes de production ────────────────────────────────────────────── */

export const getChaines = async (params = {}) => {
  const { data } = await client.get("/production/chaines/", { params });
  return data;
};

export const getChaine = async (id) => {
  const { data } = await client.get(`/production/chaines/${id}/`);
  return data;
};

export const createChaine = async (payload) => {
  const { data } = await client.post("/production/chaines/", payload);
  return data;
};

export const getChaineDashboard = async () => {
  const { data } = await client.get("/production/chaines/dashboard/");
  return data;
};

export const demarrerSessionChaine = async (id, payload) => {
  const { data } = await client.post(
    `/production/chaines/${id}/demarrer_session/`,
    payload
  );
  return data;
};

export const terminerSessionChaine = async (id, payload = {}) => {
  const { data } = await client.post(
    `/production/chaines/${id}/terminer_session/`,
    payload
  );
  return data;
};

export const incrementerCompteurChaine = async (id, payload) => {
  const { data } = await client.post(
    `/production/chaines/${id}/incrementer/`,
    payload
  );
  return data;
};

export const getStatutsChaine = () => [
  { value: "active", label: "Active" },
  { value: "arret", label: "À l'arrêt" },
  { value: "panne", label: "En panne" },
  { value: "maintenance", label: "En maintenance" },
];

export const getShifts = () => [
  { value: "matin", label: "Matin" },
  { value: "aprem", label: "Après-midi" },
  { value: "nuit", label: "Nuit" },
];