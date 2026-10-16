import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrdres,
  getOrdre,
  createOrdre,
  lancerOrdre,
  terminerOrdre,
  pauseOrdre,
  reprendreOrdre,
  annulerOrdre,
  majQuantiteOrdre,
  getOrdresEnCours,
  getOrdresStats,
  createConsommation,
} from "../api/production";

export const useOrdres = (params = {}) => {
  return useQuery({
    queryKey: ["ordres", params],
    queryFn: () => getOrdres(params),
    keepPreviousData: true,
  });
};

export const useOrdre = (id) => {
  return useQuery({
    queryKey: ["ordres", id],
    queryFn: () => getOrdre(id),
    enabled: !!id,
  });
};

export const useOrdresEnCours = () => {
  return useQuery({
    queryKey: ["ordres", "en_cours"],
    queryFn: getOrdresEnCours,
  });
};

export const useOrdresStats = () => {
  return useQuery({
    queryKey: ["ordres", "stats"],
    queryFn: getOrdresStats,
  });
};

export const useCreateOrdre = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrdre,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ordres"] }),
  });
};

const invalidateOrdre = (queryClient, id) => {
  queryClient.invalidateQueries({ queryKey: ["ordres"] });
  queryClient.invalidateQueries({ queryKey: ["ordres", id] });
};

export const useLancerOrdre = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lancerOrdre,
    onSuccess: (_, id) => invalidateOrdre(queryClient, id),
  });
};

export const useTerminerOrdre = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: terminerOrdre,
    onSuccess: (_, id) => {
      invalidateOrdre(queryClient, id);
      queryClient.invalidateQueries({ queryKey: ["produits"] });
      queryClient.invalidateQueries({ queryKey: ["lots"] });
    },
  });
};

export const usePauseOrdre = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pauseOrdre,
    onSuccess: (_, id) => invalidateOrdre(queryClient, id),
  });
};

export const useReprendreOrdre = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reprendreOrdre,
    onSuccess: (_, id) => invalidateOrdre(queryClient, id),
  });
};

export const useAnnulerOrdre = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: annulerOrdre,
    onSuccess: (_, id) => invalidateOrdre(queryClient, id),
  });
};

export const useMajQuantiteOrdre = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => majQuantiteOrdre(id, payload),
    onSuccess: (_, { id }) => invalidateOrdre(queryClient, id),
  });
};

export const useCreateConsommation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createConsommation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordres"] });
      queryClient.invalidateQueries({ queryKey: ["produits"] });
    },
  });
};