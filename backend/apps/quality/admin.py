from django.contrib import admin
from .models import CritereQualite, ControleQualite, FicheNC, SuiviActionNC


class SuiviActionInline(admin.TabularInline):
    model       = SuiviActionNC
    extra       = 0
    fields      = ('type_action', 'description', 'responsable',
                   'date_prevue', 'date_realisation', 'statut')


@admin.register(CritereQualite)
class CritereAdmin(admin.ModelAdmin):
    list_display   = ('produit', 'nom', 'type_mesure', 'valeur_min',
                      'valeur_max', 'unite', 'critique', 'actif')
    list_filter    = ('type_mesure', 'critique', 'actif')
    search_fields  = ('nom', 'produit__reference', 'produit__designation')
    ordering       = ('produit', 'nom')


@admin.register(ControleQualite)
class ControleAdmin(admin.ModelAdmin):
    list_display   = ('ordre', 'critere', 'valeur_mesuree', 'quantite_controlee',
                      'quantite_rebut', 'resultat', 'date_controle')
    list_filter    = ('resultat',)
    search_fields  = ('ordre__numero', 'critere__nom')
    date_hierarchy = 'date_controle'
    readonly_fields= ('date_controle',)


@admin.register(FicheNC)
class FicheNCAdmin(admin.ModelAdmin):
    list_display   = ('numero_nc', 'produit', 'gravite', 'type_nc',
                      'statut', 'lot_bloque', 'delai_resolution', 'date_creation')
    list_filter    = ('statut', 'gravite', 'type_nc', 'lot_bloque')
    search_fields  = ('numero_nc', 'produit__reference', 'description_defaut')
    date_hierarchy = 'date_creation'
    readonly_fields= ('date_creation', 'date_modification')
    inlines        = [SuiviActionInline]


@admin.register(SuiviActionNC)
class SuiviActionAdmin(admin.ModelAdmin):
    list_display   = ('fiche_nc', 'type_action', 'responsable',
                      'date_prevue', 'date_realisation', 'statut')
    list_filter    = ('type_action', 'statut')
    search_fields  = ('fiche_nc__numero_nc',)
    ordering       = ('date_prevue',)