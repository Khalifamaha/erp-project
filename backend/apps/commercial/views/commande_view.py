# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum

from ..models import CommandeClient, LigneCommandeClient
from ..serializers import (
    CommandeClientSerializer,
    CommandeClientCreateSerializer,
    CommandeMiniSerializer,
)


class CommandeClientViewSet(viewsets.ModelViewSet):
    """
    GET    /api/commercial/commandes/                      -> liste
    POST   /api/commercial/commandes/                      -> creer avec lignes
    GET    /api/commercial/commandes/{id}/                 -> detail
    POST   /api/commercial/commandes/{id}/confirmer/       -> confirmer
    POST   /api/commercial/commandes/{id}/lancer_of/       -> creer OF depuis commande
    POST   /api/commercial/commandes/{id}/annuler/         -> annuler
    GET    /api/commercial/commandes/{id}/expeditions/     -> expeditions liees
    GET    /api/commercial/commandes/en_attente/           -> commandes non livrees
    GET    /api/commercial/commandes/stats/                -> CA par periode
    """
    queryset = CommandeClient.objects.select_related(
        'client', 'commercial'
    ).prefetch_related('lignes').all()
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['client', 'statut', 'devise']
    search_fields      = ['numero', 'client__raison_sociale']
    ordering_fields    = ['date_commande', 'montant_total', 'date_livraison_confirmee']

    def get_serializer_class(self):
        if self.action == 'create':
            return CommandeClientCreateSerializer
        if self.action == 'list':
            return CommandeMiniSerializer
        return CommandeClientSerializer

    def perform_create(self, serializer):
        serializer.save(commercial=self.request.user)

    def _transition(self, pk, nouveau, autorises, msg):
        cmd = self.get_object()
        if cmd.statut not in autorises:
            return Response(
                {'error': f"Impossible depuis '{cmd.statut}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        cmd.statut = nouveau
        cmd.save(update_fields=['statut'])
        return Response({'message': msg, 'statut': nouveau})

    @action(detail=True, methods=['post'], url_path='confirmer')
    def confirmer(self, request, pk=None):
        return self._transition(pk, 'confirmee', ['brouillon'], 'Commande confirmee.')

    @action(detail=True, methods=['post'], url_path='annuler')
    def annuler(self, request, pk=None):
        return self._transition(
            pk, 'annulee', ['brouillon', 'confirmee'], 'Commande annulee.'
        )

    @action(detail=True, methods=['post'], url_path='lancer_of')
    def lancer_of(self, request, pk=None):
        """Creer un OF pour chaque ligne de la commande."""
        commande = self.get_object()
        if commande.statut not in ['confirmee', 'en_cours']:
            return Response(
                {'error': "La commande doit etre confirmee."},
                status=status.HTTP_400_BAD_REQUEST
            )
        from apps.production.models import OrdreFabrication, GammeOperatoire
        from django.utils import timezone
        ofs_crees = []
        for i, ligne in enumerate(commande.lignes.filter(statut='en_attente')):
            gamme = GammeOperatoire.objects.filter(
                produit=ligne.produit, active=True
            ).first()
            if not gamme:
                continue
            numero_of = f"OF-CMD-{commande.numero}-{i+1:02d}"
            of = OrdreFabrication.objects.create(
                numero=numero_of,
                produit=ligne.produit,
                gamme=gamme,
                commande_client_id=commande.id,
                quantite_prevue=ligne.quantite_restante,
                date_debut_prev=timezone.now().date(),
                date_fin_prev=ligne.date_livraison_prev or commande.date_livraison_confirmee,
                statut='planifie',
                priorite=2,
                responsable=request.user,
                notes_operateur=f"OF genere depuis commande {commande.numero}",
            )
            ofs_crees.append(numero_of)
            ligne.statut = 'en_cours'
            ligne.save(update_fields=['statut'])

        if not ofs_crees:
            return Response({'error': 'Aucun OF cree — lignes deja en cours ou gamme manquante.'}, status=400)

        commande.statut = 'en_cours'
        commande.save(update_fields=['statut'])

        return Response({
            'message': f"{len(ofs_crees)} OF cree(s).",
            'ordres':  ofs_crees,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='expeditions')
    def expeditions(self, request, pk=None):
        from ..serializers import ExpeditionSerializer
        commande = self.get_object()
        qs = commande.expeditions.order_by('-date_depart')
        return Response(ExpeditionSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='en_attente')
    def en_attente(self, request):
        qs = CommandeClient.objects.filter(
            statut__in=['confirmee', 'en_cours', 'partielle']
        ).select_related('client').order_by('date_livraison_confirmee')
        return Response(CommandeMiniSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        from django.db.models import Count, Sum
        qs = CommandeClient.objects.all()
        return Response({
            'total':         qs.count(),
            'ca_total':      float(qs.aggregate(t=Sum('montant_total'))['t'] or 0),
            'en_cours':      qs.filter(statut__in=['confirmee','en_cours','partielle']).count(),
            'livrees':       qs.filter(statut='livree').count(),
            'par_statut':    list(qs.values('statut').annotate(
                                 nb=Count('id'), ca=Sum('montant_total')
                             ).order_by('statut')),
            'top5_clients':  list(
                qs.values('client__raison_sociale')
                .annotate(nb=Count('id'), ca=Sum('montant_total'))
                .order_by('-ca')[:5]
            ),
        })