import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCommandesAchat,
  getCommandeAchat,
  createCommandeAchat,
  soumettreCommandeAchat,
  confirmerCommandeAchat,
  annulerCommandeAchat,
  getCommandeAchatReceptions,
  getCommandesAchatEnAttente,
} from "../api/procurement";

export const useCommandesAchat = (params = {}) => {
  return useQuery({
    queryKey: ["commandes-achat", params],
    queryFn: () => getCommandesAchat(params),
    keepPreviousData: true,
  });
};

export const useCommandeAchat = (id) => {
  return useQuery({
    queryKey: ["commandes-achat", id],
    queryFn: () => getCommandeAchat(id),
    enabled: !!id,
  });
};

export const useCommandeAchatReceptions = (id) => {
  return useQuery({
    queryKey: ["commandes-achat", id, "receptions"],
    queryFn: () => getCommandeAchatReceptions(id),
    enabled: !!id,
  });
};

export const useCommandesAchatEnAttente = () => {
  return useQuery({
    queryKey: ["commandes-achat", "en_attente"],
    queryFn: getCommandesAchatEnAttente,
  });
};

export const useCreateCommandeAchat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCommandeAchat,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["commandes-achat"] }),
  });
};

const invalidateCommande = (queryClient, id) => {
  queryClient.invalidateQueries({ queryKey: ["commandes-achat"] });
  queryClient.invalidateQueries({ queryKey: ["commandes-achat", id] });
};

export const useSoumettreCommandeAchat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: soumettreCommandeAchat,
    onSuccess: (_, id) => invalidateCommande(queryClient, id),
  });
};

export const useConfirmerCommandeAchat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmerCommandeAchat,
    onSuccess: (_, id) => invalidateCommande(queryClient, id),
  });
};

export const useAnnulerCommandeAchat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: annulerCommandeAchat,
    onSuccess: (_, id) => invalidateCommande(queryClient, id),
  });
};