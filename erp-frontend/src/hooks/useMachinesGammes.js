import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMachines,
  getMachine,
  createMachine,
  updateMachine,
  changerStatutMachine,
  getMachinesStats,
  getGammes,
  getGamme,
  createGamme,
  activerGamme,
  dupliquerGamme,
} from "../api/production";

/* ── Machines ─────────────────────────────────────────────────────────── */

export const useMachines = (params = {}) => {
  return useQuery({
    queryKey: ["machines", params],
    queryFn: () => getMachines(params),
    keepPreviousData: true,
  });
};

export const useMachine = (id) => {
  return useQuery({
    queryKey: ["machines", id],
    queryFn: () => getMachine(id),
    enabled: !!id,
  });
};

export const useMachinesStats = () => {
  return useQuery({
    queryKey: ["machines", "stats"],
    queryFn: getMachinesStats,
  });
};

export const useCreateMachine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMachine,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["machines"] }),
  });
};

export const useUpdateMachine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateMachine(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      queryClient.invalidateQueries({ queryKey: ["machines", id] });
    },
  });
};

export const useChangerStatutMachine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statut }) => changerStatutMachine(id, statut),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["machines"] }),
  });
};

/* ── Gammes opératoires ───────────────────────────────────────────────── */

export const useGammes = (params = {}) => {
  return useQuery({
    queryKey: ["gammes", params],
    queryFn: () => getGammes(params),
    keepPreviousData: true,
  });
};

export const useGamme = (id) => {
  return useQuery({
    queryKey: ["gammes", id],
    queryFn: () => getGamme(id),
    enabled: !!id,
  });
};

export const useCreateGamme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGamme,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gammes"] }),
  });
};

export const useActiverGamme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activerGamme,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gammes"] }),
  });
};

export const useDupliquerGamme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dupliquerGamme,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gammes"] }),
  });
};