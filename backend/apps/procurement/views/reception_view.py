# -*- coding: utf-8 -*-
from django.db import transaction
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import Reception, LigneReception, CommandeAchat
from ..serializers import ReceptionSerializer, ReceptionCreateSerializer


class ReceptionViewSet(viewsets.ModelViewSet):
    """
    GET    /api/procurement/receptions/              -> liste
    POST   /api/procurement/receptions/              -> creer une reception
    POST   /api/procurement/receptions/{id}/valider/ -> valider et entrer en stock
    GET    /api/procurement/receptions/{id}/         -> detail
    """
    queryset           = Reception.objects.select_related('commande', 'receptionniste').all()
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = ['commande', 'statut']
    ordering_fields    = ['date_reception']

    def get_serializer_class(self):
        if self.action == 'create':
            return ReceptionCreateSerializer
        return ReceptionSerializer

    def perform_create(self, serializer):
        serializer.save(receptionniste=self.request.user)

    @action(detail=True, methods=['post'], url_path='valider')
    def valider(self, request, pk=None):
        """
        Valider une reception :
        1. Cree les lots dans inventory
        2. Enregistre les mouvements d entree stock
        3. Met a jour les quantites recues sur les lignes de commande
        4. Met a jour le statut de la commande
        """
        reception = self.get_object()
        if reception.statut != 'en_cours':
            return Response(
                {'error': f"Reception deja traitee : {reception.statut}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            lots_crees    = []
            mouvements    = []

            for ligne in reception.lignes.select_related(
                'ligne_commande__produit', 'ligne_commande__commande'
            ):
                produit  = ligne.ligne_commande.produit
                qte_acc  = float(ligne.quantite_acceptee or ligne.quantite_recue)

                if qte_acc <= 0:
                    continue

                # Creer ou recuperer le lot
                from apps.inventory.models import Lot, MouvementStock
                lot = None
                if ligne.numero_lot:
                    lot, _ = Lot.objects.get_or_create(
                        numero_lot=ligne.numero_lot,
                        defaults={
                            'produit':          produit,
                            'quantite_initiale': qte_acc,
                            'quantite_restante': qte_acc,
                            'statut':           'disponible',
                            'origine':          'achat',
                            'fournisseur_nom':  reception.commande.fournisseur.raison_sociale,
                            'date_expiration':  ligne.date_expiration_lot,
                            'cout_unitaire':    ligne.ligne_commande.prix_unitaire,
                        }
                    )
                    ligne.lot_cree = lot
                    ligne.save(update_fields=['lot_cree'])
                    lots_crees.append(lot.numero_lot)

                # Entree stock
                mvt = MouvementStock.enregistrer(
                    produit=produit,
                    type_mouvement='entree_achat',
                    quantite=qte_acc,
                    lot=lot,
                    utilisateur=request.user,
                    reference_doc=reception.numero,
                    motif=f"Reception {reception.numero} — {reception.commande.fournisseur.raison_sociale}",
                    prix_unitaire=ligne.ligne_commande.prix_unitaire,
                    commande_id=reception.commande.id,
                )
                mouvements.append(str(mvt.id))

                # Mettre a jour la ligne de commande
                lca = ligne.ligne_commande
                lca.quantite_recue = float(lca.quantite_recue) + qte_acc
                if float(lca.quantite_recue) >= float(lca.quantite_commandee):
                    lca.statut = 'complete'
                else:
                    lca.statut = 'partielle'
                lca.save(update_fields=['quantite_recue', 'statut'])

            # Statut reception
            reception.statut = 'acceptee'
            reception.save(update_fields=['statut'])

            # Statut commande
            commande  = reception.commande
            toutes_lignes = commande.lignes.all()
            nb_complete   = toutes_lignes.filter(statut='complete').count()
            if nb_complete == toutes_lignes.count():
                commande.statut = 'livree'
            else:
                commande.statut = 'partielle'
            commande.save(update_fields=['statut'])

        return Response({
            'message':      'Reception validee — stock mis a jour.',
            'lots_crees':   lots_crees,
            'mouvements':   mouvements,
            'statut_commande': commande.statut,
        })