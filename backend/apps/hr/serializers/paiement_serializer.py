# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import PaiementEmploye
from .employe_serializer import EmployeMiniSerializer


class PaiementSerializer(serializers.ModelSerializer):
    employe_detail = EmployeMiniSerializer(source='employe', read_only=True)

    class Meta:
        model  = PaiementEmploye
        fields = [
            'id', 'employe', 'employe_detail',
            'periode_debut', 'periode_fin',
            'salaire_base', 'heures_sup_montant', 'primes',
            'deductions', 'cotisation_cnss', 'impot_revenu', 'net_paye',
            'statut', 'date_paiement', 'mode_paiement',
            'reference_virement', 'notes', 'date_creation',
        ]
        read_only_fields = ['id', 'cotisation_cnss', 'net_paye', 'date_creation']

    def validate(self, data):
        if data.get('periode_fin') and data.get('periode_debut'):
            if data['periode_fin'] < data['periode_debut']:
                raise serializers.ValidationError(
                    "La période de fin doit être après la période de début."
                )
        return data


class PaiementBulkSerializer(serializers.Serializer):
    """Générer les bulletins de paie pour tous les employés d'un mois."""
    periode_debut = serializers.DateField()
    periode_fin   = serializers.DateField()
    departement   = serializers.CharField(required=False, allow_blank=True)