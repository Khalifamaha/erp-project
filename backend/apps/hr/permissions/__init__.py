# -*- coding: utf-8 -*-
from rest_framework.permissions import BasePermission


class IsRHOuDirection(BasePermission):
    """Accès RH et Direction uniquement."""
    NIVEAUX = ['direction', 'rh']

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.user_roles.filter(
            actif=True, role__niveau__in=self.NIVEAUX
        ).exists()


class IsOwnEmployeOrRH(BasePermission):
    """Un employé peut voir ses propres données, RH voit tout."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        # RH et Direction voient tout
        if request.user.user_roles.filter(
            actif=True, role__niveau__in=['rh', 'direction']
        ).exists():
            return True
        # L'employé voit ses propres données
        if hasattr(obj, 'employe'):
            return (
                hasattr(request.user, 'employe') and
                obj.employe == request.user.employe
            )
        return False