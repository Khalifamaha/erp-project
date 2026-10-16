# -*- coding: utf-8 -*-
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import Camion, Expedition, LigneExpedition
from ..serializers import (
    CamionSerializer,
    ExpeditionSerializer,
    ExpeditionCreateSerializer,
    LigneExpeditionSerializer,
)


class CamionViewSet(viewsets.ModelViewSet):
    """
    GET    /api/commercial/camions/                        -> liste
    POST   /api/commercial/camions/                        -> creer
    GET    /api/commercial/camions/disponibles/            -> camions disponibles
    POST   /api/commercial/camions/{id}/changer_statut/    -> changer statut
    """
    queryset           = Camion.objects.all()
    serializer_class   = CamionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields   = ['statut']
    search_fields      = ['immatriculation', 'marque', 'chauffeur_nom']

    @action(detail=False, methods=['get'], url_path='disponibles')
    def disponibles(self, request):
        qs = Camion.objects.filter(statut='disponible')
        return Response(CamionSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], url_path='changer_statut')
    def changer_statut(self, request, pk=None):
        camion  = self.get_object()
        nouveau = request.data.get('statut')
        choix   = [c[0] for c in Camion.STATUT_CHOICES]
        if nouveau not in choix:
            return Response(
                {'error': f"Statut invalide. Choix: {choix}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        camion.statut = nouveau
        camion.save(update_fields=['statut'])
        return Response({'message': f"Statut mis a jour: {nouveau}"})


class ExpeditionViewSet(viewsets.ModelViewSet):
    """
    GET    /api/commercial/expeditions/                    -> liste
    POST   /api/commercial/expeditions/                    -> creer
    GET    /api/commercial/expeditions/{id}/               -> detail + lignes
    POST   /api/commercial/expeditions/{id}/charger/       -> marquer chargee
    POST   /api/commercial/expeditions/{id}/partir/        -> marquer en route
    POST   /api/commercial/expeditions/{id}/livrer/        -> confirmer livraison
    GET    /api/commercial/expeditions/en_route/           -> expeditions en cours
    GET    /api/commercial/expeditions/stats/              -> statistiques
    """
    queryset = Expedition.objects.select_related(
        'camion', 'commande_client__client', 'responsable'
    ).prefetch_related('lignes').all()
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['statut', 'camion', 'pays_destination']
    search_fields      = ['numero', 'destination', 'numero_bl', 'numero_douane']
    ordering_fields    = ['date_depart', 'date_arrivee_prev']

    def get_serializer_class(self):
        if self.action == 'create':
            return ExpeditionCreateSerializer
        return ExpeditionSerializer

    def perform_create(self, serializer):
        serializer.save(responsable=self.request.user)

    def _transition_statut(self, pk, nouveau, autorises, msg, extra_fields=None):
        exp = self.get_object()
        if exp.statut not in autorises:
            return Response(
                {'error': f"Impossible depuis '{exp.statut}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        exp.statut = nouveau
        fields = ['statut']
        if extra_fields:
            for k, v in extra_fields.items():
                setattr(exp, k, v)
                fields.append(k)
        exp.save(update_fields=fields)
        return Response({'message': msg, 'statut': nouveau})

    @action(detail=True, methods=['post'], url_path='charger')
    def charger(self, request, pk=None):
        return self._transition_statut(
            pk, 'chargee', ['preparee'], 'Expedition chargee.'
        )

    @action(detail=True, methods=['post'], url_path='partir')
    def partir(self, request, pk=None):
        exp = self.get_object()
        if exp.camion:
            exp.camion.statut = 'en_route'
            exp.camion.save(update_fields=['statut'])
        return self._transition_statut(
            pk, 'en_route', ['chargee'], 'Expedition en route.'
        )

    @action(detail=True, methods=['post'], url_path='livrer')
    def livrer(self, request, pk=None):
        date_arrivee = request.data.get('date_arrivee', str(timezone.now().date()))
        from datetime import date as dt_date
        try:
            date_arr = dt_date.fromisoformat(date_arrivee)
        except ValueError:
            date_arr = timezone.now().date()

        exp = self.get_object()
        # Liberer le camion
        if exp.camion:
            exp.camion.statut = 'disponible'
            exp.camion.save(update_fields=['statut'])

        # Mettre a jour quantites livrees sur la commande
        if exp.commande_client:
            for ligne_exp in exp.lignes.all():
                try:
                    ligne_cmd = exp.commande_client.lignes.get(produit=ligne_exp.produit)
                    ligne_cmd.quantite_livree = (
                        float(ligne_cmd.quantite_livree) + float(ligne_exp.quantite)
                    )
                    if float(ligne_cmd.quantite_livree) >= float(ligne_cmd.quantite_commandee):
                        ligne_cmd.statut = 'livree'
                    else:
                        ligne_cmd.statut = 'partielle'
                    ligne_cmd.save(update_fields=['quantite_livree', 'statut'])
                except Exception:
                    pass

            # Mettre a jour statut commande
            cmd = exp.commande_client
            cmd.recalculer_montant()
            if cmd.taux_livraison >= 100:
                cmd.statut = 'livree'
            else:
                cmd.statut = 'partielle'
            cmd.save(update_fields=['statut'])

        return self._transition_statut(
            pk, 'livree', ['en_route', 'chargee'],
            'Expedition livree.',
            extra_fields={'date_arrivee_reel': date_arr}
        )

    @action(detail=False, methods=['get'], url_path='en_route')
    def en_route(self, request):
        qs = Expedition.objects.filter(
            statut__in=['chargee', 'en_route']
        ).select_related('camion', 'commande_client__client').order_by('date_arrivee_prev')
        return Response(ExpeditionSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        from django.db.models import Count, Sum
        qs = Expedition.objects.all()
        return Response({
            'total':             qs.count(),
            'en_cours':          qs.filter(statut__in=['preparee','chargee','en_route']).count(),
            'livrees':           qs.filter(statut='livree').count(),
            'poids_total':       float(qs.aggregate(t=Sum('poids_total'))['t'] or 0),
            'valeur_totale':     float(qs.aggregate(t=Sum('valeur_totale'))['t'] or 0),
            'par_statut':        list(qs.values('statut').annotate(nb=Count('id'))),
            'par_pays':          list(
                qs.values('pays_destination')
                .annotate(nb=Count('id'))
                .order_by('-nb')[:10]
            ),
        })