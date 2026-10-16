# -*- coding: utf-8 -*-
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import CritereQualite
from ..serializers import CritereQualiteSerializer


class CritereQualiteViewSet(viewsets.ModelViewSet):
    """
    GET    /api/quality/criteres/                      -> liste
    POST   /api/quality/criteres/                      -> creer
    GET    /api/quality/criteres/{id}/                 -> detail
    GET    /api/quality/criteres/par_produit/          -> criteres par produit
    """
    queryset = CritereQualite.objects.select_related('produit').all()
    serializer_class   = CritereQualiteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields   = ['produit', 'type_mesure', 'critique', 'actif']
    search_fields      = ['nom', 'produit__reference', 'produit__designation']

    @action(detail=False, methods=['get'], url_path='par_produit')
    def par_produit(self, request):
        """Retourne les criteres groupes par produit."""
        produit_id = request.query_params.get('produit_id')
        if not produit_id:
            return Response({'error': 'produit_id requis.'}, status=400)
        qs = CritereQualite.objects.filter(
            produit_id=produit_id, actif=True
        ).order_by('-critique', 'nom')
        return Response(CritereQualiteSerializer(qs, many=True).data)