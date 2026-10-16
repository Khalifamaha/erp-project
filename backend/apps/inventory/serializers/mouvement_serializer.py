# -*- coding: utf-8 -*-
from decimal import Decimal
from rest_framework import serializers
from ..models import MouvementStock, Produit, Lot
from .produit_serializer import ProduitMiniSerializer
from .lot_serializer import LotMiniSerializer


class MouvementSerializer(serializers.ModelSerializer):
    produit_detail  = ProduitMiniSerializer(source='produit', read_only=True)
    lot_detail      = LotMiniSerializer(source='lot', read_only=True)
    utilisateur_nom = serializers.SerializerMethodField()

    class Meta:
        model  = MouvementStock
        fields = [
            'id', 'produit', 'produit_detail', 'lot', 'lot_detail',
            'type_mouvement', 'quantite', 'stock_avant', 'stock_apres',
            'prix_unitaire', 'date_mouvement', 'reference_doc',
            'utilisateur', 'utilisateur_nom', 'motif',
            'ordre_fab_id', 'expedition_id', 'commande_id',
        ]
        read_only_fields = ['id', 'stock_avant', 'stock_apres', 'date_mouvement']

    def get_utilisateur_nom(self, obj):
        if obj.utilisateur:
            return f"{obj.utilisateur.prenom} {obj.utilisateur.nom}"
        return None


class MouvementCreateSerializer(serializers.Serializer):
    produit_id     = serializers.UUIDField()
    lot_id         = serializers.UUIDField(required=False, allow_null=True)
    type_mouvement = serializers.ChoiceField(choices=MouvementStock.TYPE_CHOICES)
    # CORRECTION : min_value doit etre Decimal, pas float
    quantite       = serializers.DecimalField(max_digits=12, decimal_places=3, min_value=Decimal('0.001'))
    prix_unitaire  = serializers.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0'))
    reference_doc  = serializers.CharField(required=False, allow_blank=True)
    motif          = serializers.CharField(required=False, allow_blank=True)

    def validate_produit_id(self, value):
        if not Produit.objects.filter(id=value, actif=True).exists():
            raise serializers.ValidationError("Produit introuvable ou inactif.")
        return value

    def validate(self, data):
        lot_id = data.get('lot_id')
        if lot_id:
            try:
                lot = Lot.objects.get(id=lot_id)
                if lot.statut in ['epuise', 'rebut']:
                    raise serializers.ValidationError(
                        f"Le lot {lot.numero_lot} est {lot.statut} et ne peut pas etre utilise."
                    )
                data['lot'] = lot
            except Lot.DoesNotExist:
                raise serializers.ValidationError("Lot introuvable.")
        return data


class AjustementInventaireSerializer(serializers.Serializer):
    produit_id      = serializers.UUIDField()
    # CORRECTION : min_value Decimal
    quantite_reelle = serializers.DecimalField(max_digits=12, decimal_places=3, min_value=Decimal('0'))
    motif           = serializers.CharField(required=False, default='Ajustement inventaire physique')