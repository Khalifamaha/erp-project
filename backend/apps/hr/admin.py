# -*- coding: utf-8 -*-
from django.contrib import admin
from .models import Employe, Pointage, Conge, PaiementEmploye, HabilitationMachine


@admin.register(Employe)
class EmployeAdmin(admin.ModelAdmin):
    list_display   = ('matricule', 'nom', 'prenom', 'poste', 'departement', 'statut', 'date_embauche')
    list_filter    = ('departement', 'statut', 'type_contrat')
    search_fields  = ('nom', 'prenom', 'matricule', 'cin')
    ordering       = ('nom', 'prenom')
    readonly_fields= ('date_creation', 'date_modification')


@admin.register(Pointage)
class PointageAdmin(admin.ModelAdmin):
    list_display  = ('employe', 'date', 'heure_entree', 'heure_sortie', 'heures_travaillees', 'statut')
    list_filter   = ('statut', 'type', 'date')
    search_fields = ('employe__nom', 'employe__prenom', 'employe__matricule')
    date_hierarchy= 'date'


@admin.register(Conge)
class CongeAdmin(admin.ModelAdmin):
    list_display  = ('employe', 'type_conge', 'date_debut', 'date_fin', 'nombre_jours', 'statut')
    list_filter   = ('statut', 'type_conge')
    search_fields = ('employe__nom', 'employe__prenom')
    date_hierarchy= 'date_debut'


@admin.register(PaiementEmploye)
class PaiementAdmin(admin.ModelAdmin):
    list_display  = ('employe', 'periode_debut', 'periode_fin', 'net_paye', 'statut', 'date_paiement')
    list_filter   = ('statut', 'mode_paiement')
    search_fields = ('employe__nom', 'employe__prenom', 'employe__matricule')


@admin.register(HabilitationMachine)
class HabilitationAdmin(admin.ModelAdmin):
    list_display  = ('employe', 'machine_nom', 'niveau', 'date_obtention', 'date_expiration', 'active')
    list_filter   = ('niveau', 'active')
    search_fields = ('employe__nom', 'machine_nom')