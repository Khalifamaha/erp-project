import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFacturesVente,
  createFactureVente,
  emettreFacture,
  payerFactureVente,
  getFacturesVenteEnRetard,
  getFacturesAEncaisser,
  getFacturesVenteStats,
} from "../api/comptabilite";

export const useFacturesVente = (params = {}) => {
  return useQuery({
    queryKey: ["factures-vente", params],
    queryFn: () => getFacturesVente(params),
    keepPreviousData: true,
  });
};

export const useFacturesVenteEnRetard = () => {
  return useQuery({
    queryKey: ["factures-vente", "en_retard"],
    queryFn: getFacturesVenteEnRetard,
  });
};

export const useFacturesAEncaisser = () => {
  return useQuery({
    queryKey: ["factures-vente", "a_encaisser"],
    queryFn: getFacturesAEncaisser,
  });
};

export const useFacturesVenteStats = () => {
  return useQuery({
    queryKey: ["factures-vente", "stats"],
    queryFn: getFacturesVenteStats,
  });
};

export const useCreateFactureVente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFactureVente,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["factures-vente"] }),
  });
};

export const useEmettreFacture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: emettreFacture,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["factures-vente"] }),
  });
};

export const usePayerFactureVente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => payerFactureVente(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["factures-vente"] }),
  });
};