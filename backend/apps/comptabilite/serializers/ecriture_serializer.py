# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import EcritureComptable, Facture
from .exercice_serializer import PlanComptableMiniSerializer


class EcritureComptableSerializer(serializers.ModelSerializer):
    compte_debit_detail  = PlanComptableMiniSerializer(source='compte_debit',  read_only=True)
    compte_credit_detail = PlanComptableMiniSerializer(source='compte_credit', read_only=True)
    valide_par_nom       = serializers.SerializerMethodField()

    class Meta:
        model  = EcritureComptable
        fields = [
            'id', 'exercice',
            'compte_debit', 'compte_debit_detail',
            'compte_credit', 'compte_credit_detail',
            'facture_achat_id', 'facture_vente_id', 'paiement_employe_id',
            'montant', 'date_ecriture', 'libelle', 'journal',
            'periode_comptable', 'validee', 'valide_par', 'valide_par_nom',
            'reference_externe', 'date_creation',
        ]
        read_only_fields = ['id', 'periode_comptable', 'date_creation']

    def get_valide_par_nom(self, obj):
        if obj.valide_par:
            return f"{obj.valide_par.prenom} {obj.valide_par.nom}"
        return None

    def validate(self, data):
        if data.get('compte_debit') == data.get('compte_credit'):
            raise serializers.ValidationError(
                "Le compte debit et le compte credit ne peuvent pas etre identiques."
            )
        if data.get('montant', 0) <= 0:
            raise serializers.ValidationError("Le montant doit etre positif.")
        return data


class FactureSerializer(serializers.ModelSerializer):
    est_en_retard   = serializers.ReadOnlyField()
    cree_par_nom    = serializers.SerializerMethodField()

    class Meta:
        model  = Facture
        fields = [
            'id', 'numero', 'type_facture',
            'client_id', 'client_nom', 'commande_client_id',
            'exercice', 'date_emission', 'date_echeance',
            'montant_ht', 'taux_tva', 'montant_tva',
            'montant_ttc', 'montant_paye', 'solde_restant',
            'statut', 'devise', 'notes',
            'cree_par', 'cree_par_nom', 'date_creation',
            'est_en_retard',
        ]
        read_only_fields = [
            'id', 'montant_tva', 'montant_ttc',
            'solde_restant', 'date_creation',
        ]

    def get_cree_par_nom(self, obj):
        if obj.cree_par:
            return f"{obj.cree_par.prenom} {obj.cree_par.nom}"
        return None


class PaiementFactureSerializer(serializers.Serializer):
    montant    = serializers.DecimalField(max_digits=14, decimal_places=3)
    date_paiement = serializers.DateField()
    reference  = serializers.CharField(required=False, allow_blank=True)


class GrandLivreSerializer(serializers.Serializer):
    """Serializer pour le grand livre d un compte."""
    compte_numero = serializers.CharField()
    compte_libelle= serializers.CharField()
    ecritures     = EcritureComptableSerializer(many=True)
    total_debit   = serializers.DecimalField(max_digits=14, decimal_places=3)
    total_credit  = serializers.DecimalField(max_digits=14, decimal_places=3)
    solde         = serializers.DecimalField(max_digits=14, decimal_places=3)