# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import Fournisseur


class FournisseurSerializer(serializers.ModelSerializer):
    nombre_commandes      = serializers.ReadOnlyField()
    montant_total_achats  = serializers.ReadOnlyField()

    class Meta:
        model  = Fournisseur
        fields = [
            'id', 'code', 'raison_sociale', 'contact', 'email',
            'telephone', 'telephone2', 'adresse', 'ville', 'pays',
            'num_fiscal', 'num_rc', 'statut', 'categorie',
            'delai_livraison', 'score_qualite', 'devise_pref',
            'conditions_paiement', 'delai_paiement_jours', 'notes',
            'date_creation', 'nombre_commandes', 'montant_total_achats',
        ]
        read_only_fields = ['id', 'date_creation']

    def validate_code(self, value):
        qs = Fournisseur.objects.filter(code=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ce code fournisseur existe deja.")
        return value

    def validate_score_qualite(self, value):
        if not (0 <= value <= 100):
            raise serializers.ValidationError("Le score doit etre entre 0 et 100.")
        return value


class FournisseurMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Fournisseur
        fields = ['id', 'code', 'raison_sociale', 'email', 'telephone', 'pays']