import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFichesNC,
  getFicheNC,
  createFicheNC,
  cloturerFicheNC,
  ajouterActionNC,
  validerActionNC,
  getFichesNCOuvertes,
  getFichesNCEnRetard,
  getFichesNCStats,
} from "../api/quality";

export const useFichesNC = (params = {}) => {
  return useQuery({
    queryKey: ["fiches-nc", params],
    queryFn: () => getFichesNC(params),
    keepPreviousData: true,
  });
};

export const useFicheNC = (id) => {
  return useQuery({
    queryKey: ["fiches-nc", id],
    queryFn: () => getFicheNC(id),
    enabled: !!id,
  });
};

export const useFichesNCOuvertes = () => {
  return useQuery({
    queryKey: ["fiches-nc", "ouvertes"],
    queryFn: getFichesNCOuvertes,
  });
};

export const useFichesNCEnRetard = () => {
  return useQuery({
    queryKey: ["fiches-nc", "en_retard"],
    queryFn: getFichesNCEnRetard,
  });
};

export const useFichesNCStats = () => {
  return useQuery({
    queryKey: ["fiches-nc", "stats"],
    queryFn: getFichesNCStats,
  });
};

export const useCreateFicheNC = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFicheNC,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fiches-nc"] }),
  });
};

const invalidateFiche = (queryClient, id) => {
  queryClient.invalidateQueries({ queryKey: ["fiches-nc"] });
  queryClient.invalidateQueries({ queryKey: ["fiches-nc", id] });
};

export const useCloturerFicheNC = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => cloturerFicheNC(id, payload),
    onSuccess: (_, { id }) => invalidateFiche(queryClient, id),
  });
};

export const useAjouterActionNC = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => ajouterActionNC(id, payload),
    onSuccess: (_, { id }) => invalidateFiche(queryClient, id),
  });
};

export const useValiderActionNC = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ficheId, payload }) => validerActionNC(ficheId, payload),
    onSuccess: (_, { ficheId }) => invalidateFiche(queryClient, ficheId),
  });
};