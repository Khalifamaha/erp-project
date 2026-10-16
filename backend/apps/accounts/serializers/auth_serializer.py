# -*- coding: utf-8 -*-
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from apps.hr.models import Employe
from ..models import User


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Email ou mot de passe incorrect.")
        if not user.is_active:
            raise serializers.ValidationError("Ce compte est désactivé.")
        data['user'] = user
        return data

    def get_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access':  str(refresh.access_token),
        }


class EmployeLoginSerializer(serializers.Serializer):
    matricule = serializers.CharField(max_length=20, trim_whitespace=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        matricule = data['matricule'].strip()
        try:
            employe = Employe.objects.select_related('utilisateur').get(
                matricule__iexact=matricule
            )
        except Employe.DoesNotExist:
            raise serializers.ValidationError(
                'Matricule ou mot de passe incorrect.'
            )

        if employe.statut != 'actif':
            raise serializers.ValidationError(
                "Accès refusé : cet employé n'est pas actif."
            )

        user = employe.utilisateur
        if not user:
            raise serializers.ValidationError(
                "Aucun compte n'est associé à ce matricule. Contactez les RH."
            )

        if not user.check_password(data['password']):
            raise serializers.ValidationError(
                'Matricule ou mot de passe incorrect.'
            )
        if not user.is_active:
            raise serializers.ValidationError('Ce compte est désactivé.')

        data['user'] = user
        data['employe'] = employe
        return data

    def get_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access':  str(refresh.access_token),
        }


class TokenResponseSerializer(serializers.Serializer):
    """Utilisé uniquement pour la documentation de l'API."""
    access  = serializers.CharField()
    refresh = serializers.CharField()
    user    = serializers.DictField()


class ChangePasswordSerializer(serializers.Serializer):
    ancien_mot_de_passe  = serializers.CharField(write_only=True)
    nouveau_mot_de_passe = serializers.CharField(write_only=True, min_length=8)
    confirmation         = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['nouveau_mot_de_passe'] != data['confirmation']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return data

    def validate_ancien_mot_de_passe(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Ancien mot de passe incorrect.")
        return value