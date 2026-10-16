import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCriteres,
  createCritere,
  updateCritere,
  deleteCritere,
  getCriteresParProduit,
  getControles,
  saisieRapideControle,
  getControlesStats,
  getControlesNonConformes,
  getControlesParOF,
} from "../api/quality";

/* ── Critères ─────────────────────────────────────────────────────────── */

export const useCriteres = (params = {}) => {
  return useQuery({
    queryKey: ["criteres", params],
    queryFn: () => getCriteres(params),
    keepPreviousData: true,
  });
};

export const useCriteresParProduit = (produitId) => {
  return useQuery({
    queryKey: ["criteres", "par_produit", produitId],
    queryFn: () => getCriteresParProduit(produitId),
    enabled: !!produitId,
  });
};

export const useCreateCritere = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCritere,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["criteres"] }),
  });
};

export const useUpdateCritere = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateCritere(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["criteres"] }),
  });
};

export const useDeleteCritere = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCritere,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["criteres"] }),
  });
};

/* ── Contrôles ────────────────────────────────────────────────────────── */

export const useControles = (params = {}) => {
  return useQuery({
    queryKey: ["controles", params],
    queryFn: () => getControles(params),
    keepPreviousData: true,
  });
};

export const useControlesStats = () => {
  return useQuery({
    queryKey: ["controles", "stats"],
    queryFn: getControlesStats,
  });
};

export const useControlesNonConformes = () => {
  return useQuery({
    queryKey: ["controles", "non_conformes"],
    queryFn: getControlesNonConformes,
  });
};

export const useControlesParOF = (ofId) => {
  return useQuery({
    queryKey: ["controles", "par_of", ofId],
    queryFn: () => getControlesParOF(ofId),
    enabled: !!ofId,
  });
};

export const useSaisieRapideControle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saisieRapideControle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["controles"] });
      queryClient.invalidateQueries({ queryKey: ["fiches-nc"] });
    },
  });
};