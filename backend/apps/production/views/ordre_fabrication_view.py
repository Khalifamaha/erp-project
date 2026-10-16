# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum

from ..models import OrdreFabrication, ConsommationOF
from ..serializers import (
    OrdreFabricationSerializer, OFMiniSerializer,
    ConsommationOFSerializer, MAJQuantiteSerializer,
)


class OrdreFabricationViewSet(viewsets.ModelViewSet):
    """
    GET    /api/production/ordres/                   -> liste
    POST   /api/production/ordres/                   -> creer
    GET    /api/production/ordres/{id}/              -> detail
    POST   /api/production/ordres/{id}/lancer/       -> lancer l OF
    POST   /api/production/ordres/{id}/terminer/     -> cloturer l OF + entree stock PF
    POST   /api/production/ordres/{id}/pause/        -> mettre en pause
    POST   /api/production/ordres/{id}/annuler/      -> annuler
    POST   /api/production/ordres/{id}/maj_quantite/ -> mise a jour quantite produite
    GET    /api/production/ordres/en_cours/          -> OF actifs
    GET    /api/production/ordres/stats/             -> tableau de bord production
    """
    queryset           = OrdreFabrication.objects.select_related(
        'produit', 'gamme', 'responsable'
    ).prefetch_related('consommations').all()
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['statut', 'priorite', 'produit', 'responsable']
    search_fields      = ['numero', 'produit__reference', 'produit__designation']
    ordering_fields    = ['priorite', 'date_debut_prev', 'date_creation']

    def get_serializer_class(self):
        if self.action == 'list':
            return OFMiniSerializer
        return OrdreFabricationSerializer

    def perform_create(self, serializer):
        serializer.save(responsable=self.request.user)

    def _transition(self, request, pk, methode, statuts_autorises, message):
        of = self.get_object()
        if of.statut not in statuts_autorises:
            return Response(
                {'error': f"Impossible depuis le statut '{of.statut}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        getattr(of, methode)(user=request.user)
        return Response({'message': message, 'statut': of.statut})

    @action(detail=True, methods=['post'], url_path='lancer')
    def lancer(self, request, pk=None):
        return self._transition(
            request, pk, 'lancer',
            ['brouillon', 'planifie'],
            'OF lance avec succes.'
        )

    @action(detail=True, methods=['post'], url_path='terminer')
    def terminer(self, request, pk=None):
        of = self.get_object()
        if of.statut not in ['lance', 'en_cours', 'pause']:
            return Response(
                {'error': f"Impossible de terminer depuis le statut '{of.statut}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        of.terminer(user=request.user)
        return Response({
            'message':          'OF termine — produit fini entre en stock.',
            'statut':           of.statut,
            'quantite_produite': str(of.quantite_produite),
            'taux_avancement':  of.taux_avancement,
        })

    @action(detail=True, methods=['post'], url_path='pause')
    def pause(self, request, pk=None):
        of = self.get_object()
        if of.statut not in ['lance', 'en_cours']:
            return Response(
                {'error': "Seul un OF lance ou en cours peut etre mis en pause."},
                status=status.HTTP_400_BAD_REQUEST
            )
        of.statut = 'pause'
        of.save(update_fields=['statut'])
        return Response({'message': 'OF mis en pause.', 'statut': 'pause'})

    @action(detail=True, methods=['post'], url_path='reprendre')
    def reprendre(self, request, pk=None):
        of = self.get_object()
        if of.statut != 'pause':
            return Response(
                {'error': "Seul un OF en pause peut etre repris."},
                status=status.HTTP_400_BAD_REQUEST
            )
        of.statut = 'en_cours'
        of.save(update_fields=['statut'])
        return Response({'message': 'OF repris.', 'statut': 'en_cours'})

    @action(detail=True, methods=['post'], url_path='annuler')
    def annuler(self, request, pk=None):
        of = self.get_object()
        if of.statut in ['termine', 'annule']:
            return Response(
                {'error': f"Impossible d annuler un OF {of.statut}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        of.statut = 'annule'
        of.save(update_fields=['statut'])
        return Response({'message': 'OF annule.', 'statut': 'annule'})

    @action(detail=True, methods=['post'], url_path='maj_quantite')
    def maj_quantite(self, request, pk=None):
        """Mise a jour quantite produite — depuis interface operateur ou chef."""
        of         = self.get_object()
        serializer = MAJQuantiteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if of.statut not in ['lance', 'en_cours']:
            # Passer automatiquement en_cours si lance
            if of.statut == 'lance':
                of.statut = 'en_cours'

        data = serializer.validated_data
        of.quantite_produite = data['quantite_produite']
        if 'quantite_rebutee' in data:
            of.quantite_rebutee = data['quantite_rebutee']
        if data.get('notes'):
            of.notes_operateur = data['notes']
        of.save(update_fields=['quantite_produite', 'quantite_rebutee', 'statut', 'notes_operateur'])

        return Response({
            'message':          'Quantite mise a jour.',
            'quantite_produite': str(of.quantite_produite),
            'quantite_restante': str(of.quantite_restante),
            'taux_avancement':  of.taux_avancement,
            'statut':           of.statut,
        })

    @action(detail=False, methods=['get'], url_path='en_cours')
    def en_cours(self, request):
        qs = OrdreFabrication.objects.filter(
            statut__in=['lance', 'en_cours', 'pause']
        ).select_related('produit', 'gamme').order_by('priorite', 'date_debut_prev')
        return Response(OFMiniSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        qs = OrdreFabrication.objects.all()
        par_statut = list(
            qs.values('statut').annotate(nombre=Count('id'))
        )
        return Response({
            'total_of':          qs.count(),
            'en_cours':          qs.filter(statut__in=['lance', 'en_cours']).count(),
            'termines':          qs.filter(statut='termine').count(),
            'annules':           qs.filter(statut='annule').count(),
            'par_statut':        par_statut,
        })


class ConsommationOFViewSet(viewsets.ModelViewSet):
    queryset           = ConsommationOF.objects.select_related('ordre', 'produit', 'lot').all()
    serializer_class   = ConsommationOFSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['ordre', 'produit']

    def perform_create(self, serializer):
        serializer.save(saisie_par=self.request.user)