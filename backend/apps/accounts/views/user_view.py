# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import User, Role, Notification
from ..serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    RoleSerializer, NotificationSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD complet des utilisateurs.
    GET    /api/users/           → liste
    POST   /api/users/           → créer
    GET    /api/users/{id}/      → détail
    PUT    /api/users/{id}/      → modifier
    DELETE /api/users/{id}/      → supprimer
    GET    /api/users/me/        → profil connecté
    POST   /api/users/{id}/toggle_active/ → activer/désactiver
    """
    queryset         = User.objects.all().order_by('nom', 'prenom')
    permission_classes = [IsAuthenticated]
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_staff']
    search_fields    = ['nom', 'prenom', 'email']
    ordering_fields  = ['nom', 'prenom', 'date_creation']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'toggle_active']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """GET /api/users/me/ — profil de l'utilisateur connecté."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], url_path='me/update')
    def update_me(self, request):
        """PATCH /api/users/me/update — modifier son propre profil."""
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

    @action(detail=True, methods=['post'], url_path='toggle_active')
    def toggle_active(self, request, pk=None):
        """POST /api/users/{id}/toggle_active/ — activer ou désactiver un compte."""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        return Response({
            'message': f"Compte {'activé' if user.is_active else 'désactivé'}.",
            'is_active': user.is_active,
        })

    @action(detail=True, methods=['post'], url_path='assign_role')
    def assign_role(self, request, pk=None):
        """POST /api/users/{id}/assign_role/ — assigner un rôle."""
        from ..models import UserRole
        user    = self.get_object()
        role_id = request.data.get('role_id')
        try:
            role = Role.objects.get(id=role_id)
        except Role.DoesNotExist:
            return Response({'error': 'Rôle introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        user_role, created = UserRole.objects.get_or_create(
            utilisateur=user, role=role, defaults={'actif': True}
        )
        if not created:
            user_role.actif = True
            user_role.save(update_fields=['actif'])

        return Response({'message': f"Rôle '{role.nom}' assigné à {user.nom_complet}."})


class RoleViewSet(viewsets.ModelViewSet):
    """
    CRUD des rôles.
    GET  /api/roles/     → liste
    POST /api/roles/     → créer
    GET  /api/roles/{id}/ → détail
    """
    queryset           = Role.objects.all()
    serializer_class   = RoleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['nom', 'niveau']

    def destroy(self, request, *args, **kwargs):
        role = self.get_object()
        if role.systeme:
            return Response(
                {'error': 'Ce rôle système ne peut pas être supprimé.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Notifications de l'utilisateur connecté.
    GET  /api/notifications/          → liste (non lues en premier)
    POST /api/notifications/mark_all_read/ → tout marquer comme lu
    POST /api/notifications/{id}/read/    → marquer une notif comme lue
    """
    serializer_class   = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            destinataire=self.request.user
        ).order_by('lue', '-date_creation')

    @action(detail=False, methods=['post'], url_path='mark_all_read')
    def mark_all_read(self, request):
        count = Notification.objects.filter(
            destinataire=request.user, lue=False
        ).update(lue=True)
        return Response({'message': f"{count} notification(s) marquée(s) comme lue(s)."})

    @action(detail=True, methods=['post'], url_path='read')
    def read(self, request, pk=None):
        notif = self.get_object()
        notif.lue = True
        notif.save(update_fields=['lue'])
        return Response({'message': 'Notification lue.'})