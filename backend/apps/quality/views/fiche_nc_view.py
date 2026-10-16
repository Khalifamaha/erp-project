# -*- coding: utf-8 -*-
from django.utils import timezone
from django.db.models import Count
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import FicheNC, SuiviActionNC
from ..serializers import (
    FicheNCSerializer, FicheNCCreateSerializer,
    SuiviActionNCSerializer, ClotureFicheNCSerializer,
)


class FicheNCViewSet(viewsets.ModelViewSet):
    """
    GET    /api/quality/fiches-nc/                     -> liste
    POST   /api/quality/fiches-nc/                     -> creer
    GET    /api/quality/fiches-nc/{id}/                -> detail + actions 8D
    POST   /api/quality/fiches-nc/{id}/cloturer/       -> cloturer la NC
    POST   /api/quality/fiches-nc/{id}/ajouter_action/ -> ajouter action 8D
    GET    /api/quality/fiches-nc/ouvertes/            -> NC non resolues
    GET    /api/quality/fiches-nc/en_retard/           -> NC depassant delai
    GET    /api/quality/fiches-nc/stats/               -> tableau de bord qualite
    """
    queryset = FicheNC.objects.select_related(
        'produit', 'lot', 'controle', 'responsable',
        'ouverte_par', 'cloturee_par'
    ).prefetch_related('actions').all()
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['statut', 'gravite', 'type_nc', 'produit', 'lot_bloque']
    search_fields      = ['numero_nc', 'produit__reference', 'description_defaut']
    ordering_fields    = ['date_creation', 'gravite', 'delai_resolution']

    def get_serializer_class(self):
        if self.action == 'create':
            return FicheNCCreateSerializer
        return FicheNCSerializer

    def perform_create(self, serializer):
        serializer.save(ouverte_par=self.request.user)

    @action(detail=True, methods=['post'], url_path='cloturer')
    def cloturer(self, request, pk=None):
        fiche      = self.get_object()
        serializer = ClotureFicheNCSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if fiche.statut == 'cloturee':
            return Response(
                {'error': 'Fiche NC deja cloturee.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        fiche.cause_racine      = data['cause_racine']
        fiche.action_corrective = data['action_corrective']
        fiche.action_preventive = data.get('action_preventive', '')
        fiche.save(update_fields=['cause_racine', 'action_corrective', 'action_preventive'])
        fiche.cloturer(user=request.user)

        return Response({
            'message':   f"Fiche {fiche.numero_nc} cloturee.",
            'statut':    fiche.statut,
            'lot_statut': fiche.lot.statut if fiche.lot else None,
        })

    @action(detail=True, methods=['post'], url_path='ajouter_action')
    def ajouter_action(self, request, pk=None):
        fiche = self.get_object()
        if fiche.statut == 'cloturee':
            return Response(
                {'error': 'Impossible d ajouter une action sur une NC cloturee.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        data = request.data.copy()
        data['fiche_nc'] = str(fiche.id)
        serializer = SuiviActionNCSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        action_obj = serializer.save(responsable=request.user)

        # Passer la fiche en cours si elle etait ouverte
        if fiche.statut == 'ouverte':
            fiche.statut = 'en_cours'
            fiche.save(update_fields=['statut'])

        return Response(
            SuiviActionNCSerializer(action_obj).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='valider_action')
    def valider_action(self, request, pk=None):
        action_id = request.data.get('action_id')
        if not action_id:
            return Response({'error': 'action_id requis.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            action_obj = SuiviActionNC.objects.get(id=action_id, fiche_nc_id=pk)
        except SuiviActionNC.DoesNotExist:
            return Response({'error': 'Action introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        nouveau_statut = request.data.get('statut', 'realisee')
        action_obj.statut          = nouveau_statut
        action_obj.date_realisation= timezone.now().date()
        action_obj.resultat        = request.data.get('resultat', '')
        action_obj.save(update_fields=['statut', 'date_realisation', 'resultat'])
        return Response(SuiviActionNCSerializer(action_obj).data)

    @action(detail=False, methods=['get'], url_path='ouvertes')
    def ouvertes(self, request):
        qs = FicheNC.objects.filter(
            statut__in=['ouverte', 'en_cours', 'en_attente']
        ).select_related('produit', 'lot', 'responsable').order_by('-gravite', 'date_creation')
        return Response(FicheNCSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='en_retard')
    def en_retard(self, request):
        today = timezone.now().date()
        qs = FicheNC.objects.filter(
            delai_resolution__lt=today,
            statut__in=['ouverte', 'en_cours'],
        ).select_related('produit', 'responsable').order_by('delai_resolution')
        return Response(FicheNCSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        today = timezone.now().date()
        total     = FicheNC.objects.count()
        ouvertes  = FicheNC.objects.filter(statut__in=['ouverte', 'en_cours']).count()
        cloturees = FicheNC.objects.filter(statut='cloturee').count()
        en_retard = FicheNC.objects.filter(
            delai_resolution__lt=today, statut__in=['ouverte', 'en_cours']
        ).count()
        par_gravite = list(
            FicheNC.objects.values('gravite').annotate(nombre=Count('id')).order_by('gravite')
        )
        par_type = list(
            FicheNC.objects.values('type_nc').annotate(nombre=Count('id')).order_by('-nombre')
        )
        top_produits = list(
            FicheNC.objects.values('produit__reference')
            .annotate(nombre=Count('id'))
            .order_by('-nombre')[:5]
        )
        return Response({
            'total_nc':        total,
            'ouvertes':        ouvertes,
            'cloturees':       cloturees,
            'en_retard':       en_retard,
            'lots_bloques':    FicheNC.objects.filter(lot_bloque=True, statut__in=['ouverte','en_cours']).count(),
            'par_gravite':     par_gravite,
            'par_type':        par_type,
            'top5_produits':   top_produits,
        })


class SuiviActionNCViewSet(viewsets.ModelViewSet):
    queryset = SuiviActionNC.objects.select_related('fiche_nc', 'responsable').all()
    serializer_class   = SuiviActionNCSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['fiche_nc', 'type_action', 'statut', 'responsable']