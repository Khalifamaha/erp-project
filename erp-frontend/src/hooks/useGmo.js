import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMaintenances,
  createMaintenance,
  getMaintenancesAEffectuer,
  getMaintenancesEnRetard,
  effectuerMaintenance,
  getMaintenancesStats,
  getPannes,
  getPanne,
  declarerPanne,
  getPannesActives,
  assignerPanne,
  cloturerPanne,
  getPannesStats,
  getInterventions,
  cloturerIntervention,
} from "../api/gmo";

/* ── Maintenances ─────────────────────────────────────────────────────── */

export const useMaintenances = (params = {}) => {
  return useQuery({
    queryKey: ["maintenances", params],
    queryFn: () => getMaintenances(params),
    keepPreviousData: true,
  });
};

export const useMaintenancesAEffectuer = () => {
  return useQuery({
    queryKey: ["maintenances", "a_effectuer"],
    queryFn: getMaintenancesAEffectuer,
  });
};

export const useMaintenancesEnRetard = () => {
  return useQuery({
    queryKey: ["maintenances", "en_retard"],
    queryFn: getMaintenancesEnRetard,
  });
};

export const useMaintenancesStats = () => {
  return useQuery({
    queryKey: ["maintenances", "stats"],
    queryFn: getMaintenancesStats,
  });
};

export const useCreateMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMaintenance,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["maintenances"] }),
  });
};

export const useEffectuerMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => effectuerMaintenance(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["maintenances"] }),
  });
};

/* ── Pannes ───────────────────────────────────────────────────────────── */

export const usePannes = (params = {}) => {
  return useQuery({
    queryKey: ["pannes", params],
    queryFn: () => getPannes(params),
    keepPreviousData: true,
  });
};

export const usePanne = (id) => {
  return useQuery({
    queryKey: ["pannes", id],
    queryFn: () => getPanne(id),
    enabled: !!id,
  });
};

export const usePannesActives = () => {
  return useQuery({
    queryKey: ["pannes", "actives"],
    queryFn: getPannesActives,
    refetchInterval: 30000,
  });
};

export const usePannesStats = (params = {}) => {
  return useQuery({
    queryKey: ["pannes", "stats", params],
    queryFn: () => getPannesStats(params),
  });
};

export const useDeclarerPanne = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: declarerPanne,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pannes"] }),
  });
};

export const useAssignerPanne = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, technicien_id }) => assignerPanne(id, technicien_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pannes"] }),
  });
};

export const useCloturerPanne = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cloturerPanne,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pannes"] }),
  });
};

/* ── Interventions ────────────────────────────────────────────────────── */

export const useInterventions = (params = {}) => {
  return useQuery({
    queryKey: ["interventions", params],
    queryFn: () => getInterventions(params),
    keepPreviousData: true,
  });
};

export const useCloturerIntervention = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => cloturerIntervention(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interventions"] });
      queryClient.invalidateQueries({ queryKey: ["pannes"] });
    },
  });
};