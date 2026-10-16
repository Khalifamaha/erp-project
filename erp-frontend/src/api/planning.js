import client from "./client";

/* ── Plannings ────────────────────────────────────────────────────────── */

export const getPlannings = async (params = {}) => {
  const { data } = await client.get("/planning/plannings/", { params });
  return data;
};

export const getPlanning = async (id) => {
  const { data } = await client.get(`/planning/plannings/${id}/`);
  return data;
};

export const createPlanning = async (payload) => {
  const { data } = await client.post("/planning/plannings/", payload);
  return data;
};

export const updatePlanning = async (id, payload) => {
  const { data } = await client.patch(`/planning/plannings/${id}/`, payload);
  return data;
};

export const getGanttData = async (params = {}) => {
  const { data } = await client.get("/planning/plannings/gantt/", { params });
  return data;
};

export const getSemaine = async (date) => {
  const { data } = await client.get("/planning/plannings/semaine/", {
    params: date ? { date } : {},
  });
  return data;
};

export const getConflits = async (params = {}) => {
  const { data } = await client.get("/planning/plannings/conflits/", {
    params,
  });
  return data;
};

export const confirmerPlanning = async (id) => {
  const { data } = await client.post(`/planning/plannings/${id}/confirmer/`);
  return data;
};

export const reporterPlanning = async (id, nouvelle_date) => {
  const { data } = await client.post(`/planning/plannings/${id}/reporter/`, {
    nouvelle_date,
  });
  return data;
};

export const annulerPlanning = async (id) => {
  const { data } = await client.post(`/planning/plannings/${id}/annuler/`);
  return data;
};

export const getChargeMachine = async (params = {}) => {
  const { data } = await client.get("/planning/plannings/charge_machine/", {
    params,
  });
  return data;
};

export const getChargeChaine = async (params = {}) => {
  const { data } = await client.get("/planning/plannings/charge_chaine/", {
    params,
  });
  return data;
};

export const genererAutoPlanning = async (payload) => {
  const { data } = await client.post(
    "/planning/plannings/generer_auto/",
    payload
  );
  return data;
};

export const getStatutsPlanning = () => [
  { value: "brouillon", label: "Brouillon" },
  { value: "confirme", label: "Confirmé" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
  { value: "reporte", label: "Reporté" },
  { value: "annule", label: "Annulé" },
];

export const getShiftsPlanning = () => [
  { value: "matin", label: "Matin (6h-14h)" },
  { value: "aprem", label: "Après-midi (14h-22h)" },
  { value: "nuit", label: "Nuit (22h-6h)" },
  { value: "journee", label: "Journée (8h-17h)" },
];

/* ── Contraintes machines ─────────────────────────────────────────────── */

export const getContraintes = async (params = {}) => {
  const { data } = await client.get("/planning/contraintes/", { params });
  return data;
};

export const createContrainte = async (payload) => {
  const { data } = await client.post("/planning/contraintes/", payload);
  return data;
};

export const getContraintesActives = async () => {
  const { data } = await client.get("/planning/contraintes/actives/");
  return data;
};

export const getTypesContrainte = () => [
  { value: "maintenance", label: "Maintenance programmée" },
  { value: "arret", label: "Arrêt programmé" },
  { value: "formation", label: "Formation opérateur" },
  { value: "panne", label: "Panne (auto)" },
  { value: "conge", label: "Congé / Fermeture" },
  { value: "autre", label: "Autre" },
];