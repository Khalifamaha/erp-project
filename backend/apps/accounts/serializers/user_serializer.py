# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import User, Role, UserRole, Notification


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Role
        fields = ['id', 'nom', 'niveau', 'description', 'permissions']


class UserRoleSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)

    class Meta:
        model  = UserRole
        fields = ['id', 'role', 'date_debut', 'date_fin', 'actif']


class UserSerializer(serializers.ModelSerializer):
    """Serializer complet — lecture."""
    nom_complet = serializers.ReadOnlyField()
    roles_detail = UserRoleSerializer(source='user_roles', many=True, read_only=True)

    class Meta:
        model  = User
        fields = [
            'id', 'email', 'nom', 'prenom', 'nom_complet',
            'telephone', 'avatar_url', 'langue',
            'is_active', 'is_staff', 'date_creation',
            'roles_detail',
        ]
        read_only_fields = ['id', 'date_creation', 'nom_complet']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un utilisateur."""
    password         = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['email', 'nom', 'prenom', 'telephone', 'langue', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user     = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la modification du profil."""
    class Meta:
        model  = User
        fields = ['nom', 'prenom', 'telephone', 'avatar_url', 'langue']


class UserMiniSerializer(serializers.ModelSerializer):
    """Serializer léger — utilisé dans les FK d'autres modules."""
    class Meta:
        model  = User
        fields = ['id', 'nom', 'prenom', 'email']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = ['id', 'type', 'titre', 'message', 'data', 'lue', 'priorite', 'date_creation']
        read_only_fields = ['id', 'date_creation']