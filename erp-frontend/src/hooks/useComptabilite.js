import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExercices,
  createExercice,
  cloturerExercice,
  initPlanExercice,
  getBilanExercice,
  getResultatExercice,
  getComptes,
  createCompte,
  getEcritures,
  createEcriture,
  validerEcriture,
  getBalance,
  getGrandLivre,
} from "../api/comptabilite";

/* ── Exercices ────────────────────────────────────────────────────────── */

export const useExercices = (params = {}) => {
  return useQuery({
    queryKey: ["exercices", params],
    queryFn: () => getExercices(params),
  });
};

export const useBilanExercice = (id) => {
  return useQuery({
    queryKey: ["exercices", id, "bilan"],
    queryFn: () => getBilanExercice(id),
    enabled: !!id,
  });
};

export const useResultatExercice = (id) => {
  return useQuery({
    queryKey: ["exercices", id, "resultat"],
    queryFn: () => getResultatExercice(id),
    enabled: !!id,
  });
};

export const useCreateExercice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExercice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exercices"] }),
  });
};

export const useCloturerExercice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cloturerExercice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exercices"] }),
  });
};

export const useInitPlanExercice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: initPlanExercice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercices"] });
      queryClient.invalidateQueries({ queryKey: ["comptes"] });
    },
  });
};

/* ── Plan comptable ───────────────────────────────────────────────────── */

export const useComptes = (params = {}) => {
  return useQuery({
    queryKey: ["comptes", params],
    queryFn: () => getComptes(params),
    keepPreviousData: true,
  });
};

export const useCreateCompte = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCompte,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comptes"] }),
  });
};

export const useGrandLivre = (compteId, params = {}) => {
  return useQuery({
    queryKey: ["grand_livre", compteId, params],
    queryFn: () => getGrandLivre(compteId, params),
    enabled: !!compteId,
  });
};

/* ── Écritures ────────────────────────────────────────────────────────── */

export const useEcritures = (params = {}) => {
  return useQuery({
    queryKey: ["ecritures", params],
    queryFn: () => getEcritures(params),
    keepPreviousData: true,
  });
};

export const useBalance = (exerciceId) => {
  return useQuery({
    queryKey: ["balance", exerciceId],
    queryFn: () => getBalance(exerciceId),
    enabled: !!exerciceId,
  });
};

export const useCreateEcriture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEcriture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ecritures"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
};

export const useValiderEcriture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: validerEcriture,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ecritures"] }),
  });
};