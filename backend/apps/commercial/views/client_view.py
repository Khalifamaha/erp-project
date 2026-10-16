# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, Avg

from ..models import Client
from ..serializers import ClientSerializer, CommandeMiniSerializer


class ClientViewSet(viewsets.ModelViewSet):
    """
    GET    /api/commercial/clients/                    -> liste
    POST   /api/commercial/clients/                    -> creer
    GET    /api/commercial/clients/{id}/               -> detail
    GET    /api/commercial/clients/{id}/commandes/     -> historique commandes
    GET    /api/commercial/clients/{id}/factures/      -> factures du client
    POST   /api/commercial/clients/{id}/noter/         -> mettre a jour score
    GET    /api/commercial/clients/stats/              -> tableau de bord commercial
    """
    queryset           = Client.objects.all()
    serializer_class   = ClientSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['statut', 'type', 'pays']
    search_fields      = ['code', 'raison_sociale', 'contact_principal', 'email', 'num_fiscal']
    ordering_fields    = ['raison_sociale', 'score_credit', 'date_creation']

    @action(detail=True, methods=['get'], url_path='commandes')
    def commandes(self, request, pk=None):
        client = self.get_object()
        qs     = client.commandes.order_by('-date_commande')
        return Response(CommandeMiniSerializer(qs, many=True).data)

    @action(detail=True, methods=['get'], url_path='factures')
    def factures(self, request, pk=None):
        client = self.get_object()
        try:
            from apps.comptabilite.models import Facture
            from apps.comptabilite.serializers import FactureSerializer
            qs = Facture.objects.filter(client_id=client.id).order_by('-date_emission')
            return Response(FactureSerializer(qs, many=True).data)
        except Exception:
            return Response([])

    @action(detail=True, methods=['post'], url_path='noter')
    def noter(self, request, pk=None):
        client     = self.get_object()
        nouveau    = request.data.get('score_credit')
        if nouveau is None or not (0 <= int(nouveau) <= 100):
            return Response(
                {'error': 'Score doit etre entre 0 et 100.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        client.score_credit = int(nouveau)
        client.save(update_fields=['score_credit'])
        return Response({'message': f"Score mis a jour : {client.score_credit}/100"})

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        total   = Client.objects.count()
        actifs  = Client.objects.filter(statut='actif').count()
        score   = Client.objects.filter(statut='actif').aggregate(moy=Avg('score_credit'))['moy']
        top5    = list(
            Client.objects.filter(statut='actif')
            .annotate(nb_cmd=Count('commandes'))
            .order_by('-nb_cmd')[:5]
            .values('code', 'raison_sociale', 'nb_cmd', 'score_credit')
        )
        ca_par_pays = list(
            Client.objects.values('pays')
            .annotate(nb=Count('id'))
            .order_by('-nb')[:10]
        )
        return Response({
            'total_clients':      total,
            'clients_actifs':     actifs,
            'score_moyen':        round(score or 0, 1),
            'top5_par_commandes': top5,
            'repartition_pays':   ca_par_pays,
        })