import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFournisseurs,
  getFournisseur,
  createFournisseur,
  updateFournisseur,
  deleteFournisseur,
  getFournisseurCommandes,
  getFournisseurFactures,
  noterFournisseur,
  getFournisseursStats,
} from "../api/procurement";

export const useFournisseurs = (params = {}) => {
  return useQuery({
    queryKey: ["fournisseurs", params],
    queryFn: () => getFournisseurs(params),
    keepPreviousData: true,
  });
};

export const useFournisseur = (id) => {
  return useQuery({
    queryKey: ["fournisseurs", id],
    queryFn: () => getFournisseur(id),
    enabled: !!id,
  });
};

export const useFournisseurCommandes = (id) => {
  return useQuery({
    queryKey: ["fournisseurs", id, "commandes"],
    queryFn: () => getFournisseurCommandes(id),
    enabled: !!id,
  });
};

export const useFournisseurFactures = (id) => {
  return useQuery({
    queryKey: ["fournisseurs", id, "factures"],
    queryFn: () => getFournisseurFactures(id),
    enabled: !!id,
  });
};

export const useFournisseursStats = () => {
  return useQuery({
    queryKey: ["fournisseurs", "stats"],
    queryFn: getFournisseursStats,
  });
};

export const useCreateFournisseur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFournisseur,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fournisseurs"] }),
  });
};

export const useUpdateFournisseur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateFournisseur(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["fournisseurs"] });
      queryClient.invalidateQueries({ queryKey: ["fournisseurs", id] });
    },
  });
};

export const useDeleteFournisseur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFournisseur,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fournisseurs"] }),
  });
};

export const useNoterFournisseur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, score_qualite }) =>
      noterFournisseur(id, score_qualite),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["fournisseurs"] });
      queryClient.invalidateQueries({ queryKey: ["fournisseurs", id] });
    },
  });
};