# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import Intervention


class InterventionSerializer(serializers.ModelSerializer):
    technicien_nom         = serializers.SerializerMethodField()
    panne_machine          = serializers.CharField(source='panne.machine.code', read_only=True)
    duree_intervention_min = serializers.ReadOnlyField()
    cout_total             = serializers.ReadOnlyField()

    class Meta:
        model  = Intervention
        fields = [
            'id', 'panne', 'panne_machine', 'technicien', 'technicien_nom',
            'debut_intervention', 'fin_intervention', 'duree_intervention_min',
            'actions_effectuees', 'resultat', 'pieces_utilisees',
            'cout_pieces', 'cout_main_oeuvre', 'cout_total',
            'resolu', 'observations', 'date_creation',
        ]
        read_only_fields = ['id', 'date_creation']

    def get_technicien_nom(self, obj):
        if obj.technicien:
            return f"{obj.technicien.prenom} {obj.technicien.nom}"
        return None

    def validate(self, data):
        if data.get('fin_intervention') and data.get('debut_intervention'):
            if data['fin_intervention'] <= data['debut_intervention']:
                raise serializers.ValidationError(
                    "La fin doit etre apres le debut de l intervention."
                )
        return data