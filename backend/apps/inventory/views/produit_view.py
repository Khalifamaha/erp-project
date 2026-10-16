# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, F

from ..models import CategorieProduit, EmplacementStock, Produit
from ..serializers import CategorieSerializer, EmplacementSerializer, ProduitSerializer


class CategorieViewSet(viewsets.ModelViewSet):
    queryset           = CategorieProduit.objects.all()
    serializer_class   = CategorieSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [filters.SearchFilter, DjangoFilterBackend]
    search_fields      = ['nom']
    filterset_fields   = ['type', 'actif']


class EmplacementViewSet(viewsets.ModelViewSet):
    queryset           = EmplacementStock.objects.all()
    serializer_class   = EmplacementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [filters.SearchFilter, DjangoFilterBackend]
    search_fields      = ['code', 'nom']
    filterset_fields   = ['type', 'actif']


class ProduitViewSet(viewsets.ModelViewSet):
    """
    GET    /api/inventory/produits/                -> liste
    POST   /api/inventory/produits/                -> creer
    GET    /api/inventory/produits/{id}/           -> detail
    PUT    /api/inventory/produits/{id}/           -> modifier
    GET    /api/inventory/produits/sous_seuil/     -> alertes stock bas
    GET    /api/inventory/produits/rupture/        -> produits en rupture
    GET    /api/inventory/produits/stats/          -> statistiques stock
    GET    /api/inventory/produits/{id}/lots/      -> lots du produit
    GET    /api/inventory/produits/{id}/mouvements/-> historique mouvements
    """
    queryset           = Produit.objects.select_related('categorie', 'emplacement').all()
    serializer_class   = ProduitSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['type', 'actif', 'categorie', 'emplacement']
    search_fields      = ['reference', 'designation', 'code_barre']
    ordering_fields    = ['reference', 'designation', 'stock_actuel', 'prix_unitaire']

    @action(detail=False, methods=['get'], url_path='sous_seuil')
    def sous_seuil(self, request):
        """Produits dont le stock actuel <= stock minimum."""
        qs = Produit.objects.filter(
            actif=True,
            stock_actuel__lte=F('stock_minimum')
        ).select_related('categorie', 'emplacement')
        return Response(ProduitSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='rupture')
    def rupture(self, request):
        """Produits en rupture totale de stock."""
        qs = Produit.objects.filter(actif=True, stock_actuel__lte=0)
        return Response(ProduitSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        produits      = Produit.objects.filter(actif=True)
        valeur_totale = sum(p.valeur_stock for p in produits)
        par_type      = list(
            produits.values('type').annotate(nombre=Count('id')).order_by('-nombre')
        )
        return Response({
            'total_produits':  produits.count(),
            'en_rupture':      produits.filter(stock_actuel__lte=0).count(),
            'sous_seuil':      produits.filter(stock_actuel__lte=F('stock_minimum')).count(),
            'valeur_totale_dt': round(valeur_totale, 3),
            'par_type':        par_type,
        })

    @action(detail=True, methods=['get'], url_path='lots')
    def lots(self, request, pk=None):
        from ..serializers import LotSerializer
        produit = self.get_object()
        qs = produit.lots.order_by('-date_creation')
        return Response(LotSerializer(qs, many=True).data)

    @action(detail=True, methods=['get'], url_path='mouvements')
    def mouvements(self, request, pk=None):
        from ..serializers import MouvementSerializer
        produit = self.get_object()
        qs = produit.mouvements.order_by('-date_mouvement')[:50]
        return Response(MouvementSerializer(qs, many=True).data)