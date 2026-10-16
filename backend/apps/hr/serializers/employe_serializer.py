# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import Employe, HabilitationMachine


class EmployeSerializer(serializers.ModelSerializer):
    nom_complet = serializers.ReadOnlyField()

    class Meta:
        model  = Employe
        fields = [
            'id', 'matricule', 'nom', 'prenom', 'nom_complet', 'cin',
            'poste', 'departement', 'type_contrat', 'statut',
            'date_embauche', 'date_fin_contrat', 'salaire_base',
            'num_cnss', 'rib_bancaire', 'niveau_qualification',
            'solde_conge', 'telephone', 'telephone_urgence',
            'contact_urgence', 'photo_url', 'date_creation',
        ]
        read_only_fields = ['id', 'date_creation']


class EmployeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Employe
        fields = [
            'matricule', 'nom', 'prenom', 'cin', 'poste',
            'departement', 'type_contrat', 'date_embauche',
            'salaire_base', 'num_cnss', 'rib_bancaire',
            'niveau_qualification', 'telephone',
            'telephone_urgence', 'contact_urgence',
        ]

    def validate_matricule(self, value):
        if Employe.objects.filter(matricule=value).exists():
            raise serializers.ValidationError("Ce matricule existe déjà.")
        return value

    def validate_cin(self, value):
        if Employe.objects.filter(cin=value).exists():
            raise serializers.ValidationError("Ce CIN existe déjà.")
        return value


class EmployeMiniSerializer(serializers.ModelSerializer):
    """Version légère pour les FK dans d'autres modules."""
    nom_complet = serializers.ReadOnlyField()

    class Meta:
        model  = Employe
        fields = ['id', 'matricule', 'nom', 'prenom', 'nom_complet', 'poste', 'departement']


class HabilitationSerializer(serializers.ModelSerializer):
    employe_nom = serializers.CharField(source='employe.nom_complet', read_only=True)

    class Meta:
        model  = HabilitationMachine
        fields = [
            'id', 'employe', 'employe_nom', 'machine_id', 'machine_nom',
            'date_obtention', 'date_expiration', 'niveau', 'active',
        ]