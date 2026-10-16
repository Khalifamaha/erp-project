import client from "./client";

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

export const getStatutsConge = () => [
  { value: "en_attente", label: "En attente" },
  { value: "approuve", label: "Approuvé" },
  { value: "refuse", label: "Refusé" },
  { value: "annule", label: "Annulé" },
];