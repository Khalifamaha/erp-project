# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import MaintenancePreventive, ExecutionMaintenance


class ExecutionMaintenanceSerializer(serializers.ModelSerializer):
    technicien_nom = serializers.SerializerMethodField()

    class Meta:
        model  = ExecutionMaintenance
        fields = [
            'id', 'maintenance', 'technicien', 'technicien_nom',
            'date_execution', 'duree_reelle_min', 'observations',
            'pieces_remplacees', 'cout_reel', 'date_creation',
        ]
        read_only_fields = ['id', 'date_creation']

    def get_technicien_nom(self, obj):
        if obj.technicien:
            return f"{obj.technicien.prenom} {obj.technicien.nom}"
        return None


class MaintenancePreventiveSerializer(serializers.ModelSerializer):
    machine_nom          = serializers.CharField(source='machine.nom',  read_only=True)
    machine_code         = serializers.CharField(source='machine.code', read_only=True)
    responsable_nom      = serializers.SerializerMethodField()
    est_en_retard        = serializers.ReadOnlyField()
    jours_avant_echeance = serializers.ReadOnlyField()
    executions           = ExecutionMaintenanceSerializer(many=True, read_only=True)

    class Meta:
        model  = MaintenancePreventive
        fields = [
            'id', 'machine', 'machine_code', 'machine_nom',
            'type_maintenance', 'frequence_jours',
            'derniere_execution', 'prochaine_execution',
            'description', 'duree_prevue_min', 'statut', 'active',
            'responsable', 'responsable_nom', 'cout_estime',
            'pieces_requises', 'est_en_retard', 'jours_avant_echeance',
            'date_creation', 'executions',
        ]
        read_only_fields = ['id', 'date_creation']

    def get_responsable_nom(self, obj):
        if obj.responsable:
            return f"{obj.responsable.prenom} {obj.responsable.nom}"
        return None