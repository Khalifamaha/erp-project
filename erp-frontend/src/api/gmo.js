import client from "./client";

/* ── Maintenances préventives ─────────────────────────────────────────── */

export const getMaintenances = async (params = {}) => {
  const { data } = await client.get("/gmo/maintenances/", { params });
  return data;
};

export const createMaintenance = async (payload) => {
  const { data } = await client.post("/gmo/maintenances/", payload);
  return data;
};

export const getMaintenancesAEffectuer = async () => {
  const { data } = await client.get("/gmo/maintenances/a_effectuer/");
  return data;
};

export const getMaintenancesEnRetard = async () => {
  const { data } = await client.get("/gmo/maintenances/en_retard/");
  return data;
};

export const effectuerMaintenance = async (id, payload) => {
  const { data } = await client.post(
    `/gmo/maintenances/${id}/effectuer/`,
    payload
  );
  return data;
};

export const getMaintenancesStats = async () => {
  const { data } = await client.get("/gmo/maintenances/stats/");
  return data;
};

export const getTypesMaintenance = () => [
  { value: "graissage", label: "Graissage / Lubrification" },
  { value: "nettoyage", label: "Nettoyage complet" },
  { value: "inspection", label: "Inspection visuelle" },
  { value: "calibrage", label: "Calibrage / Étalonnage" },
  { value: "remplacement", label: "Remplacement pièce périodique" },
  { value: "revision", label: "Révision générale" },
  { value: "controle", label: "Contrôle électrique / sécurité" },
  { value: "autre", label: "Autre" },
];

/* ── Pannes ───────────────────────────────────────────────────────────── */

export const getPannes = async (params = {}) => {
  const { data } = await client.get("/gmo/pannes/", { params });
  return data;
};

export const getPanne = async (id) => {
  const { data } = await client.get(`/gmo/pannes/${id}/`);
  return data;
};

export const declarerPanne = async (payload) => {
  const { data } = await client.post("/gmo/pannes/declarer/", payload);
  return data;
};

export const getPannesActives = async () => {
  const { data } = await client.get("/gmo/pannes/actives/");
  return data;
};

export const assignerPanne = async (id, technicien_id) => {
  const { data } = await client.post(`/gmo/pannes/${id}/assigner/`, {
    technicien_id,
  });
  return data;
};

export const cloturerPanne = async (id) => {
  const { data } = await client.post(`/gmo/pannes/${id}/cloturer/`);
  return data;
};

export const getPanneInterventions = async (id) => {
  const { data } = await client.get(`/gmo/pannes/${id}/interventions/`);
  return data;
};

export const getPannesStats = async (params = {}) => {
  const { data } = await client.get("/gmo/pannes/stats/", { params });
  return data;
};

export const getTypesPanne = () => [
  { value: "mecanique", label: "Mécanique" },
  { value: "electrique", label: "Électrique" },
  { value: "electronique", label: "Électronique" },
  { value: "pneumatique", label: "Pneumatique" },
  { value: "hydraulique", label: "Hydraulique" },
  { value: "logiciel", label: "Logiciel / Programme" },
  { value: "usure", label: "Usure pièce" },
  { value: "autre", label: "Autre" },
];

export const getGravitesPanne = () => [
  { value: "faible", label: "Faible — production continue" },
  { value: "moyenne", label: "Moyenne — ralentissement" },
  { value: "haute", label: "Haute — arrêt partiel" },
  { value: "critique", label: "Critique — arrêt total" },
];

/* ── Interventions ────────────────────────────────────────────────────── */

export const getInterventions = async (params = {}) => {
  const { data } = await client.get("/gmo/interventions/", { params });
  return data;
};

export const cloturerIntervention = async (id, payload) => {
  const { data } = await client.post(
    `/gmo/interventions/${id}/cloturer/`,
    payload
  );
  return data;
};

export const getMesInterventions = async () => {
  const { data } = await client.get("/gmo/interventions/mes_interventions/");
  return data;
};

export const getResultatsIntervention = () => [
  { value: "resolu", label: "Panne résolue" },
  { value: "partiel", label: "Partiellement résolu" },
  { value: "non_resolu", label: "Non résolu — escalade" },
  { value: "piece_manquante", label: "En attente pièce de rechange" },
];