from django.contrib import admin
from .models import PlanningProduction, ContrainteMachine


@admin.register(PlanningProduction)
class PlanningAdmin(admin.ModelAdmin):
    list_display   = ('ordre', 'chaine', 'machine', 'date_planifiee',
                      'shift', 'quantite_planifiee', 'statut', 'sequence')
    list_filter    = ('statut', 'shift', 'chaine', 'date_planifiee')
    search_fields  = ('ordre__numero', 'chaine__code', 'machine__code')
    date_hierarchy = 'date_planifiee'
    readonly_fields= ('date_creation', 'date_modification')
    ordering       = ('date_planifiee', 'sequence')


@admin.register(ContrainteMachine)
class ContrainteAdmin(admin.ModelAdmin):
    list_display   = ('machine', 'type_contrainte', 'heure_debut', 'heure_fin', 'motif')
    list_filter    = ('type_contrainte', 'machine')
    search_fields  = ('machine__code', 'machine__nom', 'motif')
    ordering       = ('heure_debut',)