import client from "./client";

/* ── Produits ─────────────────────────────────────────────────────────── */

export const getProduits = async (params = {}) => {
  const { data } = await client.get("/inventory/produits/", { params });
  return data;
};

export const getProduit = async (id) => {
  const { data } = await client.get(`/inventory/produits/${id}/`);
  return data;
};

export const createProduit = async (payload) => {
  const { data } = await client.post("/inventory/produits/", payload);
  return data;
};

export const updateProduit = async (id, payload) => {
  const { data } = await client.patch(`/inventory/produits/${id}/`, payload);
  return data;
};

export const deleteProduit = async (id) => {
  await client.delete(`/inventory/produits/${id}/`);
};

export const getProduitsSousSeuil = async () => {
  const { data } = await client.get("/inventory/produits/sous_seuil/");
  return data;
};

export const getProduitsRupture = async () => {
  const { data } = await client.get("/inventory/produits/rupture/");
  return data;
};

export const getProduitsStats = async () => {
  const { data } = await client.get("/inventory/produits/stats/");
  return data;
};

export const getProduitLots = async (id) => {
  const { data } = await client.get(`/inventory/produits/${id}/lots/`);
  return data;
};

export const getProduitMouvements = async (id) => {
  const { data } = await client.get(`/inventory/produits/${id}/mouvements/`);
  return data;
};

export const getTypesProduit = () => [
  { value: "matiere_premiere", label: "Matière première" },
  { value: "produit_fini", label: "Produit fini" },
  { value: "semi_fini", label: "Semi-fini" },
  { value: "consommable", label: "Consommable" },
  { value: "piece_rechange", label: "Pièce de rechange" },
  { value: "emballage", label: "Emballage" },
];

export const getUnitesMesure = () => [
  { value: "kg", label: "Kilogramme" },
  { value: "g", label: "Gramme" },
  { value: "t", label: "Tonne" },
  { value: "m", label: "Mètre" },
  { value: "m2", label: "Mètre carré" },
  { value: "m3", label: "Mètre cube" },
  { value: "l", label: "Litre" },
  { value: "piece", label: "Pièce" },
  { value: "boite", label: "Boîte" },
  { value: "palette", label: "Palette" },
  { value: "rouleau", label: "Rouleau" },
];

/* ── Catégories ───────────────────────────────────────────────────────── */

export const getCategories = async (params = {}) => {
  const { data } = await client.get("/inventory/categories/", { params });
  return data;
};

export const createCategorie = async (payload) => {
  const { data } = await client.post("/inventory/categories/", payload);
  return data;
};

export const updateCategorie = async (id, payload) => {
  const { data } = await client.patch(
    `/inventory/categories/${id}/`,
    payload
  );
  return data;
};

export const deleteCategorie = async (id) => {
  await client.delete(`/inventory/categories/${id}/`);
};

/* ── Emplacements ─────────────────────────────────────────────────────── */

export const getEmplacements = async (params = {}) => {
  const { data } = await client.get("/inventory/emplacements/", { params });
  return data;
};

export const getTypesEmplacement = () => [
  { value: "entrepot", label: "Entrepôt principal" },
  { value: "atelier", label: "Atelier de production" },
  { value: "quai", label: "Quai expédition" },
  { value: "quarantaine", label: "Zone quarantaine" },
  { value: "rebut", label: "Zone rebut" },
];

/* ── Lots ─────────────────────────────────────────────────────────────── */

export const getLots = async (params = {}) => {
  const { data } = await client.get("/inventory/lots/", { params });
  return data;
};

export const createLot = async (payload) => {
  const { data } = await client.post("/inventory/lots/", payload);
  return data;
};

export const getLotsExpires = async () => {
  const { data } = await client.get("/inventory/lots/expires/");
  return data;
};

export const getLotsAExpirer = async () => {
  const { data } = await client.get("/inventory/lots/a_expirer/");
  return data;
};

export const bloquerLot = async (id) => {
  const { data } = await client.post(`/inventory/lots/${id}/bloquer/`);
  return data;
};

export const libererLot = async (id) => {
  const { data } = await client.post(`/inventory/lots/${id}/liberer/`);
  return data;
};

export const getTracabiliteLot = async (id) => {
  const { data } = await client.get(`/inventory/lots/${id}/tracabilite/`);
  return data;
};

export const getStatutsLot = () => [
  { value: "disponible", label: "Disponible" },
  { value: "quarantaine", label: "En quarantaine" },
  { value: "bloque", label: "Bloqué" },
  { value: "epuise", label: "Épuisé" },
  { value: "expire", label: "Expiré" },
  { value: "rebut", label: "Rebut" },
];

export const getOriginesLot = () => [
  { value: "achat", label: "Achat fournisseur" },
  { value: "production", label: "Production interne" },
  { value: "retour", label: "Retour client" },
  { value: "transfert", label: "Transfert inter-site" },
];

/* ── Mouvements de stock ──────────────────────────────────────────────── */

export const getMouvements = async (params = {}) => {
  const { data } = await client.get("/inventory/mouvements/", { params });
  return data;
};

export const enregistrerEntree = async (payload) => {
  const { data } = await client.post("/inventory/mouvements/entree/", payload);
  return data;
};

export const enregistrerSortie = async (payload) => {
  const { data } = await client.post("/inventory/mouvements/sortie/", payload);
  return data;
};

export const enregistrerAjustement = async (payload) => {
  const { data } = await client.post(
    "/inventory/mouvements/ajustement/",
    payload
  );
  return data;
};

export const getResumeJourMouvements = async () => {
  const { data } = await client.get("/inventory/mouvements/resume_jour/");
  return data;
};

export const getTypesMouvementEntree = () => [
  { value: "entree_achat", label: "Entrée achat fournisseur" },
  { value: "entree_production", label: "Entrée depuis production" },
  { value: "entree_retour", label: "Retour client" },
];

export const getTypesMouvementSortie = () => [
  { value: "sortie_production", label: "Consommation production" },
  { value: "sortie_expedition", label: "Expédition client" },
  { value: "sortie_rebut", label: "Mise au rebut" },
];