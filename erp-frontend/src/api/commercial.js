import client from "./client";

/* ── Clients ──────────────────────────────────────────────────────────── */

export const getClients = async (params = {}) => {
  const { data } = await client.get("/commercial/clients/", { params });
  return data;
};

export const getClient = async (id) => {
  const { data } = await client.get(`/commercial/clients/${id}/`);
  return data;
};

export const createClient = async (payload) => {
  const { data } = await client.post("/commercial/clients/", payload);
  return data;
};

export const updateClient = async (id, payload) => {
  const { data } = await client.patch(`/commercial/clients/${id}/`, payload);
  return data;
};

export const deleteClient = async (id) => {
  await client.delete(`/commercial/clients/${id}/`);
};

/* ── Commandes ────────────────────────────────────────────────────────── */

export const getCommandes = async (params = {}) => {
  const { data } = await client.get("/commercial/commandes/", { params });
  return data;
};

export const getCommande = async (id) => {
  const { data } = await client.get(`/commercial/commandes/${id}/`);
  return data;
};

export const createCommande = async (payload) => {
  const { data } = await client.post("/commercial/commandes/", payload);
  return data;
};

export const getCommandeStatuts = () => [
  { value: "brouillon", label: "Brouillon" },
  { value: "confirmee", label: "Confirmée" },
  { value: "en_cours", label: "En cours de production" },
  { value: "partielle", label: "Livraison partielle" },
  { value: "livree", label: "Livrée complètement" },
  { value: "facturee", label: "Facturée" },
  { value: "annulee", label: "Annulée" },
];

export const getIncoterms = () => [
  { value: "EXW", label: "EXW - Départ usine" },
  { value: "FOB", label: "FOB - Franco à bord" },
  { value: "CIF", label: "CIF - Coût assurance fret" },
  { value: "DDP", label: "DDP - Rendu droits acquittés" },
  { value: "DAP", label: "DAP - Rendu au lieu" },
];

export const updateCommande = async (id, payload) => {
  const { data } = await client.patch(`/commercial/commandes/${id}/`, payload);
  return data;
};

export const deleteCommande = async (id) => {
  await client.delete(`/commercial/commandes/${id}/`);
};

/* ── Camions ──────────────────────────────────────────────────────────── */

export const getCamions = async (params = {}) => {
  const { data } = await client.get("/commercial/camions/", { params });
  return data;
};

export const getCamion = async (id) => {
  const { data } = await client.get(`/commercial/camions/${id}/`);
  return data;
};

export const createCamion = async (payload) => {
  const { data } = await client.post("/commercial/camions/", payload);
  return data;
};

export const updateCamion = async (id, payload) => {
  const { data } = await client.patch(`/commercial/camions/${id}/`, payload);
  return data;
};

export const deleteCamion = async (id) => {
  await client.delete(`/commercial/camions/${id}/`);
};

export const getCamionStatuts = () => [
  { value: "disponible", label: "Disponible" },
  { value: "en_route", label: "En route" },
  { value: "charge", label: "En cours de chargement" },
  { value: "maintenance", label: "En maintenance" },
  { value: "hors_service", label: "Hors service" },
];

/* ── Expéditions ──────────────────────────────────────────────────────── */

export const getExpeditions = async (params = {}) => {
  const { data } = await client.get("/commercial/expeditions/", { params });
  return data;
};

export const getExpedition = async (id) => {
  const { data } = await client.get(`/commercial/expeditions/${id}/`);
  return data;
};

export const createExpedition = async (payload) => {
  const { data } = await client.post("/commercial/expeditions/", payload);
  return data;
};

export const updateExpedition = async (id, payload) => {
  const { data } = await client.patch(`/commercial/expeditions/${id}/`, payload);
  return data;
};

export const deleteExpedition = async (id) => {
  await client.delete(`/commercial/expeditions/${id}/`);
};

export const getExpeditionStatuts = () => [
  { value: "preparee", label: "En préparation" },
  { value: "chargee", label: "Chargée" },
  { value: "en_route", label: "En route" },
  { value: "livree", label: "Livrée" },
  { value: "refusee", label: "Refusée par client" },
  { value: "annulee", label: "Annulée" },
];