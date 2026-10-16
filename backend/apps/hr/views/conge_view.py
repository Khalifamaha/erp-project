# -*- coding: utf-8 -*-
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import Conge
from ..serializers import CongeSerializer, CongeDecisionSerializer


class CongeViewSet(viewsets.ModelViewSet):
    """
    GET  /api/hr/conges/                  → liste
    POST /api/hr/conges/                  → demander un congé
    POST /api/hr/conges/{id}/decision/    → approuver ou refuser (RH)
    GET  /api/hr/conges/en_attente/       → congés en attente de validation
    """
    queryset           = Conge.objects.select_related('employe').all()
    serializer_class   = CongeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = ['employe', 'statut', 'type_conge']
    ordering_fields    = ['date_demande', 'date_debut']

    @action(detail=True, methods=['post'], url_path='decision')
    def decision(self, request, pk=None):
        """RH approuve ou refuse un congé."""
        conge      = self.get_object()
        serializer = CongeDecisionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if conge.statut != 'en_attente':
            return Response(
                {'error': 'Ce congé a déjà été traité.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        conge.statut        = serializer.validated_data['decision']
        conge.approuve_par  = request.user
        conge.date_decision = timezone.now()
        conge.commentaire_rh= serializer.validated_data.get('commentaire_rh', '')
        conge.save()

        return Response({
            'message': f"Congé {conge.statut}.",
            'conge': CongeSerializer(conge).data,
        })

    @action(detail=False, methods=['get'], url_path='en_attente')
    def en_attente(self, request):
        """Liste des congés en attente de décision."""
        qs = Conge.objects.filter(statut='en_attente').select_related('employe')
        return Response(CongeSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], url_path='annuler')
    def annuler(self, request, pk=None):
        """L'employé annule sa propre demande (si en attente)."""
        conge = self.get_object()
        if conge.statut != 'en_attente':
            return Response(
                {'error': 'Seule une demande en attente peut être annulée.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        conge.statut = 'annule'
        conge.save(update_fields=['statut'])
        return Response({'message': 'Demande de congé annulée.'})