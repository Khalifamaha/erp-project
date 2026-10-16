# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import Reception, LigneReception


class LigneReceptionSerializer(serializers.ModelSerializer):
    produit_reference   = serializers.CharField(
        source='ligne_commande.produit.reference', read_only=True
    )
    produit_designation = serializers.CharField(
        source='ligne_commande.produit.designation', read_only=True
    )
    unite_mesure        = serializers.CharField(
        source='ligne_commande.produit.unite_mesure', read_only=True
    )

    class Meta:
        model  = LigneReception
        fields = [
            'id', 'reception', 'ligne_commande',
            'produit_reference', 'produit_designation', 'unite_mesure',
            'quantite_recue', 'quantite_acceptee', 'quantite_refusee',
            'numero_lot', 'date_expiration_lot', 'observations', 'lot_cree',
        ]
        read_only_fields = ['id', 'lot_cree']

    def validate(self, data):
        qte_recue    = float(data.get('quantite_recue', 0))
        qte_acceptee = float(data.get('quantite_acceptee', 0))
        qte_refusee  = float(data.get('quantite_refusee', 0))
        if qte_acceptee + qte_refusee > qte_recue:
            raise serializers.ValidationError(
                "La somme acceptee + refusee ne peut pas depasser la quantite recue."
            )
        return data


class ReceptionSerializer(serializers.ModelSerializer):
    lignes              = LigneReceptionSerializer(many=True, read_only=True)
    commande_numero     = serializers.CharField(source='commande.numero', read_only=True)
    fournisseur_nom     = serializers.CharField(
        source='commande.fournisseur.raison_sociale', read_only=True
    )
    receptionniste_nom  = serializers.SerializerMethodField()

    class Meta:
        model  = Reception
        fields = [
            'id', 'numero', 'commande', 'commande_numero', 'fournisseur_nom',
            'date_reception', 'statut', 'num_bl', 'num_camion',
            'receptionniste', 'receptionniste_nom', 'observations',
            'date_creation', 'lignes',
        ]
        read_only_fields = ['id', 'date_creation']

    def get_receptionniste_nom(self, obj):
        if obj.receptionniste:
            return f"{obj.receptionniste.prenom} {obj.receptionniste.nom}"
        return None


class ReceptionCreateSerializer(serializers.ModelSerializer):
    """Creation d une reception avec ses lignes."""
    lignes = LigneReceptionSerializer(many=True, write_only=True)

    class Meta:
        model  = Reception
        fields = [
            'numero', 'commande', 'date_reception',
            'num_bl', 'num_camion', 'observations', 'lignes',
        ]

    def create(self, validated_data):
        lignes_data = validated_data.pop('lignes')
        reception   = Reception.objects.create(**validated_data)
        for ligne_data in lignes_data:
            LigneReception.objects.create(reception=reception, **ligne_data)
        return reception