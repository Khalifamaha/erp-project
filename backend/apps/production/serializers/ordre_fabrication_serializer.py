# -*- coding: utf-8 -*-
from decimal import Decimal
from rest_framework import serializers
from ..models import OrdreFabrication, ConsommationOF
from .gamme_serializer import GammeOperatoireSerializer


class ConsommationOFSerializer(serializers.ModelSerializer):
    produit_reference   = serializers.CharField(source='produit.reference', read_only=True)
    produit_designation = serializers.CharField(source='produit.designation', read_only=True)
    lot_numero          = serializers.CharField(source='lot.numero_lot', read_only=True)

    class Meta:
        model  = ConsommationOF
        fields = [
            'id', 'ordre', 'produit', 'produit_reference', 'produit_designation',
            'lot', 'lot_numero', 'quantite_prevue', 'quantite_reelle',
            'date_consommation', 'saisie_par',
        ]
        read_only_fields = ['id', 'date_consommation']

    def validate_quantite_reelle(self, value):
        if value < Decimal('0'):
            raise serializers.ValidationError("La quantite ne peut pas etre negative.")
        return value


class OrdreFabricationSerializer(serializers.ModelSerializer):
    produit_reference   = serializers.CharField(source='produit.reference', read_only=True)
    produit_designation = serializers.CharField(source='produit.designation', read_only=True)
    gamme_nom           = serializers.CharField(source='gamme.nom', read_only=True)
    responsable_nom     = serializers.SerializerMethodField()
    taux_avancement     = serializers.ReadOnlyField()
    quantite_restante   = serializers.ReadOnlyField()
    duree_reelle_heures = serializers.ReadOnlyField()
    consommations       = ConsommationOFSerializer(many=True, read_only=True)

    class Meta:
        model  = OrdreFabrication
        fields = [
            'id', 'numero', 'produit', 'produit_reference', 'produit_designation',
            'gamme', 'gamme_nom', 'commande_client_id',
            'quantite_prevue', 'quantite_produite', 'quantite_rebutee',
            'quantite_restante', 'taux_avancement',
            'date_debut_prev', 'date_fin_prev',
            'date_debut_reel', 'date_fin_reel', 'duree_reelle_heures',
            'statut', 'priorite', 'responsable', 'responsable_nom',
            'notes_operateur', 'date_creation',
            'consommations',
        ]
        read_only_fields = [
            'id', 'quantite_produite', 'quantite_rebutee',
            'date_debut_reel', 'date_fin_reel', 'date_creation',
        ]

    def get_responsable_nom(self, obj):
        if obj.responsable:
            return f"{obj.responsable.prenom} {obj.responsable.nom}"
        return None

    def validate(self, data):
        if data.get('date_fin_prev') and data.get('date_debut_prev'):
            if data['date_fin_prev'] < data['date_debut_prev']:
                raise serializers.ValidationError(
                    "La date de fin doit etre apres la date de debut."
                )
        # Verifier que la gamme correspond au produit
        produit = data.get('produit')
        gamme   = data.get('gamme')
        if produit and gamme and gamme.produit != produit:
            raise serializers.ValidationError(
                "La gamme selectionnee ne correspond pas au produit."
            )
        return data


class OFMiniSerializer(serializers.ModelSerializer):
    produit_reference = serializers.CharField(source='produit.reference', read_only=True)

    class Meta:
        model  = OrdreFabrication
        fields = ['id', 'numero', 'produit_reference', 'quantite_prevue',
                  'quantite_produite', 'taux_avancement', 'statut', 'priorite']


class MAJQuantiteSerializer(serializers.Serializer):
    """Pour incrementer la quantite produite depuis l interface operateur."""
    quantite_produite = serializers.DecimalField(max_digits=12, decimal_places=3,
                                                  min_value=Decimal('0'))
    quantite_rebutee  = serializers.DecimalField(max_digits=12, decimal_places=3,
                                                  min_value=Decimal('0'), required=False)
    notes             = serializers.CharField(required=False, allow_blank=True)