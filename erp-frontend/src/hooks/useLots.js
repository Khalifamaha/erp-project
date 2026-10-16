import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLots,
  createLot,
  getLotsExpires,
  getLotsAExpirer,
  bloquerLot,
  libererLot,
  getTracabiliteLot,
} from "../api/inventory";

export const useLots = (params = {}) => {
  return useQuery({
    queryKey: ["lots", params],
    queryFn: () => getLots(params),
    keepPreviousData: true,
  });
};

export const useLotsAExpirer = () => {
  return useQuery({
    queryKey: ["lots", "a_expirer"],
    queryFn: getLotsAExpirer,
  });
};

export const useLotsExpires = () => {
  return useQuery({
    queryKey: ["lots", "expires"],
    queryFn: getLotsExpires,
  });
};

export const useTracabiliteLot = (id) => {
  return useQuery({
    queryKey: ["lots", id, "tracabilite"],
    queryFn: () => getTracabiliteLot(id),
    enabled: !!id,
  });
};

export const useCreateLot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lots"] }),
  });
};

export const useBloquerLot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bloquerLot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lots"] }),
  });
};

export const useLibererLot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: libererLot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lots"] }),
  });
};