from django.contrib import admin
from .models import ExerciceComptable, PlanComptable, EcritureComptable, Facture


class PlanComptableInline(admin.TabularInline):
    model  = PlanComptable
    extra  = 0
    fields = ('numero_compte', 'libelle', 'type_compte', 'classe', 'actif')


@admin.register(ExerciceComptable)
class ExerciceAdmin(admin.ModelAdmin):
    list_display   = ('libelle', 'date_debut', 'date_fin', 'statut', 'cloture')
    list_filter    = ('statut', 'cloture')
    search_fields  = ('libelle',)
    readonly_fields= ('date_creation', 'date_cloture')
    inlines        = [PlanComptableInline]


@admin.register(PlanComptable)
class PlanComptableAdmin(admin.ModelAdmin):
    list_display   = ('numero_compte', 'libelle', 'type_compte', 'classe', 'sens_normal', 'actif')
    list_filter    = ('type_compte', 'classe', 'actif', 'exercice')
    search_fields  = ('numero_compte', 'libelle')
    ordering       = ('numero_compte',)


@admin.register(EcritureComptable)
class EcritureAdmin(admin.ModelAdmin):
    list_display   = ('date_ecriture', 'journal', 'libelle', 'compte_debit',
                      'compte_credit', 'montant', 'validee')
    list_filter    = ('journal', 'validee', 'periode_comptable')
    search_fields  = ('libelle', 'reference_externe')
    date_hierarchy = 'date_ecriture'
    readonly_fields= ('date_creation', 'periode_comptable')


@admin.register(Facture)
class FactureAdmin(admin.ModelAdmin):
    list_display   = ('numero', 'client_nom', 'date_emission', 'date_echeance',
                      'montant_ttc', 'montant_paye', 'statut')
    list_filter    = ('statut', 'type_facture', 'devise')
    search_fields  = ('numero', 'client_nom')
    date_hierarchy = 'date_emission'
    readonly_fields= ('montant_tva', 'montant_ttc', 'solde_restant',
                      'date_creation', 'date_modification')