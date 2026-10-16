# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import (
    ChaineProduction, AffectationEmployeChaine,
    AffectationChaine, SessionProduction,
)


class AffectationEmployeSerializer(serializers.ModelSerializer):
    employe_nom = serializers.SerializerMethodField()

    class Meta:
        model  = AffectationEmployeChaine
        fields = [
            'id', 'employe', 'employe_nom', 'chaine',
            'date_debut', 'date_fin', 'poste_occupe', 'shift', 'actif',
        ]
        read_only_fields = ['id']

    def get_employe_nom(self, obj):
        return f"{obj.employe.prenom} {obj.employe.nom}"


class AffectationChaineSerializer(serializers.ModelSerializer):
    ordre_numero  = serializers.CharField(source='ordre.numero', read_only=True)
    chaine_nom    = serializers.CharField(source='chaine.nom', read_only=True)
    taux_rendement= serializers.ReadOnlyField()

    class Meta:
        model  = AffectationChaine
        fields = [
            'id', 'ordre', 'ordre_numero', 'chaine', 'chaine_nom',
            'heure_debut', 'heure_fin', 'quantite_entree', 'quantite_sortie',
            'taux_rendement', 'supervise_par',
        ]
        read_only_fields = ['id', 'taux_rendement']


class SessionProductionSerializer(serializers.ModelSerializer):
    chaine_nom    = serializers.CharField(source='chaine.nom', read_only=True)
    chaine_code   = serializers.CharField(source='chaine.code', read_only=True)
    ordre_numero  = serializers.CharField(source='ordre.numero', read_only=True)
    chef_nom      = serializers.SerializerMethodField()
    objectif_heure= serializers.IntegerField(source='chaine.objectif_heure', read_only=True)

    class Meta:
        model  = SessionProduction
        fields = [
            'id', 'chaine', 'chaine_nom', 'chaine_code',
            'ordre', 'ordre_numero',
            'date_session', 'shift', 'heure_debut', 'heure_fin',
            'compteur_pieces', 'objectif_session', 'objectif_heure',
            'taux_realisation', 'statut', 'chef', 'chef_nom', 'observations',
            'date_creation',
        ]
        read_only_fields = ['id', 'taux_realisation', 'date_creation']

    def get_chef_nom(self, obj):
        if obj.chef:
            return f"{obj.chef.prenom} {obj.chef.nom}"
        return None


class ChaineProductionSerializer(serializers.ModelSerializer):
    chef_nom          = serializers.SerializerMethodField()
    session_en_cours  = serializers.SerializerMethodField()

    class Meta:
        model  = ChaineProduction
        fields = [
            'id', 'nom', 'code', 'objectif_heure', 'objectif_jour',
            'objectif_shift', 'capacite_max', 'type_shift', 'statut',
            'chef', 'chef_nom', 'description', 'date_creation',
            'session_en_cours',
        ]
        read_only_fields = ['id', 'date_creation']

    def get_chef_nom(self, obj):
        if obj.chef:
            return f"{obj.chef.prenom} {obj.chef.nom}"
        return None

    def get_session_en_cours(self, obj):
        session = obj.sessions.filter(statut='en_cours').first()
        if session:
            return SessionProductionSerializer(session).data
        return None


class IncrementCompteurSerializer(serializers.Serializer):
    """Incrementer le compteur de pieces — depuis interface operateur."""
    quantite  = serializers.IntegerField(default=1, min_value=1)
    rebut     = serializers.IntegerField(default=0, min_value=0)