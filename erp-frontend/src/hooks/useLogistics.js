import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCamions,
  getCamion,
  createCamion,
  updateCamion,
  deleteCamion,
  getExpeditions,
  getExpedition,
  createExpedition,
  updateExpedition,
  deleteExpedition,
} from "../api/commercial";

/* ── Camions ──────────────────────────────────────────────────────────── */

export const useCamions = (params = {}) => {
  return useQuery({
    queryKey: ["camions", params],
    queryFn: () => getCamions(params),
    keepPreviousData: true,
  });
};

export const useCamion = (id) => {
  return useQuery({
    queryKey: ["camions", id],
    queryFn: () => getCamion(id),
    enabled: !!id,
  });
};

export const useCreateCamion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCamion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["camions"] }),
  });
};

export const useUpdateCamion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateCamion(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["camions"] });
      queryClient.invalidateQueries({ queryKey: ["camions", id] });
    },
  });
};

export const useDeleteCamion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCamion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["camions"] }),
  });
};

/* ── Expéditions ──────────────────────────────────────────────────────── */

export const useExpeditions = (params = {}) => {
  return useQuery({
    queryKey: ["expeditions", params],
    queryFn: () => getExpeditions(params),
    keepPreviousData: true,
  });
};

export const useExpedition = (id) => {
  return useQuery({
    queryKey: ["expeditions", id],
    queryFn: () => getExpedition(id),
    enabled: !!id,
  });
};

export const useCreateExpedition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpedition,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["expeditions"] }),
  });
};

export const useUpdateExpedition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateExpedition(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["expeditions"] });
      queryClient.invalidateQueries({ queryKey: ["expeditions", id] });
    },
  });
};

export const useDeleteExpedition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpedition,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["expeditions"] }),
  });
};