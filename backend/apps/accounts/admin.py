# -*- coding: utf-8 -*-
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Role, UserRole, Notification, HistoriqueStatut, DocumentJoint


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display    = ('email', 'nom', 'prenom', 'is_active', 'is_staff', 'date_creation')
    list_filter     = ('is_active', 'is_staff', 'is_superuser')
    search_fields   = ('email', 'nom', 'prenom')
    ordering        = ('nom',)
    readonly_fields = ('date_creation', 'date_modification', 'last_login')

    fieldsets = (
        (None,                        {'fields': ('email', 'password')}),
        (_('Informations personnelles'), {'fields': ('nom', 'prenom', 'telephone', 'langue', 'avatar_url')}),
        (_('Permissions'),            {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Dates'),                  {'fields': ('last_login', 'date_creation', 'date_modification')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'nom', 'prenom', 'password1', 'password2'),
        }),
    )


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display  = ('nom', 'niveau', 'systeme')
    list_filter   = ('niveau', 'systeme')
    search_fields = ('nom',)


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display  = ('utilisateur', 'role', 'actif', 'date_debut', 'date_fin')
    list_filter   = ('actif', 'role')
    search_fields = ('utilisateur__email', 'role__nom')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('titre', 'destinataire', 'type', 'priorite', 'lue', 'date_creation')
    list_filter  = ('type', 'priorite', 'lue')
    search_fields = ('titre', 'destinataire__email')


@admin.register(HistoriqueStatut)
class HistoriqueStatutAdmin(admin.ModelAdmin):
    list_display  = ('table_source', 'objet_id', 'ancien_statut', 'nouveau_statut', 'modifie_par', 'date_modification')
    list_filter   = ('table_source',)
    search_fields = ('table_source',)


@admin.register(DocumentJoint)
class DocumentJointAdmin(admin.ModelAdmin):
    list_display  = ('nom_fichier', 'table_source', 'categorie', 'uploade_par', 'date_upload')
    list_filter   = ('categorie', 'table_source')
    search_fields = ('nom_fichier',)