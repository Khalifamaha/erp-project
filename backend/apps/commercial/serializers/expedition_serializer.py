# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import Camion, Expedition, LigneExpedition


class CamionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Camion
        fields = [
            'id', 'immatriculation', 'marque', 'modele', 'numero_serie',
            'capacite_kg', 'volume_m3', 'statut', 'prochaine_revision',
            'chauffeur_nom', 'chauffeur_telephone', 'numero_permis',
            'type_transport', 'date_creation',
        ]
        read_only_fields = ['id', 'date_creation']


class LigneExpeditionSerializer(serializers.ModelSerializer):
    produit_reference   = serializers.CharField(source='produit.reference', read_only=True)
    produit_designation = serializers.CharField(source='produit.designation', read_only=True)
    lot_numero          = serializers.CharField(source='lot.numero_lot', read_only=True)

    class Meta:
        model  = LigneExpedition
        fields = [
            'id', 'expedition', 'produit', 'produit_reference',
            'produit_designation', 'lot', 'lot_numero',
            'quantite', 'poids', 'unite',
        ]
        read_only_fields = ['id']


class ExpeditionSerializer(serializers.ModelSerializer):
    camion_detail       = CamionSerializer(source='camion', read_only=True)
    commande_numero     = serializers.CharField(source='commande_client.numero', read_only=True)
    client_nom          = serializers.CharField(
        source='commande_client.client.raison_sociale', read_only=True
    )
    responsable_nom     = serializers.SerializerMethodField()
    lignes              = LigneExpeditionSerializer(many=True, read_only=True)

    class Meta:
        model  = Expedition
        fields = [
            'id', 'numero', 'camion', 'camion_detail',
            'commande_client', 'commande_numero', 'client_nom',
            'date_depart', 'date_arrivee_prev', 'date_arrivee_reel',
            'destination', 'pays_destination', 'statut',
            'poids_total', 'valeur_totale', 'incoterm',
            'numero_douane', 'numero_bl',
            'responsable', 'responsable_nom', 'notes',
            'date_creation', 'lignes',
        ]
        read_only_fields = ['id', 'date_creation']

    def get_responsable_nom(self, obj):
        if obj.responsable:
            return f"{obj.responsable.prenom} {obj.responsable.nom}"
        return None


class ExpeditionCreateSerializer(serializers.ModelSerializer):
    lignes = LigneExpeditionSerializer(many=True, write_only=True, required=False)

    class Meta:
        model  = Expedition
        fields = [
            'numero', 'camion', 'commande_client',
            'date_depart', 'date_arrivee_prev', 'destination',
            'pays_destination', 'incoterm', 'notes', 'lignes',
        ]

    def create(self, validated_data):
        lignes_data = validated_data.pop('lignes', [])
        expedition  = Expedition.objects.create(**validated_data)
        poids_total = 0
        for ld in lignes_data:
            ld.pop('expedition', None)
            ligne = LigneExpedition(expedition=expedition, **ld)
            # Sauvegarder sans declencher mouvement stock dans le seed
            LigneExpedition.objects.bulk_create([ligne])
            poids_total += float(ld.get('poids', 0))
        expedition.poids_total = poids_total
        expedition.save(update_fields=['poids_total'])
        return expedition