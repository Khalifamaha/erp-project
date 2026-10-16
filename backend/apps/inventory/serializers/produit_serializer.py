# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import CategorieProduit, EmplacementStock, Produit


class CategorieSerializer(serializers.ModelSerializer):
    nombre_produits = serializers.SerializerMethodField()

    class Meta:
        model  = CategorieProduit
        fields = ['id', 'nom', 'type', 'parent', 'niveau_arbre', 'description', 'actif', 'nombre_produits']

    def get_nombre_produits(self, obj):
        return obj.produits.count()


class EmplacementSerializer(serializers.ModelSerializer):
    nombre_produits = serializers.SerializerMethodField()

    class Meta:
        model  = EmplacementStock
        fields = ['id', 'code', 'nom', 'type', 'zone', 'allee', 'niveau', 'capacite_max', 'actif', 'nombre_produits']

    def get_nombre_produits(self, obj):
        return obj.produits.count()


class ProduitSerializer(serializers.ModelSerializer):
    categorie_nom    = serializers.CharField(source='categorie.nom', read_only=True)
    emplacement_nom  = serializers.CharField(source='emplacement.nom', read_only=True)
    est_sous_seuil   = serializers.ReadOnlyField()
    est_rupture      = serializers.ReadOnlyField()
    valeur_stock     = serializers.ReadOnlyField()

    class Meta:
        model  = Produit
        fields = [
            'id', 'reference', 'designation', 'type', 'code_barre',
            'categorie', 'categorie_nom', 'unite_mesure', 'unite_secondaire',
            'facteur_conversion', 'stock_actuel', 'stock_minimum',
            'stock_maximum', 'stock_securite', 'prix_unitaire', 'cout_revient',
            'emplacement', 'emplacement_nom', 'poids_kg', 'volume_m3',
            'code_douanier', 'description', 'actif', 'date_creation',
            'est_sous_seuil', 'est_rupture', 'valeur_stock',
        ]
        read_only_fields = ['id', 'stock_actuel', 'date_creation']

    def validate_reference(self, value):
        qs = Produit.objects.filter(reference=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Cette reference existe deja.")
        return value


class ProduitMiniSerializer(serializers.ModelSerializer):
    """Version legere pour les FK dans d'autres modules."""
    class Meta:
        model  = Produit
        fields = ['id', 'reference', 'designation', 'type', 'unite_mesure', 'stock_actuel', 'prix_unitaire']