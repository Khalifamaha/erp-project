import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPointages,
  getPointagesDuJour,
  badgerEntree,
  badgerSortie,
  validerPointage,
  getConges,
  getCongesEnAttente,
  createConge,
  decisionConge,
  annulerConge,
  getPaiements,
  getPaiement,
  createPaiement,
  genererBulkPaiements,
  validerPaiement,
  marquerPayePaiement,
  getResumeMensuel,
} from "../api/hr";

/* ── Pointages ────────────────────────────────────────────────────────── */

export const usePointagesDuJour = () => {
  return useQuery({
    queryKey: ["pointages", "du_jour"],
    queryFn: getPointagesDuJour,
    refetchInterval: 30000,
  });
};

export const usePointages = (params = {}) => {
  return useQuery({
    queryKey: ["pointages", params],
    queryFn: () => getPointages(params),
    keepPreviousData: true,
  });
};

export const useBadgerEntree = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: badgerEntree,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pointages"] }),
  });
};

export const useBadgerSortie = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: badgerSortie,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pointages"] }),
  });
};

export const useValiderPointage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: validerPointage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pointages"] }),
  });
};

/* ── Congés ───────────────────────────────────────────────────────────── */

export const useConges = (params = {}) => {
  return useQuery({
    queryKey: ["conges", params],
    queryFn: () => getConges(params),
    keepPreviousData: true,
  });
};

export const useCongesEnAttente = () => {
  return useQuery({
    queryKey: ["conges", "en_attente"],
    queryFn: getCongesEnAttente,
  });
};

export const useCreateConge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createConge,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conges"] }),
  });
};

export const useDecisionConge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, commentaire_rh }) =>
      decisionConge(id, decision, commentaire_rh),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conges"] }),
  });
};

export const useAnnulerConge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: annulerConge,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conges"] }),
  });
};

/* ── Paiements ────────────────────────────────────────────────────────── */

export const usePaiements = (params = {}) => {
  return useQuery({
    queryKey: ["paiements", params],
    queryFn: () => getPaiements(params),
    keepPreviousData: true,
  });
};

export const usePaiement = (id) => {
  return useQuery({
    queryKey: ["paiements", id],
    queryFn: () => getPaiement(id),
    enabled: !!id,
  });
};

export const useCreatePaiement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPaiement,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["paiements"] }),
  });
};

export const useGenererBulkPaiements = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: genererBulkPaiements,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["paiements"] }),
  });
};

export const useValiderPaiement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: validerPaiement,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["paiements"] }),
  });
};

export const useMarquerPayePaiement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reference_virement }) =>
      marquerPayePaiement(id, reference_virement),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["paiements"] }),
  });
};

export const useResumeMensuel = (periode_debut) => {
  return useQuery({
    queryKey: ["paiements", "resume_mensuel", periode_debut],
    queryFn: () => getResumeMensuel(periode_debut),
  });
};