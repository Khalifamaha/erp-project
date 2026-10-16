import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategorie,
  updateCategorie,
  deleteCategorie,
  getEmplacements,
} from "../api/inventory";

export const useCategories = (params = {}) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => getCategories(params),
  });
};

export const useCreateCategorie = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategorie,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useUpdateCategorie = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateCategorie(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useDeleteCategorie = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategorie,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useEmplacements = (params = {}) => {
  return useQuery({
    queryKey: ["emplacements", params],
    queryFn: () => getEmplacements(params),
  });
};