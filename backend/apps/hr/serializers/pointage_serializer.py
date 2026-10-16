# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import Pointage
from .employe_serializer import EmployeMiniSerializer


class PointageSerializer(serializers.ModelSerializer):
    employe_detail = EmployeMiniSerializer(source='employe', read_only=True)

    class Meta:
        model  = Pointage
        fields = [
            'id', 'employe', 'employe_detail', 'chaine_id', 'date',
            'heure_entree', 'heure_sortie', 'heures_travaillees',
            'heures_sup', 'type', 'statut', 'valide_par',
        ]
        read_only_fields = ['id', 'heures_travaillees', 'heures_sup']

    def validate(self, data):
        if data.get('heure_sortie') and data.get('heure_entree'):
            if data['heure_sortie'] <= data['heure_entree']:
                raise serializers.ValidationError(
                    "L'heure de sortie doit être après l'heure d'entrée."
                )
        return data


class PointageEntreeSerializer(serializers.Serializer):
    """Utilisé pour le scan d'entrée depuis l'interface opérateur."""
    employe_id  = serializers.UUIDField()
    chaine_id   = serializers.UUIDField(required=False)
    type        = serializers.ChoiceField(
        choices=Pointage.TYPE, default='normal'
    )


class PointageSortieSerializer(serializers.Serializer):
    """Utilisé pour le scan de sortie."""
    pointage_id = serializers.UUIDField()