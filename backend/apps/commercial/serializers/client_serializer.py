# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import Client


class ClientSerializer(serializers.ModelSerializer):
    encours_client   = serializers.ReadOnlyField()
    credit_disponible= serializers.ReadOnlyField()

    class Meta:
        model  = Client
        fields = [
            'id', 'code', 'raison_sociale', 'type',
            'contact_principal', 'email', 'telephone',
            'adresse', 'ville', 'pays', 'num_fiscal',
            'devise', 'conditions_paiement', 'delai_paiement_jours',
            'limite_credit', 'score_credit', 'statut', 'notes',
            'date_creation', 'encours_client', 'credit_disponible',
        ]
        read_only_fields = ['id', 'date_creation']

    def validate_code(self, value):
        qs = Client.objects.filter(code=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ce code client existe deja.")
        return value

    def validate_score_credit(self, value):
        if not (0 <= value <= 100):
            raise serializers.ValidationError("Le score doit etre entre 0 et 100.")
        return value


class ClientMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Client
        fields = ['id', 'code', 'raison_sociale', 'pays', 'statut']