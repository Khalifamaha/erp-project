# -*- coding: utf-8 -*-
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from ..serializers import LoginSerializer, EmployeLoginSerializer, ChangePasswordSerializer


def _user_payload(user):
    return {
        'id':          str(user.id),
        'email':       user.email,
        'nom':         user.nom,
        'prenom':      user.prenom,
        'nom_complet': user.nom_complet,
        'is_staff':    user.is_staff,
        'langue':      user.langue,
        'roles':       list(user.roles.values_list('nom', flat=True)),
    }


def _employe_payload(employe):
    return {
        'id':           str(employe.id),
        'matricule':    employe.matricule,
        'poste':        employe.poste,
        'departement':  employe.departement,
        'nom_complet':  employe.nom_complet,
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    POST /api/auth/login/
    Body: { "email": "...", "password": "..." }
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user   = serializer.validated_data['user']
    tokens = serializer.get_tokens(user)

    # Mettre à jour la dernière connexion
    user.derniere_connexion = timezone.now()
    user.save(update_fields=['derniere_connexion'])

    return Response({
        'access':  tokens['access'],
        'refresh': tokens['refresh'],
        'user':    _user_payload(user),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_employe_view(request):
    """
    POST /api/auth/login-employe/
    Body: { "matricule": "EMP004", "password": "..." }
    """
    serializer = EmployeLoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user    = serializer.validated_data['user']
    employe = serializer.validated_data['employe']
    tokens  = serializer.get_tokens(user)

    user.derniere_connexion = timezone.now()
    user.save(update_fields=['derniere_connexion'])

    return Response({
        'access':  tokens['access'],
        'refresh': tokens['refresh'],
        'user':    _user_payload(user),
        'employe': _employe_payload(employe),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    POST /api/auth/logout/
    Body: { "refresh": "..." }
    """
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Token refresh requis.'}, status=status.HTTP_400_BAD_REQUEST)
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Déconnexion réussie.'}, status=status.HTTP_200_OK)
    except TokenError:
        return Response({'error': 'Token invalide.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_view(request):
    """
    POST /api/auth/refresh/
    Body: { "refresh": "..." }
    """
    try:
        refresh = RefreshToken(request.data.get('refresh'))
        return Response({
            'access': str(refresh.access_token)
        }, status=status.HTTP_200_OK)
    except TokenError:
        return Response({'error': 'Token invalide ou expiré.'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    POST /api/auth/change-password/
    """
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(serializer.validated_data['nouveau_mot_de_passe'])
    request.user.save(update_fields=['password'])
    return Response({'message': 'Mot de passe modifié avec succès.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """
    GET /api/auth/me/
    Retourne les infos de l'utilisateur connecté.
    """
    user = request.user
    payload = {
        'id':          str(user.id),
        'email':       user.email,
        'nom':         user.nom,
        'prenom':      user.prenom,
        'nom_complet': user.nom_complet,
        'telephone':   user.telephone,
        'avatar_url':  user.avatar_url,
        'langue':      user.langue,
        'is_staff':    user.is_staff,
        'roles':       list(user.roles.values('id', 'nom', 'niveau')),
    }
    employe = getattr(user, 'employe', None)
    if employe is not None:
        try:
            payload['employe'] = _employe_payload(employe)
        except Exception:
            pass
    return Response(payload)