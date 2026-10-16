# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import Employe, HabilitationMachine
from ..serializers import (
    EmployeSerializer, EmployeCreateSerializer,
    HabilitationSerializer,
)


class EmployeViewSet(viewsets.ModelViewSet):
    """
    GET    /api/hr/employes/                     → liste
    POST   /api/hr/employes/                     → créer
    GET    /api/hr/employes/{id}/                → détail
    PUT    /api/hr/employes/{id}/                → modifier
    DELETE /api/hr/employes/{id}/                → supprimer
    GET    /api/hr/employes/{id}/habilitations/  → ses habilitations machine
    POST   /api/hr/employes/{id}/changer_statut/ → changer le statut
    GET    /api/hr/employes/stats/               → statistiques RH
    """
    queryset           = Employe.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['departement', 'statut', 'type_contrat']
    search_fields      = ['nom', 'prenom', 'matricule', 'cin', 'poste']
    ordering_fields    = ['nom', 'prenom', 'date_embauche', 'salaire_base']

    def get_serializer_class(self):
        if self.action == 'create':
            return EmployeCreateSerializer
        return EmployeSerializer

    @action(detail=True, methods=['get'], url_path='habilitations')
    def habilitations(self, request, pk=None):
        employe = self.get_object()
        qs = HabilitationMachine.objects.filter(employe=employe)
        return Response(HabilitationSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], url_path='changer_statut')
    def changer_statut(self, request, pk=None):
        employe = self.get_object()
        nouveau_statut = request.data.get('statut')
        choix_valides  = [c[0] for c in Employe.STATUT]
        if nouveau_statut not in choix_valides:
            return Response(
                {'error': f"Statut invalide. Choix : {choix_valides}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        employe.statut = nouveau_statut
        employe.save(update_fields=['statut'])
        return Response({'message': f"Statut mis à jour : {nouveau_statut}"})

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        from django.db.models import Count
        total     = Employe.objects.count()
        par_dept  = list(
            Employe.objects.values('departement')
            .annotate(total=Count('id'))
            .order_by('-total')
        )
        par_statut = list(
            Employe.objects.values('statut')
            .annotate(total=Count('id'))
        )
        return Response({
            'total_employes': total,
            'par_departement': par_dept,
            'par_statut': par_statut,
        })


class HabilitationViewSet(viewsets.ModelViewSet):
    """
    CRUD des habilitations machine.
    GET  /api/hr/habilitations/
    POST /api/hr/habilitations/
    """
    queryset           = HabilitationMachine.objects.all()
    serializer_class   = HabilitationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['employe', 'active', 'niveau']