# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import ExerciceComptable, PlanComptable


class ExerciceComptableSerializer(serializers.ModelSerializer):
    cloture_par_nom = serializers.SerializerMethodField()
    nb_ecritures    = serializers.SerializerMethodField()
    nb_comptes      = serializers.SerializerMethodField()

    class Meta:
        model  = ExerciceComptable
        fields = [
            'id', 'libelle', 'date_debut', 'date_fin',
            'statut', 'cloture', 'date_cloture',
            'cloture_par', 'cloture_par_nom', 'notes',
            'date_creation', 'nb_ecritures', 'nb_comptes',
        ]
        read_only_fields = ['id', 'date_creation', 'date_cloture']

    def get_cloture_par_nom(self, obj):
        if obj.cloture_par:
            return f"{obj.cloture_par.prenom} {obj.cloture_par.nom}"
        return None

    def get_nb_ecritures(self, obj):
        return obj.ecritures.count()

    def get_nb_comptes(self, obj):
        return obj.comptes.count()

    def validate(self, data):
        if data.get('date_fin') and data.get('date_debut'):
            if data['date_fin'] <= data['date_debut']:
                raise serializers.ValidationError(
                    "La date de fin doit etre apres la date de debut."
                )
        return data


class PlanComptableSerializer(serializers.ModelSerializer):
    solde           = serializers.ReadOnlyField()
    compte_parent_libelle = serializers.CharField(
        source='compte_parent.libelle', read_only=True
    )

    class Meta:
        model  = PlanComptable
        fields = [
            'id', 'exercice', 'numero_compte', 'libelle',
            'type_compte', 'classe', 'sens_normal', 'actif',
            'compte_parent', 'compte_parent_libelle', 'solde',
        ]
        read_only_fields = ['id', 'solde']

    def validate_numero_compte(self, value):
        qs = PlanComptable.objects.filter(
            exercice=self.initial_data.get('exercice'),
            numero_compte=value
        )
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                f"Le compte {value} existe deja dans cet exercice."
            )
        return value


class PlanComptableMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PlanComptable
        fields = ['id', 'numero_compte', 'libelle', 'type_compte', 'classe']