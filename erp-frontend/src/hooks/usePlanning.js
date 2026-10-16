import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPlannings,
  getPlanning,
  createPlanning,
  updatePlanning,
  getGanttData,
  getSemaine,
  getConflits,
  confirmerPlanning,
  reporterPlanning,
  annulerPlanning,
  getChargeMachine,
  getChargeChaine,
  genererAutoPlanning,
} from "../api/planning";

export const usePlannings = (params = {}) => {
  return useQuery({
    queryKey: ["plannings", params],
    queryFn: () => getPlannings(params),
    keepPreviousData: true,
  });
};

export const usePlanning = (id) => {
  return useQuery({
    queryKey: ["plannings", id],
    queryFn: () => getPlanning(id),
    enabled: !!id,
  });
};

export const useGanttData = (params = {}) => {
  return useQuery({
    queryKey: ["plannings", "gantt", params],
    queryFn: () => getGanttData(params),
  });
};

export const useSemaine = (date) => {
  return useQuery({
    queryKey: ["plannings", "semaine", date],
    queryFn: () => getSemaine(date),
  });
};

export const useConflits = (params = {}) => {
  return useQuery({
    queryKey: ["plannings", "conflits", params],
    queryFn: () => getConflits(params),
  });
};

export const useChargeMachine = (params = {}) => {
  return useQuery({
    queryKey: ["plannings", "charge_machine", params],
    queryFn: () => getChargeMachine(params),
  });
};

export const useChargeChaine = (params = {}) => {
  return useQuery({
    queryKey: ["plannings", "charge_chaine", params],
    queryFn: () => getChargeChaine(params),
  });
};

export const useCreatePlanning = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlanning,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plannings"] }),
  });
};

export const useUpdatePlanning = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updatePlanning(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plannings"] }),
  });
};

export const useConfirmerPlanning = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmerPlanning,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plannings"] }),
  });
};

export const useReporterPlanning = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nouvelle_date }) => reporterPlanning(id, nouvelle_date),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plannings"] }),
  });
};

export const useAnnulerPlanning = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: annulerPlanning,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plannings"] }),
  });
};

export const useGenererAutoPlanning = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: genererAutoPlanning,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plannings"] }),
  });
};