from rest_framework.permissions import BasePermission


class IsStockManagerOrReadOnly(BasePermission):
    """Lecture pour tous, ecriture pour gestionnaires stock et direction."""
    NIVEAUX_WRITE = ['direction', 'chef', 'rh']

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        if request.user.is_superuser:
            return True
        return request.user.user_roles.filter(
            actif=True, role__niveau__in=self.NIVEAUX_WRITE
        ).exists()