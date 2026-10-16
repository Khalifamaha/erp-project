import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCommandes,
  getCommande,
  createCommande,
  updateCommande,
  deleteCommande,
} from "../api/commercial";

export const useCommandes = (params = {}) => {
  return useQuery({
    queryKey: ["commandes", params],
    queryFn: () => getCommandes(params),
    keepPreviousData: true,
  });
};

export const useCommande = (id) => {
  return useQuery({
    queryKey: ["commandes", id],
    queryFn: () => getCommande(id),
    enabled: !!id,
  });
};

export const useCreateCommande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCommande,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes"] });
    },
  });
};

export const useUpdateCommande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateCommande(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["commandes"] });
      queryClient.invalidateQueries({ queryKey: ["commandes", id] });
    },
  });
};

export const useDeleteCommande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCommande,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes"] });
    },
  });
};