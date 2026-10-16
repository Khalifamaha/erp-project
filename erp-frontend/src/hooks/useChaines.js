import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChaines,
  getChaine,
  createChaine,
  getChaineDashboard,
  demarrerSessionChaine,
  terminerSessionChaine,
  incrementerCompteurChaine,
} from "../api/production";

export const useChaines = (params = {}) => {
  return useQuery({
    queryKey: ["chaines", params],
    queryFn: () => getChaines(params),
  });
};

export const useChaine = (id) => {
  return useQuery({
    queryKey: ["chaines", id],
    queryFn: () => getChaine(id),
    enabled: !!id,
  });
};

export const useChaineDashboard = () => {
  return useQuery({
    queryKey: ["chaines", "dashboard"],
    queryFn: getChaineDashboard,
    refetchInterval: 15000,
  });
};

export const useCreateChaine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChaine,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chaines"] }),
  });
};

const invalidateChaines = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["chaines"] });
};

export const useDemarrerSessionChaine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => demarrerSessionChaine(id, payload),
    onSuccess: () => invalidateChaines(queryClient),
  });
};

export const useTerminerSessionChaine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => terminerSessionChaine(id, payload),
    onSuccess: () => invalidateChaines(queryClient),
  });
};

export const useIncrementerCompteurChaine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => incrementerCompteurChaine(id, payload),
    onSuccess: () => invalidateChaines(queryClient),
  });
};