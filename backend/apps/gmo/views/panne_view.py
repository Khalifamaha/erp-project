# -*- coding: utf-8 -*-
from django.utils import timezone
from django.db.models import Sum, Avg, Count, F, ExpressionWrapper, DurationField
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import Panne
from ..serializers import (
    PanneSerializer, PanneMiniSerializer, DeclarationPanneSerializer,
)


class PanneViewSet(viewsets.ModelViewSet):
    """
    GET    /api/gmo/pannes/                    -> liste
    POST   /api/gmo/pannes/                    -> declarer panne complete
    POST   /api/gmo/pannes/declarer/           -> declaration rapide operateur
    GET    /api/gmo/pannes/actives/            -> pannes non resolues
    GET    /api/gmo/pannes/stats/              -> statistiques + MTBF/MTTR
    POST   /api/gmo/pannes/{id}/assigner/      -> assigner un technicien
    POST   /api/gmo/pannes/{id}/cloturer/      -> cloturer manuellement
    GET    /api/gmo/pannes/{id}/interventions/ -> interventions liees
    """
    queryset = Panne.objects.select_related(
        'machine', 'chaine', 'declare_par'
    ).prefetch_related('interventions').all()
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['machine', 'chaine', 'statut', 'type_panne', 'gravite']
    search_fields      = ['machine__code', 'machine__nom', 'description']
    ordering_fields    = ['date_debut', 'gravite', 'duree_minutes']

    def get_serializer_class(self):
        if self.action == 'list':
            return PanneMiniSerializer
        return PanneSerializer

    def perform_create(self, serializer):
        serializer.save(declare_par=self.request.user)

    @action(detail=False, methods=['post'], url_path='declarer')
    def declarer(self, request):
        """Declaration rapide depuis l interface operateur — minimum de champs."""
        serializer = DeclarationPanneSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        panne = serializer.save(declare_par=request.user)

        # Notifier les techniciens et la direction
        self._notifier_panne(panne, request.user)

        return Response(PanneSerializer(panne).data, status=status.HTTP_201_CREATED)

    def _notifier_panne(self, panne, declarant):
        try:
            from apps.accounts.models import Notification, User
            destinataires = User.objects.filter(
                user_roles__role__niveau__in=['direction', 'chef', 'technicien'],
                user_roles__actif=True,
                is_active=True,
            ).exclude(id=declarant.id).distinct()
            for user in destinataires:
                Notification.objects.create(
                    destinataire=user,
                    type='PANNE',
                    titre=f"Panne {panne.gravite} — {panne.machine.code}",
                    message=(
                        f"Panne declaree sur {panne.machine.nom} "
                        f"par {declarant.nom_complet}. "
                        f"Type : {panne.type_panne}. "
                        f"Arret production : {'Oui' if panne.arret_production else 'Non'}."
                    ),
                    priorite='critique' if panne.gravite == 'critique' else 'haute',
                    module_source='gmo',
                    data={
                        'panne_id':   str(panne.id),
                        'machine_id': str(panne.machine.id),
                        'gravite':    panne.gravite,
                    }
                )
        except Exception:
            pass

    @action(detail=False, methods=['get'], url_path='actives')
    def actives(self, request):
        qs = Panne.objects.filter(
            statut__in=['declaree', 'assignee', 'en_cours']
        ).select_related('machine', 'chaine').order_by('-gravite', 'date_debut')
        return Response(PanneSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], url_path='assigner')
    def assigner(self, request, pk=None):
        panne        = self.get_object()
        technicien_id= request.data.get('technicien_id')
        if not technicien_id:
            return Response(
                {'error': 'technicien_id requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        panne.statut = 'assignee'
        panne.save(update_fields=['statut'])

        # Creer automatiquement une intervention
        from apps.accounts.models import User
        try:
            tech = User.objects.get(id=technicien_id)
            from ..models import Intervention
            Intervention.objects.create(
                panne=panne,
                technicien=tech,
                debut_intervention=timezone.now(),
                actions_effectuees='Intervention en cours...',
                resultat='resolu',
            )
            panne.statut = 'en_cours'
            panne.save(update_fields=['statut'])
        except User.DoesNotExist:
            return Response({'error': 'Technicien introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'message': f"Panne assignee. Intervention creee.", 'statut': panne.statut})

    @action(detail=True, methods=['post'], url_path='cloturer')
    def cloturer(self, request, pk=None):
        panne = self.get_object()
        if panne.statut == 'resolue':
            return Response({'error': 'Panne deja resolue.'}, status=status.HTTP_400_BAD_REQUEST)
        panne.date_fin = timezone.now()
        panne.statut   = 'resolue'
        panne.save()
        return Response({
            'message':       'Panne cloturee.',
            'duree_minutes': str(panne.duree_minutes),
            'pieces_perdues': str(panne.pieces_perdues),
        })

    @action(detail=True, methods=['get'], url_path='interventions')
    def interventions(self, request, pk=None):
        from ..serializers import InterventionSerializer
        panne = self.get_object()
        qs    = panne.interventions.select_related('technicien').order_by('-debut_intervention')
        return Response(InterventionSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Statistiques pannes + calcul MTBF et MTTR."""
        machine_id = request.query_params.get('machine_id')
        qs = Panne.objects.all()
        if machine_id:
            qs = qs.filter(machine_id=machine_id)

        total         = qs.count()
        resolues      = qs.filter(statut='resolue')
        actives       = qs.filter(statut__in=['declaree', 'assignee', 'en_cours']).count()
        duree_moy     = resolues.aggregate(moy=Avg('duree_minutes'))['moy'] or 0
        pieces_perdues= qs.aggregate(total=Sum('pieces_perdues'))['total'] or 0
        cout_total    = qs.aggregate(total=Sum('cout_estime'))['total'] or 0

        par_type      = list(qs.values('type_panne').annotate(nombre=Count('id')).order_by('-nombre'))
        par_machine   = list(
            qs.values('machine__code', 'machine__nom')
            .annotate(nombre=Count('id'), duree_tot=Sum('duree_minutes'))
            .order_by('-nombre')[:10]
        )

        # MTBF (Mean Time Between Failures) — simplifie sur 30 jours
        nb_pannes_30j = qs.filter(
            date_debut__gte=timezone.now() - timezone.timedelta(days=30)
        ).count()
        mtbf_h = round((30 * 24) / nb_pannes_30j, 1) if nb_pannes_30j > 0 else None

        # MTTR (Mean Time To Repair)
        mttr_min = round(float(duree_moy), 1)

        return Response({
            'total_pannes':    total,
            'pannes_actives':  actives,
            'pannes_resolues': resolues.count(),
            'duree_moy_min':   round(float(duree_moy), 1),
            'pieces_perdues':  float(pieces_perdues),
            'cout_total_dt':   float(cout_total),
            'mtbf_heures':     mtbf_h,
            'mttr_minutes':    mttr_min,
            'par_type_panne':  par_type,
            'top10_machines':  par_machine,
        })