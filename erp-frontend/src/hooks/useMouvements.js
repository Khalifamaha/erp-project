import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMouvements,
  enregistrerEntree,
  enregistrerSortie,
  enregistrerAjustement,
  getResumeJourMouvements,
} from "../api/inventory";

export const useMouvements = (params = {}) => {
  return useQuery({
    queryKey: ["mouvements", params],
    queryFn: () => getMouvements(params),
    keepPreviousData: true,
  });
};

export const useResumeJourMouvements = () => {
  return useQuery({
    queryKey: ["mouvements", "resume_jour"],
    queryFn: getResumeJourMouvements,
  });
};

const invalidateAfterMouvement = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["mouvements"] });
  queryClient.invalidateQueries({ queryKey: ["produits"] });
  queryClient.invalidateQueries({ queryKey: ["lots"] });
};

export const useEnregistrerEntree = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enregistrerEntree,
    onSuccess: () => invalidateAfterMouvement(queryClient),
  });
};

export const useEnregistrerSortie = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enregistrerSortie,
    onSuccess: () => invalidateAfterMouvement(queryClient),
  });
};

export const useEnregistrerAjustement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enregistrerAjustement,
    onSuccess: () => invalidateAfterMouvement(queryClient),
  });
};