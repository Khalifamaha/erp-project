# -*- coding: utf-8 -*-
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q

from ..models import FactureAchat
from ..serializers import FactureAchatSerializer, PaiementFactureSerializer


class FactureAchatViewSet(viewsets.ModelViewSet):
    """
    GET    /api/procurement/factures/               -> liste
    POST   /api/procurement/factures/               -> creer
    POST   /api/procurement/factures/{id}/payer/    -> enregistrer paiement
    GET    /api/procurement/factures/en_retard/     -> factures en retard
    GET    /api/procurement/factures/a_payer/       -> factures non payees
    GET    /api/procurement/factures/stats/         -> resume financier
    """
    queryset           = FactureAchat.objects.select_related('fournisseur', 'commande').all()
    serializer_class   = FactureAchatSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['fournisseur', 'statut', 'mode_paiement']
    search_fields      = ['numero', 'numero_fournisseur', 'fournisseur__raison_sociale']
    ordering_fields    = ['date_facture', 'date_echeance', 'montant_ttc']

    def perform_create(self, serializer):
        serializer.save(enregistree_par=self.request.user)

    @action(detail=True, methods=['post'], url_path='payer')
    def payer(self, request, pk=None):
        facture    = self.get_object()
        serializer = PaiementFactureSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data    = serializer.validated_data
        montant = float(data['montant'])
        solde   = facture.solde_restant

        if montant > solde:
            return Response(
                {'error': f"Montant ({montant}) superieur au solde restant ({solde})."},
                status=status.HTTP_400_BAD_REQUEST
            )

        facture.montant_paye        = float(facture.montant_paye) + montant
        facture.mode_paiement       = data['mode_paiement']
        facture.reference_paiement  = data.get('reference_paiement', '')
        facture.date_paiement       = data['date_paiement']
        facture.save()  # save() met a jour le statut automatiquement

        return Response({
            'message':      'Paiement enregistre.',
            'montant_paye': str(facture.montant_paye),
            'solde_restant': str(facture.solde_restant),
            'statut':       facture.statut,
        })

    @action(detail=False, methods=['get'], url_path='en_retard')
    def en_retard(self, request):
        today = timezone.now().date()
        qs = FactureAchat.objects.filter(
            date_echeance__lt=today
        ).exclude(statut='payee').select_related('fournisseur')
        return Response(FactureAchatSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='a_payer')
    def a_payer(self, request):
        qs = FactureAchat.objects.exclude(
            statut__in=['payee', 'annulee']
        ).select_related('fournisseur').order_by('date_echeance')
        return Response(FactureAchatSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        today = timezone.now().date()
        qs    = FactureAchat.objects.all()
        return Response({
            'total_factures':     qs.count(),
            'montant_total_ttc':  qs.aggregate(t=Sum('montant_ttc'))['t'] or 0,
            'montant_paye':       qs.aggregate(t=Sum('montant_paye'))['t'] or 0,
            'solde_restant':      qs.exclude(statut='payee').aggregate(
                t=Sum('montant_ttc')
            )['t'] or 0,
            'en_retard':          qs.filter(
                date_echeance__lt=today
            ).exclude(statut='payee').count(),
            'par_statut': list(
                qs.values('statut').annotate(
                    nombre=Count('id'),
                    montant=Sum('montant_ttc')
                ).order_by('statut')
            ),
        })