# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg

from ..models import Machine
from ..serializers import MachineSerializer


class MachineViewSet(viewsets.ModelViewSet):
    """
    GET    /api/production/machines/                    -> liste
    POST   /api/production/machines/                    -> creer
    GET    /api/production/machines/{id}/               -> detail
    PUT    /api/production/machines/{id}/               -> modifier
    POST   /api/production/machines/{id}/changer_statut/-> changer statut
    GET    /api/production/machines/{id}/pannes/        -> historique pannes
    GET    /api/production/machines/{id}/habilitations/ -> operateurs habilites
    GET    /api/production/machines/stats/              -> KPIs machines
    """
    queryset           = Machine.objects.all()
    serializer_class   = MachineSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['type', 'statut']
    search_fields      = ['code', 'nom', 'marque', 'numero_serie']
    ordering_fields    = ['code', 'nom', 'taux_disponibilite']

    @action(detail=True, methods=['post'], url_path='changer_statut')
    def changer_statut(self, request, pk=None):
        machine = self.get_object()
        nouveau = request.data.get('statut')
        choix   = [c[0] for c in Machine.STATUT_CHOICES]
        if nouveau not in choix:
            return Response(
                {'error': f"Statut invalide. Choix : {choix}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        machine.statut = nouveau
        machine.save(update_fields=['statut'])
        return Response({'message': f"Statut mis a jour : {nouveau}", 'statut': nouveau})

    @action(detail=True, methods=['get'], url_path='pannes')
    def pannes(self, request, pk=None):
        machine = self.get_object()
        try:
            from apps.gmo.models import Panne
            from apps.gmo.serializers import PanneMiniSerializer
            qs = Panne.objects.filter(machine=machine).order_by('-date_debut')[:20]
            return Response(PanneMiniSerializer(qs, many=True).data)
        except Exception:
            return Response([])

    @action(detail=True, methods=['get'], url_path='habilitations')
    def habilitations(self, request, pk=None):
        machine = self.get_object()
        from apps.hr.models import HabilitationMachine
        from apps.hr.serializers import HabilitationSerializer
        qs = HabilitationMachine.objects.filter(machine_id=machine.id, active=True)
        return Response(HabilitationSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        total   = Machine.objects.count()
        par_statut = list(
            Machine.objects.values('statut').annotate(nombre=Count('id'))
        )
        par_type = list(
            Machine.objects.values('type').annotate(nombre=Count('id')).order_by('-nombre')
        )
        dispo_moy = Machine.objects.aggregate(moy=Avg('taux_disponibilite'))['moy']
        return Response({
            'total_machines':        total,
            'disponibles':           Machine.objects.filter(statut='disponible').count(),
            'en_panne':              Machine.objects.filter(statut='panne').count(),
            'taux_disponibilite_moy': round(dispo_moy or 0, 1),
            'par_statut':            par_statut,
            'par_type':              par_type,
        })