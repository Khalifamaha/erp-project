# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import Machine


class MachineSerializer(serializers.ModelSerializer):
    cadence_theorique_pcs_h = serializers.ReadOnlyField(source='cadence_theorique')

    class Meta:
        model  = Machine
        fields = [
            'id', 'nom', 'code', 'type', 'marque', 'modele',
            'numero_serie', 'emplacement', 'statut',
            'date_mise_service', 'cadence_horaire', 'cadence_theorique',
            'cadence_theorique_pcs_h', 'taux_disponibilite',
            'prochaine_maintenance', 'fabricant', 'notes',
            'date_creation',
        ]
        read_only_fields = ['id', 'taux_disponibilite', 'date_creation']

    def validate_code(self, value):
        qs = Machine.objects.filter(code=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ce code machine existe deja.")
        return value


class MachineMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Machine
        fields = ['id', 'code', 'nom', 'type', 'statut', 'cadence_horaire']