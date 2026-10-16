# -*- coding: utf-8 -*-
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import Pointage, Employe
from ..serializers import (
    PointageSerializer,
    PointageEntreeSerializer,
    PointageSortieSerializer,
)


class PointageViewSet(viewsets.ModelViewSet):
    """
    GET  /api/hr/pointages/              → liste (filtrable par date, employe, statut)
    POST /api/hr/pointages/entree/       → scan entrée (interface opérateur)
    POST /api/hr/pointages/sortie/       → scan sortie
    POST /api/hr/pointages/{id}/valider/ → validation chef
    GET  /api/hr/pointages/du_jour/      → pointages du jour
    """
    queryset           = Pointage.objects.select_related('employe').all()
    serializer_class   = PointageSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = ['employe', 'date', 'statut', 'type']
    ordering_fields    = ['date', 'heure_entree']

    @action(detail=False, methods=['post'], url_path='entree')
    def entree(self, request):
        """Enregistrer l'entrée d'un employé — depuis l'interface opérateur."""
        serializer = PointageEntreeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            employe = Employe.objects.get(id=data['employe_id'])
        except Employe.DoesNotExist:
            return Response({'error': 'Employé introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        # Vérifier qu'il n'a pas déjà un pointage ouvert aujourd'hui
        aujourd_hui = timezone.now().date()
        pointage_ouvert = Pointage.objects.filter(
            employe=employe, date=aujourd_hui, heure_sortie__isnull=True
        ).first()
        if pointage_ouvert:
            return Response(
                {'error': 'Un pointage est déjà en cours pour cet employé.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        now = timezone.now()
        pointage = Pointage.objects.create(
            employe=employe,
            chaine_id=data.get('chaine_id'),
            date=aujourd_hui,
            heure_entree=now,
            type=data.get('type', 'normal'),
            statut='en_cours',
        )
        return Response(
            PointageSerializer(pointage).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['post'], url_path='sortie')
    def sortie(self, request):
        """Enregistrer la sortie d'un employé."""
        serializer = PointageSortieSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            pointage = Pointage.objects.get(
                id=serializer.validated_data['pointage_id'],
                heure_sortie__isnull=True
            )
        except Pointage.DoesNotExist:
            return Response(
                {'error': 'Pointage ouvert introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )

        pointage.heure_sortie = timezone.now()
        pointage.statut = 'termine'
        pointage.save()  # save() calcule les heures automatiquement

        return Response(PointageSerializer(pointage).data)

    @action(detail=True, methods=['post'], url_path='valider')
    def valider(self, request, pk=None):
        """Chef valide un pointage."""
        pointage = self.get_object()
        if pointage.statut != 'termine':
            return Response(
                {'error': 'Seul un pointage terminé peut être validé.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        pointage.statut    = 'valide'
        pointage.valide_par = request.user
        pointage.save(update_fields=['statut', 'valide_par'])
        return Response({'message': 'Pointage validé.'})

    @action(detail=False, methods=['get'], url_path='du_jour')
    def du_jour(self, request):
        """Tous les pointages d'aujourd'hui."""
        aujourd_hui = timezone.now().date()
        qs = Pointage.objects.filter(date=aujourd_hui).select_related('employe')
        return Response(PointageSerializer(qs, many=True).data)