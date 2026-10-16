# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from ..models import Lot
from ..serializers import LotSerializer


class LotViewSet(viewsets.ModelViewSet):
    """
    GET  /api/inventory/lots/              -> liste
    POST /api/inventory/lots/              -> creer
    GET  /api/inventory/lots/expires/      -> lots expires
    GET  /api/inventory/lots/a_expirer/    -> lots expirant dans 30 jours
    POST /api/inventory/lots/{id}/bloquer/ -> bloquer un lot
    POST /api/inventory/lots/{id}/liberer/ -> liberer un lot en quarantaine
    """
    queryset           = Lot.objects.select_related('produit').all()
    serializer_class   = LotSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['produit', 'statut', 'origine']
    search_fields      = ['numero_lot', 'numero_serie', 'produit__reference', 'fournisseur_nom']
    ordering_fields    = ['date_creation', 'date_expiration', 'quantite_restante']

    @action(detail=False, methods=['get'], url_path='expires')
    def expires(self, request):
        today = timezone.now().date()
        qs = Lot.objects.filter(
            date_expiration__lt=today,
            statut='disponible'
        ).select_related('produit')
        return Response(LotSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='a_expirer')
    def a_expirer(self, request):
        today     = timezone.now().date()
        dans_30j  = today + timezone.timedelta(days=30)
        qs = Lot.objects.filter(
            date_expiration__gte=today,
            date_expiration__lte=dans_30j,
            statut='disponible'
        ).select_related('produit').order_by('date_expiration')
        return Response(LotSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], url_path='bloquer')
    def bloquer(self, request, pk=None):
        lot = self.get_object()
        if lot.statut not in ['disponible', 'quarantaine']:
            return Response(
                {'error': f"Impossible de bloquer un lot {lot.statut}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        lot.statut = 'bloque'
        lot.save(update_fields=['statut'])
        return Response({'message': f"Lot {lot.numero_lot} bloque."})

    @action(detail=True, methods=['post'], url_path='liberer')
    def liberer(self, request, pk=None):
        lot = self.get_object()
        if lot.statut != 'bloque':
            return Response(
                {'error': "Seul un lot bloque peut etre libere."},
                status=status.HTTP_400_BAD_REQUEST
            )
        lot.statut = 'disponible'
        lot.save(update_fields=['statut'])
        return Response({'message': f"Lot {lot.numero_lot} libere."})

    @action(detail=True, methods=['get'], url_path='tracabilite')
    def tracabilite(self, request, pk=None):
        """Parcours complet du lot : de l'entree a la sortie."""
        lot = self.get_object()
        from ..serializers import MouvementSerializer
        mouvements = lot.mouvements.order_by('date_mouvement')
        return Response({
            'lot': LotSerializer(lot).data,
            'mouvements': MouvementSerializer(mouvements, many=True).data,
        })