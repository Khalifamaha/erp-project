import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProduits,
  getProduit,
  createProduit,
  updateProduit,
  deleteProduit,
  getProduitsSousSeuil,
  getProduitsRupture,
  getProduitsStats,
  getProduitLots,
  getProduitMouvements,
} from "../api/inventory";

export const useProduits = (params = {}) => {
  return useQuery({
    queryKey: ["produits", params],
    queryFn: () => getProduits(params),
    keepPreviousData: true,
  });
};

export const useProduit = (id) => {
  return useQuery({
    queryKey: ["produits", id],
    queryFn: () => getProduit(id),
    enabled: !!id,
  });
};

export const useProduitsSousSeuil = () => {
  return useQuery({
    queryKey: ["produits", "sous_seuil"],
    queryFn: getProduitsSousSeuil,
  });
};

export const useProduitsRupture = () => {
  return useQuery({
    queryKey: ["produits", "rupture"],
    queryFn: getProduitsRupture,
  });
};

export const useProduitsStats = () => {
  return useQuery({
    queryKey: ["produits", "stats"],
    queryFn: getProduitsStats,
  });
};

export const useProduitLots = (id) => {
  return useQuery({
    queryKey: ["produits", id, "lots"],
    queryFn: () => getProduitLots(id),
    enabled: !!id,
  });
};

export const useProduitMouvements = (id) => {
  return useQuery({
    queryKey: ["produits", id, "mouvements"],
    queryFn: () => getProduitMouvements(id),
    enabled: !!id,
  });
};

export const useCreateProduit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["produits"] }),
  });
};

export const useUpdateProduit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateProduit(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["produits"] });
      queryClient.invalidateQueries({ queryKey: ["produits", id] });
    },
  });
};

export const useDeleteProduit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["produits"] }),
  });
};