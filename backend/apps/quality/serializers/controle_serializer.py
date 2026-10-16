# -*- coding: utf-8 -*-
from decimal import Decimal
from rest_framework import serializers
from ..models import ControleQualite
from .critere_serializer import CritereMiniSerializer


class ControleQualiteSerializer(serializers.ModelSerializer):
    critere_detail      = CritereMiniSerializer(source='critere', read_only=True)
    ordre_numero        = serializers.CharField(source='ordre.numero', read_only=True)
    lot_numero          = serializers.CharField(source='lot.numero_lot', read_only=True)
    employe_nom         = serializers.SerializerMethodField()
    taux_conformite     = serializers.ReadOnlyField()

    class Meta:
        model  = ControleQualite
        fields = [
            'id', 'ordre', 'ordre_numero', 'employe', 'employe_nom',
            'critere', 'critere_detail', 'lot', 'lot_numero',
            'date_controle', 'valeur_mesuree', 'quantite_controlee',
            'quantite_conforme', 'quantite_rebut', 'taux_conformite',
            'resultat', 'action_corrective', 'observations',
        ]
        read_only_fields = ['id', 'date_controle', 'resultat']

    def get_employe_nom(self, obj):
        if obj.employe:
            return f"{obj.employe.prenom} {obj.employe.nom}"
        return None

    def validate(self, data):
        qte_ctrl = float(data.get('quantite_controlee', 1))
        qte_rebut= float(data.get('quantite_rebut', 0))
        if qte_rebut > qte_ctrl:
            raise serializers.ValidationError(
                "La quantite rebutee ne peut pas depasser la quantite controlee."
            )
        return data


class SaisieControleSerializer(serializers.Serializer):
    """Saisie rapide depuis l interface qualite — un controle par critere."""
    ordre_id           = serializers.UUIDField()
    critere_id         = serializers.UUIDField()
    lot_id             = serializers.UUIDField(required=False, allow_null=True)
    valeur_mesuree     = serializers.DecimalField(
        max_digits=12, decimal_places=4, required=False, allow_null=True
    )
    quantite_controlee = serializers.DecimalField(
        max_digits=12, decimal_places=3, min_value=Decimal('0.001')
    )
    quantite_rebut     = serializers.DecimalField(
        max_digits=12, decimal_places=3, min_value=Decimal('0'), default=Decimal('0')
    )
    observations       = serializers.CharField(required=False, allow_blank=True)
    action_corrective  = serializers.CharField(required=False, allow_blank=True)