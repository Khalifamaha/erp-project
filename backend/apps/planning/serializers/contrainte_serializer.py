# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import ContrainteMachine


class ContrainteMachineSerializer(serializers.ModelSerializer):
    machine_nom   = serializers.CharField(source='machine.nom',  read_only=True)
    machine_code  = serializers.CharField(source='machine.code', read_only=True)
    cree_par_nom  = serializers.SerializerMethodField()
    duree_heures  = serializers.ReadOnlyField()

    class Meta:
        model  = ContrainteMachine
        fields = [
            'id', 'machine', 'machine_code', 'machine_nom',
            'heure_debut', 'heure_fin', 'duree_heures',
            'type_contrainte', 'motif', 'cree_par', 'cree_par_nom',
            'date_creation',
        ]
        read_only_fields = ['id', 'date_creation']

    def get_cree_par_nom(self, obj):
        if obj.cree_par:
            return f"{obj.cree_par.prenom} {obj.cree_par.nom}"
        return None

    def validate(self, data):
        if data.get('heure_fin') and data.get('heure_debut'):
            if data['heure_fin'] <= data['heure_debut']:
                raise serializers.ValidationError(
                    "L heure de fin doit etre apres l heure de debut."
                )
        return data