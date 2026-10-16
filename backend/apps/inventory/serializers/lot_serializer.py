# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import Lot
from .produit_serializer import ProduitMiniSerializer


class LotSerializer(serializers.ModelSerializer):
    produit_detail       = ProduitMiniSerializer(source='produit', read_only=True)
    est_expire           = serializers.ReadOnlyField()
    taux_consommation    = serializers.ReadOnlyField()

    class Meta:
        model  = Lot
        fields = [
            'id', 'produit', 'produit_detail', 'numero_lot', 'numero_serie',
            'date_fabrication', 'date_expiration', 'quantite_initiale',
            'quantite_restante', 'statut', 'origine', 'ordre_fab_id',
            'fournisseur_nom', 'cout_unitaire', 'notes', 'date_creation',
            'est_expire', 'taux_consommation',
        ]
        read_only_fields = ['id', 'date_creation', 'est_expire', 'taux_consommation']

    def validate(self, data):
        if data.get('date_expiration') and data.get('date_fabrication'):
            if data['date_expiration'] <= data['date_fabrication']:
                raise serializers.ValidationError(
                    "La date d'expiration doit etre apres la date de fabrication."
                )
        if data.get('quantite_restante', 0) > data.get('quantite_initiale', 0):
            raise serializers.ValidationError(
                "La quantite restante ne peut pas depasser la quantite initiale."
            )
        return data


class LotMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Lot
        fields = ['id', 'numero_lot', 'quantite_restante', 'statut', 'date_expiration']