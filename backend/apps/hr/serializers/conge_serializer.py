# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import Conge
from .employe_serializer import EmployeMiniSerializer


class CongeSerializer(serializers.ModelSerializer):
    employe_detail = EmployeMiniSerializer(source='employe', read_only=True)

    class Meta:
        model  = Conge
        fields = [
            'id', 'employe', 'employe_detail',
            'date_debut', 'date_fin', 'nombre_jours',
            'type_conge', 'statut', 'motif',
            'approuve_par', 'date_demande', 'date_decision',
            'commentaire_rh',
        ]
        read_only_fields = ['id', 'nombre_jours', 'date_demande', 'statut']

    def validate(self, data):
        if data.get('date_fin') and data.get('date_debut'):
            if data['date_fin'] < data['date_debut']:
                raise serializers.ValidationError(
                    "La date de fin doit être après la date de début."
                )
        return data


class CongeDecisionSerializer(serializers.Serializer):
    """Utilisé par le RH pour approuver ou refuser un congé."""
    decision       = serializers.ChoiceField(choices=['approuve', 'refuse'])
    commentaire_rh = serializers.CharField(required=False, allow_blank=True)