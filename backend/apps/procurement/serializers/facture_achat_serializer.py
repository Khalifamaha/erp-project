# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import FactureAchat
from .fournisseur_serializer import FournisseurMiniSerializer


class FactureAchatSerializer(serializers.ModelSerializer):
    fournisseur_detail  = FournisseurMiniSerializer(source='fournisseur', read_only=True)
    solde_restant       = serializers.ReadOnlyField()
    est_en_retard       = serializers.ReadOnlyField()
    commande_numero     = serializers.CharField(source='commande.numero', read_only=True)

    class Meta:
        model  = FactureAchat
        fields = [
            'id', 'numero', 'numero_fournisseur',
            'fournisseur', 'fournisseur_detail',
            'commande', 'commande_numero',
            'date_facture', 'date_echeance',
            'montant_ht', 'taux_tva', 'montant_tva', 'montant_ttc',
            'montant_paye', 'solde_restant', 'statut',
            'mode_paiement', 'reference_paiement', 'date_paiement',
            'notes', 'date_creation', 'est_en_retard',
        ]
        read_only_fields = ['id', 'montant_tva', 'montant_ttc', 'date_creation']

    def validate(self, data):
        if data.get('date_echeance') and data.get('date_facture'):
            if data['date_echeance'] < data['date_facture']:
                raise serializers.ValidationError(
                    "La date d echeance doit etre apres la date de facture."
                )
        return data


class PaiementFactureSerializer(serializers.Serializer):
    """Enregistrer un paiement sur une facture achat."""
    montant             = serializers.DecimalField(max_digits=14, decimal_places=3)
    mode_paiement       = serializers.ChoiceField(choices=FactureAchat.MODE_PAIEMENT)
    reference_paiement  = serializers.CharField(required=False, allow_blank=True)
    date_paiement       = serializers.DateField()