# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from ..models import GammeOperatoire, Operation
from ..serializers import (
    GammeOperatoireSerializer, GammeCreateSerializer, OperationSerializer,
)


class GammeOperatoireViewSet(viewsets.ModelViewSet):
    """
    GET    /api/production/gammes/                -> liste
    POST   /api/production/gammes/                -> creer avec operations
    GET    /api/production/gammes/{id}/           -> detail avec operations
    POST   /api/production/gammes/{id}/activer/   -> activer cette version
    POST   /api/production/gammes/{id}/dupliquer/ -> creer nouvelle version
    GET    /api/production/gammes/{id}/charge/    -> calcul charge par quantite
    """
    queryset           = GammeOperatoire.objects.select_related('produit', 'valide_par').prefetch_related('operations').all()
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields   = ['produit', 'active', 'version']
    search_fields      = ['nom', 'produit__reference', 'produit__designation']

    def get_serializer_class(self):
        if self.action == 'create':
            return GammeCreateSerializer
        return GammeOperatoireSerializer

    @action(detail=True, methods=['post'], url_path='activer')
    def activer(self, request, pk=None):
        gamme = self.get_object()
        gamme.activer()
        return Response({
            'message': f"Gamme v{gamme.version} activee pour {gamme.produit.reference}.",
            'active': True,
        })

    @action(detail=True, methods=['post'], url_path='valider')
    def valider(self, request, pk=None):
        gamme = self.get_object()
        gamme.date_validation = timezone.now().date()
        gamme.valide_par      = request.user
        gamme.save(update_fields=['date_validation', 'valide_par'])
        return Response({'message': f"Gamme validee par {request.user.nom_complet}."})

    @action(detail=True, methods=['post'], url_path='dupliquer')
    def dupliquer(self, request, pk=None):
        """Cree une nouvelle version de la gamme (pour modification)."""
        gamme_orig = self.get_object()
        nouvelle_version = GammeOperatoire.objects.filter(
            produit=gamme_orig.produit
        ).order_by('-version').first().version + 1

        nouvelle_gamme = GammeOperatoire.objects.create(
            produit=gamme_orig.produit,
            nom=gamme_orig.nom,
            version=nouvelle_version,
            active=False,
            description=f"Copie de v{gamme_orig.version}",
        )
        for op in gamme_orig.operations.all():
            Operation.objects.create(
                gamme=nouvelle_gamme,
                machine=op.machine,
                ordre=op.ordre,
                nom=op.nom,
                type_operation=op.type_operation,
                temps_unitaire_min=op.temps_unitaire_min,
                temps_reglage_min=op.temps_reglage_min,
                operateurs_requis=op.operateurs_requis,
                instruction=op.instruction,
            )
        return Response({
            'message': f"Gamme v{nouvelle_version} creee.",
            'id': str(nouvelle_gamme.id),
            'version': nouvelle_version,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='charge')
    def charge(self, request, pk=None):
        """Calcule la charge de production pour une quantite donnee."""
        gamme    = self.get_object()
        quantite = float(request.query_params.get('quantite', 100))
        operations_detail = []
        for op in gamme.operations.select_related('machine').order_by('ordre'):
            temps_total_min = quantite * float(op.temps_unitaire_min) + float(op.temps_reglage_min)
            operations_detail.append({
                'ordre':            op.ordre,
                'nom':              op.nom,
                'machine':          op.machine.nom,
                'temps_unit_min':   float(op.temps_unitaire_min),
                'temps_reglage_min':float(op.temps_reglage_min),
                'temps_total_min':  round(temps_total_min, 2),
                'temps_total_h':    round(temps_total_min / 60, 2),
                'operateurs':       op.operateurs_requis,
            })
        temps_total = sum(op['temps_total_min'] for op in operations_detail)
        return Response({
            'produit':          gamme.produit.reference,
            'gamme':            gamme.nom,
            'quantite':         quantite,
            'temps_total_min':  round(temps_total, 2),
            'temps_total_h':    round(temps_total / 60, 2),
            'operations':       operations_detail,
        })


class OperationViewSet(viewsets.ModelViewSet):
    queryset           = Operation.objects.select_related('gamme', 'machine').all()
    serializer_class   = OperationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['gamme', 'machine', 'type_operation']