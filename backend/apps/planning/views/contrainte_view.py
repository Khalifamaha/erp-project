# -*- coding: utf-8 -*-
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import ContrainteMachine
from ..serializers import ContrainteMachineSerializer


class ContrainteMachineViewSet(viewsets.ModelViewSet):
    """
    GET    /api/planning/contraintes/                      -> liste
    POST   /api/planning/contraintes/                      -> creer
    GET    /api/planning/contraintes/actives/              -> contraintes en cours
    GET    /api/planning/contraintes/machine/{id}/         -> contraintes d une machine
    GET    /api/planning/contraintes/disponibilite/        -> verifier dispo machine sur creneau
    """
    queryset = ContrainteMachine.objects.select_related('machine', 'cree_par').all()
    serializer_class   = ContrainteMachineSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = ['machine', 'type_contrainte']
    ordering_fields    = ['heure_debut']

    def perform_create(self, serializer):
        serializer.save(cree_par=self.request.user)

    @action(detail=False, methods=['get'], url_path='actives')
    def actives(self, request):
        now = timezone.now()
        qs  = ContrainteMachine.objects.filter(
            heure_debut__lte=now,
            heure_fin__gte=now,
        ).select_related('machine')
        return Response(ContrainteMachineSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='disponibilite')
    def disponibilite(self, request):
        """
        Verifier si une machine est disponible sur un creneau.
        Params : machine_id, heure_debut, heure_fin
        """
        machine_id  = request.query_params.get('machine_id')
        heure_debut = request.query_params.get('heure_debut')
        heure_fin   = request.query_params.get('heure_fin')

        if not all([machine_id, heure_debut, heure_fin]):
            return Response(
                {'error': 'machine_id, heure_debut et heure_fin sont requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from django.utils.dateparse import parse_datetime
        debut = parse_datetime(heure_debut)
        fin   = parse_datetime(heure_fin)

        if not debut or not fin:
            return Response(
                {'error': 'Format datetime invalide (YYYY-MM-DDTHH:MM:SS).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verifier contraintes
        contraintes = ContrainteMachine.objects.filter(
            machine_id=machine_id,
            heure_debut__lt=fin,
            heure_fin__gt=debut,
        )

        # Verifier plannings existants
        from ..models import PlanningProduction
        plannings = PlanningProduction.objects.filter(
            machine_id=machine_id,
            statut__in=['brouillon', 'confirme', 'en_cours'],
            heure_debut_prev__lt=fin,
            heure_fin_prev__gt=debut,
        ).select_related('ordre')

        disponible = not contraintes.exists() and not plannings.exists()

        return Response({
            'machine_id':      machine_id,
            'heure_debut':     heure_debut,
            'heure_fin':       heure_fin,
            'disponible':      disponible,
            'contraintes':     ContrainteMachineSerializer(contraintes, many=True).data,
            'plannings_conflit': [
                {
                    'id':      str(p.id),
                    'of':      p.ordre.numero,
                    'debut':   str(p.heure_debut_prev),
                    'fin':     str(p.heure_fin_prev),
                }
                for p in plannings
            ],
        })