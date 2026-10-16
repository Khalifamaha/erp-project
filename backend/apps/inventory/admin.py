from django.contrib import admin
from .models import CategorieProduit, EmplacementStock, Produit, Lot, MouvementStock


@admin.register(CategorieProduit)
class CategorieAdmin(admin.ModelAdmin):
    list_display  = ('nom', 'type', 'parent', 'niveau_arbre', 'actif')
    list_filter   = ('type', 'actif')
    search_fields = ('nom',)


@admin.register(EmplacementStock)
class EmplacementAdmin(admin.ModelAdmin):
    list_display  = ('code', 'nom', 'type', 'zone', 'allee', 'actif')
    list_filter   = ('type', 'actif')
    search_fields = ('code', 'nom')


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display  = ('reference', 'designation', 'type', 'stock_actuel', 'stock_minimum', 'prix_unitaire', 'actif')
    list_filter   = ('type', 'actif', 'categorie')
    search_fields = ('reference', 'designation', 'code_barre')
    ordering      = ('reference',)
    readonly_fields = ('date_creation', 'date_modification')


@admin.register(Lot)
class LotAdmin(admin.ModelAdmin):
    list_display  = ('numero_lot', 'produit', 'quantite_initiale', 'quantite_restante', 'statut', 'date_expiration')
    list_filter   = ('statut', 'origine')
    search_fields = ('numero_lot', 'numero_serie', 'produit__reference')
    date_hierarchy= 'date_creation'


@admin.register(MouvementStock)
class MouvementAdmin(admin.ModelAdmin):
    list_display  = ('produit', 'type_mouvement', 'quantite', 'stock_avant', 'stock_apres', 'date_mouvement')
    list_filter   = ('type_mouvement',)
    search_fields = ('produit__reference', 'reference_doc')
    date_hierarchy= 'date_mouvement'
    readonly_fields = ('date_mouvement', 'stock_avant', 'stock_apres')