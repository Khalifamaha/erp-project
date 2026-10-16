# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import Panne


class PanneSerializer(serializers.ModelSerializer):
    machine_nom      = serializers.CharField(source='machine.nom',  read_only=True)
    machine_code     = serializers.CharField(source='machine.code', read_only=True)
    chaine_nom       = serializers.CharField(source='chaine.nom',   read_only=True)
    declare_par_nom  = serializers.SerializerMethodField()
    duree_heures     = serializers.ReadOnlyField()
    nb_interventions = serializers.SerializerMethodField()

    class Meta:
        model  = Panne
        fields = [
            'id', 'machine', 'machine_code', 'machine_nom',
            'chaine', 'chaine_nom', 'declare_par', 'declare_par_nom',
            'date_debut', 'date_fin', 'duree_minutes', 'duree_heures',
            'cadence_ref', 'type_panne', 'gravite', 'description',
            'statut', 'pieces_perdues', 'cout_estime', 'arret_production',
            'date_creation', 'nb_interventions',
        ]
        read_only_fields = ['id', 'duree_minutes', 'pieces_perdues', 'date_creation']

    def get_declare_par_nom(self, obj):
        if obj.declare_par:
            return f"{obj.declare_par.prenom} {obj.declare_par.nom}"
        return None

    def get_nb_interventions(self, obj):
        return obj.interventions.count()


class PanneMiniSerializer(serializers.ModelSerializer):
    machine_code = serializers.CharField(source='machine.code', read_only=True)
    duree_heures = serializers.ReadOnlyField()

    class Meta:
        model  = Panne
        fields = [
            'id', 'machine', 'machine_code', 'type_panne', 'gravite',
            'statut', 'date_debut', 'date_fin', 'duree_heures',
            'pieces_perdues', 'arret_production',
        ]


class DeclarationPanneSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Panne
        fields = ['machine', 'chaine', 'type_panne', 'gravite', 'description', 'arret_production']

    def create(self, validated_data):
        from django.utils import timezone
        validated_data['date_debut']  = timezone.now()
        validated_data['cadence_ref'] = validated_data['machine'].cadence_horaire
        return super().create(validated_data)