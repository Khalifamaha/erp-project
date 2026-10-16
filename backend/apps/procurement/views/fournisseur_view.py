# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, Avg

from ..models import Fournisseur
from ..serializers import FournisseurSerializer


class FournisseurViewSet(viewsets.ModelViewSet):
    """
    GET    /api/procurement/fournisseurs/              -> liste
    POST   /api/procurement/fournisseurs/              -> creer
    GET    /api/procurement/fournisseurs/{id}/         -> detail
    PUT    /api/procurement/fournisseurs/{id}/         -> modifier
    GET    /api/procurement/fournisseurs/{id}/commandes/   -> historique commandes
    GET    /api/procurement/fournisseurs/{id}/factures/    -> factures du fournisseur
    POST   /api/procurement/fournisseurs/{id}/noter/       -> mettre a jour le score qualite
    GET    /api/procurement/fournisseurs/stats/            -> tableau de bord achats
    """
    queryset           = Fournisseur.objects.all()
    serializer_class   = FournisseurSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['statut', 'categorie', 'pays']
    search_fields      = ['code', 'raison_sociale', 'contact', 'email', 'num_fiscal']
    ordering_fields    = ['raison_sociale', 'score_qualite', 'delai_livraison']

    @action(detail=True, methods=['get'], url_path='commandes')
    def commandes(self, request, pk=None):
        from ..serializers import CommandeAchatSerializer
        fournisseur = self.get_object()
        qs = fournisseur.commandes.order_by('-date_commande')
        return Response(CommandeAchatSerializer(qs, many=True).data)

    @action(detail=True, methods=['get'], url_path='factures')
    def factures(self, request, pk=None):
        from ..serializers import FactureAchatSerializer
        fournisseur = self.get_object()
        qs = fournisseur.factures.order_by('-date_facture')
        return Response(FactureAchatSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], url_path='noter')
    def noter(self, request, pk=None):
        fournisseur = self.get_object()
        nouveau_score = request.data.get('score_qualite')
        if nouveau_score is None or not (0 <= int(nouveau_score) <= 100):
            return Response(
                {'error': 'Le score doit etre entre 0 et 100.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        fournisseur.score_qualite = int(nouveau_score)
        fournisseur.save(update_fields=['score_qualite'])
        return Response({
            'message': f"Score mis a jour : {fournisseur.score_qualite}/100",
            'score_qualite': fournisseur.score_qualite,
        })

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        total    = Fournisseur.objects.count()
        actifs   = Fournisseur.objects.filter(statut='actif').count()
        score_moy= Fournisseur.objects.filter(statut='actif').aggregate(
            moy=Avg('score_qualite')
        )['moy']
        top5 = list(
            Fournisseur.objects.filter(statut='actif')
            .annotate(nb_cmd=Count('commandes'))
            .order_by('-nb_cmd')[:5]
            .values('code', 'raison_sociale', 'nb_cmd', 'score_qualite')
        )
        return Response({
            'total_fournisseurs': total,
            'fournisseurs_actifs': actifs,
            'score_qualite_moyen': round(score_moy or 0, 1),
            'top5_par_commandes': top5,
        })