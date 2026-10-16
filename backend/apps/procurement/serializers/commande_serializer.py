# -*- coding: utf-8 -*-
from decimal import Decimal
from rest_framework import serializers
from ..models import CommandeAchat, LigneCommandeAchat
from .fournisseur_serializer import FournisseurMiniSerializer


class LigneCommandeAchatSerializer(serializers.ModelSerializer):
    produit_reference   = serializers.CharField(source='produit.reference', read_only=True)
    produit_designation = serializers.CharField(source='produit.designation', read_only=True)
    montant_ligne       = serializers.ReadOnlyField()
    quantite_restante   = serializers.ReadOnlyField()

    class Meta:
        model  = LigneCommandeAchat
        fields = [
            'id', 'commande', 'produit', 'produit_reference', 'produit_designation',
            'quantite_commandee', 'quantite_recue', 'quantite_restante',
            'prix_unitaire', 'remise_pct', 'statut',
            'notes_reception', 'montant_ligne',
        ]
        read_only_fields = ['id', 'quantite_recue', 'statut']

    def validate_quantite_commandee(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError("La quantite doit etre superieure a 0.")
        return value

    def validate_prix_unitaire(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError("Le prix unitaire doit etre superieur a 0.")
        return value


class CommandeAchatSerializer(serializers.ModelSerializer):
    fournisseur_detail  = FournisseurMiniSerializer(source='fournisseur', read_only=True)
    lignes              = LigneCommandeAchatSerializer(many=True, read_only=True)
    taux_reception      = serializers.ReadOnlyField()
    cree_par_nom        = serializers.SerializerMethodField()

    class Meta:
        model  = CommandeAchat
        fields = [
            'id', 'numero', 'fournisseur', 'fournisseur_detail',
            'date_commande', 'date_livraison_prev', 'date_livraison_reel',
            'montant_total', 'statut', 'devise', 'cree_par', 'cree_par_nom',
            'approuve_par', 'notes', 'conditions_livraison',
            'date_creation', 'lignes', 'taux_reception',
        ]
        read_only_fields = ['id', 'montant_total', 'date_creation']

    def get_cree_par_nom(self, obj):
        if obj.cree_par:
            return f"{obj.cree_par.prenom} {obj.cree_par.nom}"
        return None


class CommandeAchatCreateSerializer(serializers.ModelSerializer):
    """Serializer creation — accepte les lignes en nested."""
    lignes = LigneCommandeAchatSerializer(many=True, write_only=True)

    class Meta:
        model  = CommandeAchat
        fields = [
            'numero', 'fournisseur', 'date_commande',
            'date_livraison_prev', 'devise', 'notes',
            'conditions_livraison', 'lignes',
        ]

    def create(self, validated_data):
        lignes_data = validated_data.pop('lignes')
        commande    = CommandeAchat.objects.create(**validated_data)
        for ligne_data in lignes_data:
            LigneCommandeAchat.objects.create(commande=commande, **ligne_data)
        commande.recalculer_montant()
        return commande