# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import FicheNC, SuiviActionNC


class SuiviActionNCSerializer(serializers.ModelSerializer):
    responsable_nom = serializers.SerializerMethodField()

    class Meta:
        model  = SuiviActionNC
        fields = [
            'id', 'fiche_nc', 'type_action', 'description',
            'responsable', 'responsable_nom',
            'date_prevue', 'date_realisation', 'statut', 'resultat',
            'date_creation',
        ]
        read_only_fields = ['id', 'date_creation']

    def get_responsable_nom(self, obj):
        if obj.responsable:
            return f"{obj.responsable.prenom} {obj.responsable.nom}"
        return None


class FicheNCSerializer(serializers.ModelSerializer):
    produit_reference   = serializers.CharField(source='produit.reference', read_only=True)
    produit_designation = serializers.CharField(source='produit.designation', read_only=True)
    lot_numero          = serializers.CharField(source='lot.numero_lot', read_only=True)
    ouverte_par_nom     = serializers.SerializerMethodField()
    responsable_nom     = serializers.SerializerMethodField()
    cloturee_par_nom    = serializers.SerializerMethodField()
    actions             = SuiviActionNCSerializer(many=True, read_only=True)
    nb_actions_ouvertes = serializers.SerializerMethodField()

    class Meta:
        model  = FicheNC
        fields = [
            'id', 'numero_nc', 'produit', 'produit_reference', 'produit_designation',
            'lot', 'lot_numero', 'controle',
            'gravite', 'type_nc', 'description_defaut',
            'cause_racine', 'action_immediate', 'action_corrective', 'action_preventive',
            'responsable', 'responsable_nom', 'delai_resolution',
            'date_cloture', 'statut', 'lot_bloque',
            'ouverte_par', 'ouverte_par_nom', 'cloturee_par', 'cloturee_par_nom',
            'date_creation', 'date_modification',
            'actions', 'nb_actions_ouvertes',
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']

    def get_ouverte_par_nom(self, obj):
        if obj.ouverte_par:
            return f"{obj.ouverte_par.prenom} {obj.ouverte_par.nom}"
        return None

    def get_responsable_nom(self, obj):
        if obj.responsable:
            return f"{obj.responsable.prenom} {obj.responsable.nom}"
        return None

    def get_cloturee_par_nom(self, obj):
        if obj.cloturee_par:
            return f"{obj.cloturee_par.prenom} {obj.cloturee_par.nom}"
        return None

    def get_nb_actions_ouvertes(self, obj):
        return obj.actions.exclude(statut__in=['realisee', 'verifiee', 'abandonnee']).count()


class FicheNCCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FicheNC
        fields = [
            'produit', 'lot', 'controle', 'numero_nc',
            'gravite', 'type_nc', 'description_defaut',
            'cause_racine', 'action_immediate',
            'responsable', 'delai_resolution', 'lot_bloque',
        ]

    def validate_numero_nc(self, value):
        if FicheNC.objects.filter(numero_nc=value).exists():
            raise serializers.ValidationError("Ce numero NC existe deja.")
        return value


class ClotureFicheNCSerializer(serializers.Serializer):
    """Cloturer une fiche NC avec les actions realisees."""
    cause_racine       = serializers.CharField()
    action_corrective  = serializers.CharField()
    action_preventive  = serializers.CharField(required=False, allow_blank=True)
    commentaire        = serializers.CharField(required=False, allow_blank=True)