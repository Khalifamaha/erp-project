# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import MouvementStock, Produit
from ..serializers import (
    MouvementSerializer,
    MouvementCreateSerializer,
    AjustementInventaireSerializer,
)


class MouvementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET  /api/inventory/mouvements/              -> historique complet
    POST /api/inventory/mouvements/entree/       -> entree stock
    POST /api/inventory/mouvements/sortie/       -> sortie stock
    POST /api/inventory/mouvements/ajustement/   -> ajustement inventaire
    GET  /api/inventory/mouvements/resume_jour/  -> resume du jour
    """
    queryset           = MouvementStock.objects.select_related('produit', 'lot', 'utilisateur').all()
    serializer_class   = MouvementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = ['produit', 'type_mouvement', 'lot']
    ordering_fields    = ['date_mouvement']

    @action(detail=False, methods=['post'], url_path='entree')
    def entree(self, request):
        """Enregistrer une entree de stock (achat, retour, etc.)."""
        serializer = MouvementCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data    = serializer.validated_data
        produit = Produit.objects.get(id=data['produit_id'])
        lot     = data.get('lot')

        type_mvt = data['type_mouvement']
        types_entree = ['entree_achat', 'entree_production', 'entree_retour', 'ajustement_pos']
        if type_mvt not in types_entree:
            return Response(
                {'error': f"Type '{type_mvt}' n'est pas un type d'entree valide."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            mvt = MouvementStock.enregistrer(
                produit=produit,
                type_mouvement=type_mvt,
                quantite=data['quantite'],
                lot=lot,
                utilisateur=request.user,
                reference_doc=data.get('reference_doc', ''),
                motif=data.get('motif', ''),
                prix_unitaire=data.get('prix_unitaire', 0),
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(MouvementSerializer(mvt).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='sortie')
    def sortie(self, request):
        """Enregistrer une sortie de stock."""
        serializer = MouvementCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data    = serializer.validated_data
        produit = Produit.objects.get(id=data['produit_id'])
        lot     = data.get('lot')

        type_mvt = data['type_mouvement']
        types_sortie = ['sortie_production', 'sortie_expedition', 'sortie_rebut', 'ajustement_neg']
        if type_mvt not in types_sortie:
            return Response(
                {'error': f"Type '{type_mvt}' n'est pas un type de sortie valide."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            mvt = MouvementStock.enregistrer(
                produit=produit,
                type_mouvement=type_mvt,
                quantite=data['quantite'],
                lot=lot,
                utilisateur=request.user,
                reference_doc=data.get('reference_doc', ''),
                motif=data.get('motif', ''),
                prix_unitaire=data.get('prix_unitaire', 0),
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(MouvementSerializer(mvt).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='ajustement')
    def ajustement(self, request):
        """Ajustement inventaire physique — corrige le stock reel."""
        serializer = AjustementInventaireSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data    = serializer.validated_data
        produit = Produit.objects.get(id=data['produit_id'])
        qte_sys = float(produit.stock_actuel)
        qte_phy = float(data['quantite_reelle'])
        ecart   = qte_phy - qte_sys

        if ecart == 0:
            return Response({'message': 'Aucun ecart — stock correct.', 'ecart': 0})

        type_mvt = 'ajustement_pos' if ecart > 0 else 'ajustement_neg'
        try:
            mvt = MouvementStock.enregistrer(
                produit=produit,
                type_mouvement=type_mvt,
                quantite=abs(ecart),
                utilisateur=request.user,
                motif=data.get('motif', 'Ajustement inventaire physique'),
                reference_doc='INVENTAIRE',
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': f"Ajustement effectue. Ecart: {ecart:+.3f} {produit.unite_mesure}",
            'stock_avant': mvt.stock_avant,
            'stock_apres': mvt.stock_apres,
            'ecart': ecart,
            'mouvement': MouvementSerializer(mvt).data,
        })

    @action(detail=False, methods=['get'], url_path='resume_jour')
    def resume_jour(self, request):
        """Resume des mouvements du jour."""
        from django.utils import timezone
        from django.db.models import Sum, Count
        aujourd_hui = timezone.now().date()
        qs = MouvementStock.objects.filter(date_mouvement__date=aujourd_hui)
        resume = qs.values('type_mouvement').annotate(
            nombre=Count('id'),
            total_quantite=Sum('quantite'),
        ).order_by('type_mouvement')
        return Response({
            'date': str(aujourd_hui),
            'total_mouvements': qs.count(),
            'par_type': list(resume),
        })