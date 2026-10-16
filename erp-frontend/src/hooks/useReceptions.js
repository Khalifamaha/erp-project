import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReceptions,
  getReception,
  createReception,
  validerReception,
  getFacturesAchat,
  createFactureAchat,
  payerFactureAchat,
  getFacturesEnRetard,
  getFacturesAPayer,
  getFacturesAchatStats,
} from "../api/procurement";

/* ── Réceptions ───────────────────────────────────────────────────────── */

export const useReceptions = (params = {}) => {
  return useQuery({
    queryKey: ["receptions", params],
    queryFn: () => getReceptions(params),
    keepPreviousData: true,
  });
};

export const useReception = (id) => {
  return useQuery({
    queryKey: ["receptions", id],
    queryFn: () => getReception(id),
    enabled: !!id,
  });
};

export const useCreateReception = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReception,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["receptions"] }),
  });
};

export const useValiderReception = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: validerReception,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receptions"] });
      queryClient.invalidateQueries({ queryKey: ["commandes-achat"] });
      queryClient.invalidateQueries({ queryKey: ["produits"] });
      queryClient.invalidateQueries({ queryKey: ["lots"] });
    },
  });
};

/* ── Factures achat ───────────────────────────────────────────────────── */

export const useFacturesAchat = (params = {}) => {
  return useQuery({
    queryKey: ["factures-achat", params],
    queryFn: () => getFacturesAchat(params),
    keepPreviousData: true,
  });
};

export const useFacturesEnRetard = () => {
  return useQuery({
    queryKey: ["factures-achat", "en_retard"],
    queryFn: getFacturesEnRetard,
  });
};

export const useFacturesAPayer = () => {
  return useQuery({
    queryKey: ["factures-achat", "a_payer"],
    queryFn: getFacturesAPayer,
  });
};

export const useFacturesAchatStats = () => {
  return useQuery({
    queryKey: ["factures-achat", "stats"],
    queryFn: getFacturesAchatStats,
  });
};

export const useCreateFactureAchat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFactureAchat,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["factures-achat"] }),
  });
};

export const usePayerFactureAchat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => payerFactureAchat(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["factures-achat"] }),
  });
};