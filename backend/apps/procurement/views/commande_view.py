# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import CommandeAchat, LigneCommandeAchat
from ..serializers import (
    CommandeAchatSerializer, CommandeAchatCreateSerializer,
    LigneCommandeAchatSerializer,
)


class CommandeAchatViewSet(viewsets.ModelViewSet):
    """
    GET    /api/procurement/commandes/                    -> liste
    POST   /api/procurement/commandes/                    -> creer avec lignes
    GET    /api/procurement/commandes/{id}/               -> detail
    POST   /api/procurement/commandes/{id}/soumettre/     -> envoyer au fournisseur
    POST   /api/procurement/commandes/{id}/confirmer/     -> fournisseur a confirme
    POST   /api/procurement/commandes/{id}/annuler/       -> annuler
    GET    /api/procurement/commandes/{id}/receptions/    -> receptions liees
    GET    /api/procurement/commandes/en_attente/         -> commandes non livrees
    """
    queryset           = CommandeAchat.objects.select_related('fournisseur', 'cree_par').all()
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['fournisseur', 'statut', 'devise']
    search_fields      = ['numero', 'fournisseur__raison_sociale']
    ordering_fields    = ['date_commande', 'montant_total', 'date_livraison_prev']

    def get_serializer_class(self):
        if self.action == 'create':
            return CommandeAchatCreateSerializer
        return CommandeAchatSerializer

    def perform_create(self, serializer):
        serializer.save(cree_par=self.request.user)

    def _changer_statut(self, request, pk, nouveau_statut, statuts_autorises, message):
        commande = self.get_object()
        if commande.statut not in statuts_autorises:
            return Response(
                {'error': f"Impossible : statut actuel '{commande.statut}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        commande.statut = nouveau_statut
        commande.save(update_fields=['statut'])
        return Response({'message': message, 'statut': nouveau_statut})

    @action(detail=True, methods=['post'], url_path='soumettre')
    def soumettre(self, request, pk=None):
        return self._changer_statut(
            request, pk, 'soumise', ['brouillon'],
            'Commande soumise au fournisseur.'
        )

    @action(detail=True, methods=['post'], url_path='confirmer')
    def confirmer(self, request, pk=None):
        commande = self.get_object()
        if commande.statut != 'soumise':
            return Response(
                {'error': "Seule une commande soumise peut etre confirmee."},
                status=status.HTTP_400_BAD_REQUEST
            )
        commande.statut       = 'confirmee'
        commande.approuve_par = request.user
        commande.save(update_fields=['statut', 'approuve_par'])
        return Response({'message': 'Commande confirmee.', 'statut': 'confirmee'})

    @action(detail=True, methods=['post'], url_path='annuler')
    def annuler(self, request, pk=None):
        return self._changer_statut(
            request, pk, 'annulee',
            ['brouillon', 'soumise', 'confirmee'],
            'Commande annulee.'
        )

    @action(detail=True, methods=['get'], url_path='receptions')
    def receptions(self, request, pk=None):
        from ..serializers import ReceptionSerializer
        commande = self.get_object()
        qs = commande.receptions.order_by('-date_reception')
        return Response(ReceptionSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='en_attente')
    def en_attente(self, request):
        qs = CommandeAchat.objects.filter(
            statut__in=['soumise', 'confirmee', 'partielle']
        ).select_related('fournisseur').order_by('date_livraison_prev')
        return Response(CommandeAchatSerializer(qs, many=True).data)