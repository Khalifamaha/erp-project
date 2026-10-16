import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployes,
  getEmploye,
  createEmploye,
  updateEmploye,
  deleteEmploye,
} from "../api/hr";

export const useEmployes = (params = {}) => {
  return useQuery({
    queryKey: ["employes", params],
    queryFn: () => getEmployes(params),
    keepPreviousData: true,
  });
};

export const useEmploye = (id) => {
  return useQuery({
    queryKey: ["employes", id],
    queryFn: () => getEmploye(id),
    enabled: !!id,
  });
};

export const useCreateEmploye = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmploye,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employes"] }),
  });
};

export const useUpdateEmploye = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateEmploye(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["employes"] });
      queryClient.invalidateQueries({ queryKey: ["employes", id] });
    },
  });
};

export const useDeleteEmploye = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmploye,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employes"] }),
  });
};