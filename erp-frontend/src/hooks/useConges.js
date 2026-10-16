import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConges,
  getCongesEnAttente,
  createConge,
  decisionConge,
  annulerConge,
} from "../api/conges";

export const useConges = (params = {}) => {
  return useQuery({
    queryKey: ["conges", params],
    queryFn: () => getConges(params),
    keepPreviousData: true,
  });
};

export const useCongesEnAttente = () => {
  return useQuery({
    queryKey: ["conges", "en_attente"],
    queryFn: getCongesEnAttente,
  });
};

export const useCreateConge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createConge,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conges"] }),
  });
};

export const useDecisionConge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, commentaire_rh }) =>
      decisionConge(id, decision, commentaire_rh),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conges"] }),
  });
};

export const useAnnulerConge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: annulerConge,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conges"] }),
  });
};