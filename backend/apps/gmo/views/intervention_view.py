# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from ..models import Intervention
from ..serializers import InterventionSerializer


class InterventionViewSet(viewsets.ModelViewSet):
    """
    GET    /api/gmo/interventions/                 -> liste
    POST   /api/gmo/interventions/                 -> creer
    GET    /api/gmo/interventions/{id}/            -> detail
    POST   /api/gmo/interventions/{id}/cloturer/   -> cloturer + marquer panne resolue
    GET    /api/gmo/interventions/mes_interventions/ -> interventions du technicien connecte
    """
    queryset = Intervention.objects.select_related(
        'panne__machine', 'technicien'
    ).all()
    serializer_class   = InterventionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = ['panne', 'technicien', 'resultat', 'resolu']
    ordering_fields    = ['debut_intervention', 'date_creation']

    def perform_create(self, serializer):
        serializer.save(technicien=self.request.user)

    @action(detail=True, methods=['post'], url_path='cloturer')
    def cloturer(self, request, pk=None):
        """Cloturer une intervention — renseigner resultat et couts."""
        intervention = self.get_object()
        if intervention.fin_intervention:
            return Response(
                {'error': 'Intervention deja cloturee.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        intervention.fin_intervention  = timezone.now()
        intervention.resultat          = request.data.get('resultat', 'resolu')
        intervention.actions_effectuees= request.data.get('actions_effectuees', intervention.actions_effectuees)
        intervention.pieces_utilisees  = request.data.get('pieces_utilisees', '')
        intervention.cout_pieces       = request.data.get('cout_pieces', 0)
        intervention.cout_main_oeuvre  = request.data.get('cout_main_oeuvre', 0)
        intervention.observations      = request.data.get('observations', '')
        intervention.resolu            = intervention.resultat == 'resolu'
        intervention.save()

        return Response({
            'message':              'Intervention cloturee.',
            'resultat':             intervention.resultat,
            'duree_min':            str(intervention.duree_intervention_min),
            'cout_total':           str(intervention.cout_total),
            'panne_statut':         intervention.panne.statut,
        })

    @action(detail=False, methods=['get'], url_path='mes_interventions')
    def mes_interventions(self, request):
        qs = Intervention.objects.filter(
            technicien=request.user
        ).select_related('panne__machine').order_by('-debut_intervention')[:20]
        return Response(InterventionSerializer(qs, many=True).data)