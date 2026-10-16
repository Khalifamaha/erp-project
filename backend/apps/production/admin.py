from django.contrib import admin
from .models import (
    Machine, GammeOperatoire, Operation,
    OrdreFabrication, ConsommationOF,
    ChaineProduction, AffectationEmployeChaine,
    AffectationChaine, SessionProduction,
)


class OperationInline(admin.TabularInline):
    model  = Operation
    extra  = 0
    fields = ('ordre', 'nom', 'machine', 'type_operation',
              'temps_unitaire_min', 'temps_reglage_min', 'operateurs_requis')
    ordering = ('ordre',)


class ConsommationInline(admin.TabularInline):
    model  = ConsommationOF
    extra  = 0
    fields = ('produit', 'lot', 'quantite_prevue', 'quantite_reelle')


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display   = ('code', 'nom', 'type', 'statut', 'cadence_horaire', 'taux_disponibilite')
    list_filter    = ('type', 'statut')
    search_fields  = ('code', 'nom', 'numero_serie')
    ordering       = ('code',)


@admin.register(GammeOperatoire)
class GammeAdmin(admin.ModelAdmin):
    list_display   = ('nom', 'produit', 'version', 'active', 'date_validation')
    list_filter    = ('active',)
    search_fields  = ('nom', 'produit__reference')
    inlines        = [OperationInline]


@admin.register(OrdreFabrication)
class OFAdmin(admin.ModelAdmin):
    list_display   = ('numero', 'produit', 'quantite_prevue', 'quantite_produite',
                      'statut', 'priorite', 'date_debut_prev', 'date_fin_prev')
    list_filter    = ('statut', 'priorite')
    search_fields  = ('numero', 'produit__reference')
    date_hierarchy = 'date_creation'
    inlines        = [ConsommationInline]
    readonly_fields= ('date_creation', 'date_modification', 'date_debut_reel', 'date_fin_reel')


@admin.register(ChaineProduction)
class ChaineAdmin(admin.ModelAdmin):
    list_display   = ('code', 'nom', 'objectif_heure', 'objectif_jour', 'statut', 'type_shift')
    list_filter    = ('statut', 'type_shift')
    search_fields  = ('code', 'nom')


@admin.register(SessionProduction)
class SessionAdmin(admin.ModelAdmin):
    list_display   = ('chaine', 'date_session', 'shift', 'compteur_pieces',
                      'objectif_session', 'taux_realisation', 'statut')
    list_filter    = ('statut', 'shift', 'chaine')
    date_hierarchy = 'date_session'