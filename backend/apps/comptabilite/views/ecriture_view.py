# -*- coding: utf-8 -*-
from django.utils import timezone
from django.db.models import Sum, Count, Q
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import EcritureComptable, Facture, PlanComptable
from ..serializers import (
    EcritureComptableSerializer,
    FactureSerializer,
    PaiementFactureSerializer,
)


class EcritureComptableViewSet(viewsets.ModelViewSet):
    """
    GET    /api/comptabilite/ecritures/                 -> liste
    POST   /api/comptabilite/ecritures/                 -> creer
    POST   /api/comptabilite/ecritures/{id}/valider/    -> valider ecriture
    GET    /api/comptabilite/ecritures/grand_livre/     -> grand livre par compte
    GET    /api/comptabilite/ecritures/balance/         -> balance des comptes
    GET    /api/comptabilite/ecritures/journal/         -> journal par type
    """
    queryset = EcritureComptable.objects.select_related(
        'exercice', 'compte_debit', 'compte_credit', 'valide_par'
    ).all()
    serializer_class   = EcritureComptableSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['exercice', 'journal', 'validee', 'periode_comptable']
    search_fields      = ['libelle', 'reference_externe']
    ordering_fields    = ['date_ecriture', 'montant']

    @action(detail=True, methods=['post'], url_path='valider')
    def valider(self, request, pk=None):
        ecriture = self.get_object()
        if ecriture.validee:
            return Response(
                {'error': 'Ecriture deja validee.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        ecriture.validee   = True
        ecriture.valide_par= request.user
        ecriture.save(update_fields=['validee', 'valide_par'])
        return Response({'message': 'Ecriture validee.'})

    @action(detail=False, methods=['get'], url_path='grand_livre')
    def grand_livre(self, request):
        """Grand livre d un compte sur une periode."""
        compte_id  = request.query_params.get('compte_id')
        periode_debut = request.query_params.get('periode_debut')
        periode_fin   = request.query_params.get('periode_fin')

        if not compte_id:
            return Response({'error': 'compte_id requis.'}, status=400)

        try:
            compte = PlanComptable.objects.get(id=compte_id)
        except PlanComptable.DoesNotExist:
            return Response({'error': 'Compte introuvable.'}, status=404)

        qs_debit  = EcritureComptable.objects.filter(compte_debit=compte)
        qs_credit = EcritureComptable.objects.filter(compte_credit=compte)

        if periode_debut:
            qs_debit  = qs_debit.filter(date_ecriture__gte=periode_debut)
            qs_credit = qs_credit.filter(date_ecriture__gte=periode_debut)
        if periode_fin:
            qs_debit  = qs_debit.filter(date_ecriture__lte=periode_fin)
            qs_credit = qs_credit.filter(date_ecriture__lte=periode_fin)

        total_debit  = qs_debit.aggregate(t=Sum('montant'))['t'] or 0
        total_credit = qs_credit.aggregate(t=Sum('montant'))['t'] or 0

        if compte.sens_normal == 'debiteur':
            solde = round(float(total_debit) - float(total_credit), 3)
        else:
            solde = round(float(total_credit) - float(total_debit), 3)

        # Fusionner et trier par date
        ecritures_debit  = list(qs_debit.values(
            'id', 'date_ecriture', 'libelle', 'journal', 'montant', 'validee'
        ))
        for e in ecritures_debit:
            e['sens'] = 'debit'
            e['montant_debit']  = e['montant']
            e['montant_credit'] = 0

        ecritures_credit = list(qs_credit.values(
            'id', 'date_ecriture', 'libelle', 'journal', 'montant', 'validee'
        ))
        for e in ecritures_credit:
            e['sens'] = 'credit'
            e['montant_credit'] = e['montant']
            e['montant_debit']  = 0

        toutes = sorted(
            ecritures_debit + ecritures_credit,
            key=lambda x: x['date_ecriture']
        )

        return Response({
            'compte':       {'numero': compte.numero_compte, 'libelle': compte.libelle},
            'ecritures':    toutes,
            'total_debit':  float(total_debit),
            'total_credit': float(total_credit),
            'solde':        solde,
        })

    @action(detail=False, methods=['get'], url_path='balance')
    def balance(self, request):
        """Balance generale des comptes."""
        exercice_id = request.query_params.get('exercice_id')
        if not exercice_id:
            return Response({'error': 'exercice_id requis.'}, status=400)

        comptes = PlanComptable.objects.filter(
            exercice_id=exercice_id, actif=True
        ).order_by('numero_compte')

        lignes = []
        for c in comptes:
            debit  = EcritureComptable.objects.filter(
                exercice_id=exercice_id, compte_debit=c
            ).aggregate(t=Sum('montant'))['t'] or 0
            credit = EcritureComptable.objects.filter(
                exercice_id=exercice_id, compte_credit=c
            ).aggregate(t=Sum('montant'))['t'] or 0
            if float(debit) > 0 or float(credit) > 0:
                lignes.append({
                    'numero':  c.numero_compte,
                    'libelle': c.libelle,
                    'classe':  c.classe,
                    'debit':   float(debit),
                    'credit':  float(credit),
                    'solde':   round(float(debit) - float(credit), 3),
                })

        total_debit  = sum(l['debit']  for l in lignes)
        total_credit = sum(l['credit'] for l in lignes)

        return Response({
            'lignes':        lignes,
            'total_debit':   round(total_debit, 3),
            'total_credit':  round(total_credit, 3),
            'equilibre':     round(abs(total_debit - total_credit), 3) < 0.01,
        })

    @action(detail=False, methods=['get'], url_path='journal')
    def journal(self, request):
        """Journal par type et periode."""
        journal_type= request.query_params.get('journal', 'ventes')
        periode     = request.query_params.get('periode')
        exercice_id = request.query_params.get('exercice_id')

        qs = EcritureComptable.objects.filter(journal=journal_type)
        if periode:
            qs = qs.filter(periode_comptable=periode)
        if exercice_id:
            qs = qs.filter(exercice_id=exercice_id)

        total = qs.aggregate(t=Sum('montant'))['t'] or 0
        return Response({
            'journal':   journal_type,
            'periode':   periode,
            'ecritures': EcritureComptableSerializer(
                qs.order_by('date_ecriture'), many=True
            ).data,
            'total':     float(total),
            'nb':        qs.count(),
        })


class FactureViewSet(viewsets.ModelViewSet):
    """
    GET    /api/comptabilite/factures/                 -> liste
    POST   /api/comptabilite/factures/                 -> creer
    POST   /api/comptabilite/factures/{id}/payer/      -> enregistrer paiement
    POST   /api/comptabilite/factures/{id}/emettre/    -> emettre la facture
    GET    /api/comptabilite/factures/en_retard/       -> factures en retard
    GET    /api/comptabilite/factures/a_encaisser/     -> non payees
    GET    /api/comptabilite/factures/stats/           -> tableau de bord facturation
    """
    queryset = Facture.objects.all()
    serializer_class   = FactureSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['statut', 'type_facture', 'devise', 'exercice']
    search_fields      = ['numero', 'client_nom']
    ordering_fields    = ['date_emission', 'date_echeance', 'montant_ttc']

    def perform_create(self, serializer):
        serializer.save(cree_par=request.user)

    def perform_create(self, serializer):
        serializer.save(cree_par=self.request.user)

    @action(detail=True, methods=['post'], url_path='emettre')
    def emettre(self, request, pk=None):
        facture = self.get_object()
        if facture.statut != 'brouillon':
            return Response(
                {'error': f"Impossible d emettre une facture {facture.statut}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        facture.statut = 'emise'
        facture.save(update_fields=['statut'])
        # Generer ecritures comptables
        facture.generer_ecritures()
        return Response({
            'message': f"Facture {facture.numero} emise.",
            'statut':  facture.statut,
        })

    @action(detail=True, methods=['post'], url_path='payer')
    def payer(self, request, pk=None):
        facture    = self.get_object()
        serializer = PaiementFactureSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data    = serializer.validated_data
        montant = float(data['montant'])
        if montant > float(facture.solde_restant):
            return Response(
                {'error': f"Montant ({montant}) superieur au solde ({facture.solde_restant})."},
                status=status.HTTP_400_BAD_REQUEST
            )
        facture.montant_paye = float(facture.montant_paye) + montant
        facture.save()
        return Response({
            'message':       'Paiement enregistre.',
            'montant_paye':  str(facture.montant_paye),
            'solde_restant': str(facture.solde_restant),
            'statut':        facture.statut,
        })

    @action(detail=False, methods=['get'], url_path='en_retard')
    def en_retard(self, request):
        today = timezone.now().date()
        qs = Facture.objects.filter(
            date_echeance__lt=today
        ).exclude(statut__in=['payee', 'annulee']).order_by('date_echeance')
        return Response(FactureSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='a_encaisser')
    def a_encaisser(self, request):
        qs = Facture.objects.exclude(
            statut__in=['payee', 'annulee', 'brouillon']
        ).order_by('date_echeance')
        return Response(FactureSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        today = timezone.now().date()
        qs    = Facture.objects.all()
        return Response({
            'total_factures':   qs.count(),
            'ca_total_ht':      float(qs.aggregate(t=Sum('montant_ht'))['t'] or 0),
            'ca_total_ttc':     float(qs.aggregate(t=Sum('montant_ttc'))['t'] or 0),
            'encaisse':         float(qs.aggregate(t=Sum('montant_paye'))['t'] or 0),
            'a_encaisser':      float(qs.exclude(statut__in=['payee','annulee'])
                                        .aggregate(t=Sum('solde_restant'))['t'] or 0),
            'en_retard_nb':     qs.filter(date_echeance__lt=today)
                                  .exclude(statut__in=['payee','annulee']).count(),
            'par_statut':       list(qs.values('statut').annotate(
                                    nb=Count('id'), montant=Sum('montant_ttc')
                                ).order_by('statut')),
        })