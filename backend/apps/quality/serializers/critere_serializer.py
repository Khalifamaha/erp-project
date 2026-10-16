# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import CritereQualite


class CritereQualiteSerializer(serializers.ModelSerializer):
    produit_reference   = serializers.CharField(source='produit.reference', read_only=True)
    produit_designation = serializers.CharField(source='produit.designation', read_only=True)
    tolerance_label     = serializers.ReadOnlyField()

    class Meta:
        model  = CritereQualite
        fields = [
            'id', 'produit', 'produit_reference', 'produit_designation',
            'nom', 'type_mesure', 'valeur_min', 'valeur_max', 'valeur_cible',
            'unite', 'critique', 'methode_controle', 'frequence',
            'actif', 'tolerance_label', 'date_creation',
        ]
        read_only_fields = ['id', 'date_creation']

    def validate(self, data):
        vmin = data.get('valeur_min')
        vmax = data.get('valeur_max')
        if vmin is not None and vmax is not None:
            if float(vmin) >= float(vmax):
                raise serializers.ValidationError(
                    "valeur_min doit etre inferieure a valeur_max."
                )
        return data


class CritereMiniSerializer(serializers.ModelSerializer):
    tolerance_label = serializers.ReadOnlyField()

    class Meta:
        model  = CritereQualite
        fields = ['id', 'nom', 'type_mesure', 'unite', 'critique',
                  'valeur_min', 'valeur_max', 'tolerance_label']