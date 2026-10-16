# -*- coding: utf-8 -*-
from decimal import Decimal
from rest_framework import serializers
from ..models import CommandeClient, LigneCommandeClient
from .client_serializer import ClientMiniSerializer


class LigneCommandeClientSerializer(serializers.ModelSerializer):
    produit_reference   = serializers.CharField(source='produit.reference', read_only=True)
    produit_designation = serializers.CharField(source='produit.designation', read_only=True)
    montant_ligne       = serializers.ReadOnlyField()
    quantite_restante   = serializers.ReadOnlyField()

    class Meta:
        model  = LigneCommandeClient
        fields = [
            'id', 'commande', 'produit', 'produit_reference', 'produit_designation',
            'quantite_commandee', 'quantite_livree', 'quantite_restante',
            'prix_unitaire', 'remise_pct', 'statut',
            'date_livraison_prev', 'montant_ligne',
        ]
        read_only_fields = ['id', 'quantite_livree', 'statut']

    def validate_quantite_commandee(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError("La quantite doit etre superieure a 0.")
        return value

    def validate_prix_unitaire(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError("Le prix doit etre superieur a 0.")
        return value


class CommandeClientSerializer(serializers.ModelSerializer):
    client_detail    = ClientMiniSerializer(source='client', read_only=True)
    lignes           = LigneCommandeClientSerializer(many=True, read_only=True)
    commercial_nom   = serializers.SerializerMethodField()
    taux_livraison   = serializers.ReadOnlyField()

    class Meta:
        model  = CommandeClient
        fields = [
            'id', 'numero', 'client', 'client_detail',
            'date_commande', 'date_livraison_souhaitee', 'date_livraison_confirmee',
            'montant_total', 'statut', 'devise', 'incoterm',
            'commercial', 'commercial_nom', 'notes',
            'date_creation', 'lignes', 'taux_livraison',
        ]
        read_only_fields = ['id', 'montant_total', 'date_creation']

    def get_commercial_nom(self, obj):
        if obj.commercial:
            return f"{obj.commercial.prenom} {obj.commercial.nom}"
        return None


class CommandeClientCreateSerializer(serializers.ModelSerializer):
    lignes = LigneCommandeClientSerializer(many=True, write_only=True)

    class Meta:
        model  = CommandeClient
        fields = [
            'numero', 'client', 'date_commande',
            'date_livraison_souhaitee', 'devise', 'incoterm', 'notes', 'lignes',
        ]

    def create(self, validated_data):
        lignes_data = validated_data.pop('lignes')
        commande    = CommandeClient.objects.create(**validated_data)
        for ld in lignes_data:
            ld.pop('commande', None)
            LigneCommandeClient.objects.create(commande=commande, **ld)
        commande.recalculer_montant()
        return commande


class CommandeMiniSerializer(serializers.ModelSerializer):
    client_nom    = serializers.CharField(source='client.raison_sociale', read_only=True)
    taux_livraison= serializers.ReadOnlyField()

    class Meta:
        model  = CommandeClient
        fields = [
            'id', 'numero', 'client_nom', 'montant_total',
            'statut', 'date_livraison_confirmee', 'taux_livraison',
        ]