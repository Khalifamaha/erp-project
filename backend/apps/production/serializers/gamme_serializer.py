# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import GammeOperatoire, Operation
from .machine_serializer import MachineMiniSerializer


class OperationSerializer(serializers.ModelSerializer):
    machine_detail      = MachineMiniSerializer(source='machine', read_only=True)
    cadence_theorique   = serializers.ReadOnlyField()

    class Meta:
        model  = Operation
        fields = [
            'id', 'gamme', 'machine', 'machine_detail', 'ordre', 'nom',
            'type_operation', 'temps_unitaire_min', 'temps_reglage_min',
            'operateurs_requis', 'instruction', 'cadence_theorique',
        ]
        read_only_fields = ['id']

    def validate_ordre(self, value):
        if value < 1:
            raise serializers.ValidationError("L ordre doit etre superieur a 0.")
        return value


class GammeOperatoireSerializer(serializers.ModelSerializer):
    operations          = OperationSerializer(many=True, read_only=True)
    produit_reference   = serializers.CharField(source='produit.reference', read_only=True)
    produit_designation = serializers.CharField(source='produit.designation', read_only=True)
    temps_total_min     = serializers.ReadOnlyField()
    temps_reglage_total_min = serializers.ReadOnlyField()
    valide_par_nom      = serializers.SerializerMethodField()

    class Meta:
        model  = GammeOperatoire
        fields = [
            'id', 'produit', 'produit_reference', 'produit_designation',
            'nom', 'version', 'active', 'date_validation', 'valide_par',
            'valide_par_nom', 'description', 'date_creation',
            'operations', 'temps_total_min', 'temps_reglage_total_min',
        ]
        read_only_fields = ['id', 'date_creation']

    def get_valide_par_nom(self, obj):
        if obj.valide_par:
            return f"{obj.valide_par.prenom} {obj.valide_par.nom}"
        return None


class GammeCreateSerializer(serializers.ModelSerializer):
    """Creation gamme + operations en une seule requete."""
    operations = OperationSerializer(many=True, write_only=True)

    class Meta:
        model  = GammeOperatoire
        fields = ['produit', 'nom', 'version', 'description', 'operations']

    def create(self, validated_data):
        operations_data = validated_data.pop('operations')
        gamme = GammeOperatoire.objects.create(**validated_data)
        for op_data in operations_data:
            op_data.pop('gamme', None)
            Operation.objects.create(gamme=gamme, **op_data)
        return gamme