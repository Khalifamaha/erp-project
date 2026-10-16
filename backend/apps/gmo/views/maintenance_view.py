# -*- coding: utf-8 -*-
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count

from ..models import MaintenancePreventive, ExecutionMaintenance
from ..serializers import MaintenancePreventiveSerializer, ExecutionMaintenanceSerializer


class MaintenancePreventiveViewSet(viewsets.ModelViewSet):
    """
    GET    /api/gmo/maintenances/                   -> liste
    POST   /api/gmo/maintenances/                   -> planifier
    GET    /api/gmo/maintenances/a_effectuer/       -> echeances prochaines (30j)
    GET    /api/gmo/maintenances/en_retard/         -> maintenances en retard
    POST   /api/gmo/maintenances/{id}/effectuer/    -> marquer effectuee
    GET    /api/gmo/maintenances/stats/             -> resume maintenance preventive
    """
    queryset = MaintenancePreventive.objects.select_related(
        'machine', 'responsable'
    ).prefetch_related('executions').all()
    serializer_class   = MaintenancePreventiveSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['machine', 'type_maintenance', 'statut', 'active']
    search_fields      = ['machine__code', 'machine__nom', 'description']
    ordering_fields    = ['prochaine_execution', 'frequence_jours']

    @action(detail=False, methods=['get'], url_path='a_effectuer')
    def a_effectuer(self, request):
        """Maintenances a effectuer dans les 30 prochains jours."""
        today    = timezone.now().date()
        dans_30j = today + timezone.timedelta(days=30)
        qs = MaintenancePreventive.objects.filter(
            active=True,
            statut='planifiee',
            prochaine_execution__lte=dans_30j,
        ).select_related('machine').order_by('prochaine_execution')
        return Response(MaintenancePreventiveSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='en_retard')
    def en_retard(self, request):
        today = timezone.now().date()
        qs = MaintenancePreventive.objects.filter(
            active=True,
            statut='planifiee',
            prochaine_execution__lt=today,
        ).select_related('machine').order_by('prochaine_execution')
        return Response(MaintenancePreventiveSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], url_path='effectuer')
    def effectuer(self, request, pk=None):
        """Marquer une maintenance comme effectuee et planifier la suivante."""
        maintenance = self.get_object()
        date_exec   = request.data.get('date_execution')
        duree       = request.data.get('duree_reelle_min', maintenance.duree_prevue_min)
        observations= request.data.get('observations', '')
        pieces      = request.data.get('pieces_remplacees', '')
        cout        = request.data.get('cout_reel', 0)

        from datetime import date as dt_date
        if date_exec:
            try:
                date_exec = dt_date.fromisoformat(date_exec)
            except Exception:
                date_exec = timezone.now().date()
        else:
            date_exec = timezone.now().date()

        # Creer l execution
        exec_obj = ExecutionMaintenance.objects.create(
            maintenance=maintenance,
            technicien=request.user,
            date_execution=date_exec,
            duree_reelle_min=duree,
            observations=observations,
            pieces_remplacees=pieces,
            cout_reel=cout,
        )
        # Planifier la prochaine
        maintenance.marquer_effectuee(date_execution=date_exec)

        return Response({
            'message':              'Maintenance marquee effectuee.',
            'prochaine_execution':  str(maintenance.prochaine_execution),
            'execution_id':         str(exec_obj.id),
        })

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        today = timezone.now().date()
        total        = MaintenancePreventive.objects.filter(active=True).count()
        en_retard    = MaintenancePreventive.objects.filter(
            active=True, statut='planifiee', prochaine_execution__lt=today
        ).count()
        cette_semaine= MaintenancePreventive.objects.filter(
            active=True, statut='planifiee',
            prochaine_execution__gte=today,
            prochaine_execution__lte=today + timezone.timedelta(days=7),
        ).count()
        par_type     = list(
            MaintenancePreventive.objects.filter(active=True)
            .values('type_maintenance').annotate(nombre=Count('id')).order_by('-nombre')
        )
        return Response({
            'total_planifiees':   total,
            'en_retard':          en_retard,
            'cette_semaine':      cette_semaine,
            'ce_mois':            MaintenancePreventive.objects.filter(
                active=True, statut='planifiee',
                prochaine_execution__gte=today,
                prochaine_execution__lte=today + timezone.timedelta(days=30),
            ).count(),
            'par_type':           par_type,
        })


class ExecutionMaintenanceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = ExecutionMaintenance.objects.select_related('maintenance__machine', 'technicien').all()
    serializer_class   = ExecutionMaintenanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = ['maintenance', 'technicien']
    ordering_fields    = ['date_execution']