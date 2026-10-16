# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum

from ..models import ExerciceComptable, PlanComptable
from ..serializers import (
    ExerciceComptableSerializer,
    PlanComptableSerializer,
)


class ExerciceComptableViewSet(viewsets.ModelViewSet):
    """
    GET    /api/comptabilite/exercices/                -> liste
    POST   /api/comptabilite/exercices/                -> creer
    POST   /api/comptabilite/exercices/{id}/cloturer/  -> cloturer exercice
    POST   /api/comptabilite/exercices/{id}/init_plan/ -> initialiser plan comptable
    GET    /api/comptabilite/exercices/{id}/bilan/     -> bilan simplifie
    GET    /api/comptabilite/exercices/{id}/resultat/  -> compte de resultat
    """
    queryset           = ExerciceComptable.objects.all()
    serializer_class   = ExerciceComptableSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['statut', 'cloture']

    @action(detail=True, methods=['post'], url_path='cloturer')
    def cloturer(self, request, pk=None):
        exercice = self.get_object()
        if exercice.cloture:
            return Response(
                {'error': 'Exercice deja cloture.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        exercice.cloturer(user=request.user)
        return Response({'message': f"Exercice {exercice.libelle} cloture."})

    @action(detail=True, methods=['post'], url_path='init_plan')
    def init_plan(self, request, pk=None):
        """Initialise le plan comptable tunisien standard (SCE)."""
        exercice = self.get_object()
        if exercice.comptes.exists():
            return Response(
                {'error': 'Plan comptable deja initialise pour cet exercice.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        comptes_standard = [
            # Classe 1
            ('101', 'Capital social',                    'passif',  '1', 'crediteur', None),
            ('106', 'Reserves',                          'passif',  '1', 'crediteur', None),
            ('129', 'Resultat de l exercice',            'passif',  '1', 'crediteur', None),
            # Classe 2
            ('215', 'Materiel et outillage',             'actif',   '2', 'debiteur',  None),
            ('218', 'Autres immobilisations corporelles','actif',   '2', 'debiteur',  None),
            ('281', 'Amortissements immobilisations',    'actif',   '2', 'crediteur', None),
            # Classe 3
            ('301', 'Matieres premieres',                'actif',   '3', 'debiteur',  None),
            ('355', 'Produits finis',                    'actif',   '3', 'debiteur',  None),
            # Classe 4
            ('401', 'Fournisseurs',                      'passif',  '4', 'crediteur', None),
            ('411', 'Clients',                           'actif',   '4', 'debiteur',  None),
            ('421', 'Personnel - remuneration due',      'passif',  '4', 'crediteur', None),
            ('431', 'CNSS',                              'passif',  '4', 'crediteur', None),
            ('4437','TVA collectee',                     'passif',  '4', 'crediteur', None),
            ('4456','TVA deductible',                    'actif',   '4', 'debiteur',  None),
            # Classe 5
            ('512', 'Banque',                            'actif',   '5', 'debiteur',  None),
            ('530', 'Caisse',                            'actif',   '5', 'debiteur',  None),
            # Classe 6
            ('601', 'Achats matieres premieres',         'charge',  '6', 'debiteur',  None),
            ('621', 'Loyers et charges locatives',       'charge',  '6', 'debiteur',  None),
            ('641', 'Remunerations du personnel',        'charge',  '6', 'debiteur',  None),
            ('645', 'Charges sociales patronales',       'charge',  '6', 'debiteur',  None),
            ('681', 'Dotations aux amortissements',      'charge',  '6', 'debiteur',  None),
            # Classe 7
            ('707', 'Ventes de produits finis',          'produit', '7', 'crediteur', None),
            ('708', 'Produits des activites annexes',    'produit', '7', 'crediteur', None),
        ]
        crees = []
        for numero, libelle, type_c, classe, sens, parent in comptes_standard:
            c = PlanComptable.objects.create(
                exercice=exercice,
                numero_compte=numero,
                libelle=libelle,
                type_compte=type_c,
                classe=classe,
                sens_normal=sens,
                actif=True,
            )
            crees.append(numero)
        return Response({
            'message': f"{len(crees)} comptes initialises.",
            'comptes': crees,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='bilan')
    def bilan(self, request, pk=None):
        """Bilan simplifie actif/passif."""
        exercice = self.get_object()
        comptes  = exercice.comptes.filter(actif=True)

        actif  = []
        passif = []
        for c in comptes:
            s = c.solde
            if s != 0:
                ligne = {'numero': c.numero_compte, 'libelle': c.libelle, 'solde': s}
                if c.type_compte == 'actif':
                    actif.append(ligne)
                elif c.type_compte == 'passif':
                    passif.append(ligne)

        total_actif  = sum(l['solde'] for l in actif)
        total_passif = sum(l['solde'] for l in passif)

        return Response({
            'exercice':     str(exercice),
            'actif':        actif,
            'passif':       passif,
            'total_actif':  round(total_actif, 3),
            'total_passif': round(total_passif, 3),
            'equilibre':    round(abs(total_actif - total_passif), 3) < 0.01,
        })

    @action(detail=True, methods=['get'], url_path='resultat')
    def resultat(self, request, pk=None):
        """Compte de resultat charges/produits."""
        exercice = self.get_object()
        comptes  = exercice.comptes.filter(actif=True)

        charges = []
        produits= []
        for c in comptes:
            s = c.solde
            if s != 0:
                ligne = {'numero': c.numero_compte, 'libelle': c.libelle, 'solde': s}
                if c.type_compte == 'charge':
                    charges.append(ligne)
                elif c.type_compte == 'produit':
                    produits.append(ligne)

        total_charges = sum(l['solde'] for l in charges)
        total_produits= sum(l['solde'] for l in produits)
        resultat_net  = round(total_produits - total_charges, 3)

        return Response({
            'exercice':        str(exercice),
            'charges':         charges,
            'produits':        produits,
            'total_charges':   round(total_charges, 3),
            'total_produits':  round(total_produits, 3),
            'resultat_net':    resultat_net,
            'benefice':        resultat_net > 0,
        })


class PlanComptableViewSet(viewsets.ModelViewSet):
    queryset           = PlanComptable.objects.select_related('exercice', 'compte_parent').all()
    serializer_class   = PlanComptableSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields   = ['exercice', 'type_compte', 'classe', 'actif']
    search_fields      = ['numero_compte', 'libelle']