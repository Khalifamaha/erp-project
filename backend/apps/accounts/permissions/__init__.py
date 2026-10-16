# -*- coding: utf-8 -*-
from rest_framework.permissions import BasePermission


class IsDirection(BasePermission):
    """Accès réservé au niveau Direction."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.user_roles.filter(
            actif=True, role__niveau='direction'
        ).exists()


class IsChefOuPlus(BasePermission):
    """Accès Chef de service, Direction, ou Superuser."""
    NIVEAUX = ['direction', 'chef']

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.user_roles.filter(
            actif=True, role__niveau__in=self.NIVEAUX
        ).exists()


class IsOperateurOuPlus(BasePermission):
    """Accès tous les niveaux sauf lecture seule."""
    NIVEAUX = ['direction', 'chef', 'operateur', 'technicien', 'comptable', 'rh']

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.user_roles.filter(
            actif=True, role__niveau__in=self.NIVEAUX
        ).exists()


class IsOwnerOrAdmin(BasePermission):
    """L'utilisateur peut accéder uniquement à ses propres ressources, sauf admin."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.is_staff:
            return True
        # Supporte les objets avec .utilisateur ou .user ou directement User
        if hasattr(obj, 'utilisateur'):
            return obj.utilisateur == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user