from django.contrib import admin
from .models import Panne, Intervention, MaintenancePreventive, ExecutionMaintenance


class InterventionInline(admin.TabularInline):
    model       = Intervention
    extra       = 0
    fields      = ('technicien', 'debut_intervention', 'fin_intervention',
                   'resultat', 'cout_pieces', 'cout_main_oeuvre', 'resolu')
    readonly_fields = ('debut_intervention',)


class ExecutionInline(admin.TabularInline):
    model       = ExecutionMaintenance
    extra       = 0
    fields      = ('technicien', 'date_execution', 'duree_reelle_min', 'cout_reel')


@admin.register(Panne)
class PanneAdmin(admin.ModelAdmin):
    list_display   = ('machine', 'type_panne', 'gravite', 'statut',
                      'date_debut', 'date_fin', 'duree_minutes', 'pieces_perdues')
    list_filter    = ('statut', 'gravite', 'type_panne', 'arret_production')
    search_fields  = ('machine__code', 'machine__nom', 'description')
    date_hierarchy = 'date_debut'
    readonly_fields= ('duree_minutes', 'pieces_perdues', 'date_creation', 'date_modification')
    inlines        = [InterventionInline]


@admin.register(Intervention)
class InterventionAdmin(admin.ModelAdmin):
    list_display   = ('panne', 'technicien', 'debut_intervention',
                      'fin_intervention', 'resultat', 'resolu')
    list_filter    = ('resultat', 'resolu')
    search_fields  = ('panne__machine__code', 'technicien__nom')
    date_hierarchy = 'debut_intervention'
    readonly_fields= ('date_creation',)


@admin.register(MaintenancePreventive)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display   = ('machine', 'type_maintenance', 'frequence_jours',
                      'derniere_execution', 'prochaine_execution', 'statut', 'active')
    list_filter    = ('type_maintenance', 'statut', 'active')
    search_fields  = ('machine__code', 'machine__nom')
    ordering       = ('prochaine_execution',)
    readonly_fields= ('date_creation', 'date_modification')
    inlines        = [ExecutionInline]


@admin.register(ExecutionMaintenance)
class ExecutionAdmin(admin.ModelAdmin):
    list_display   = ('maintenance', 'technicien', 'date_execution',
                      'duree_reelle_min', 'cout_reel')
    list_filter    = ('maintenance__type_maintenance',)
    date_hierarchy = 'date_execution'