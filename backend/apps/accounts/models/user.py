# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from .role import Role


class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'email est obligatoire")
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff',     True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active',    True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):

    id                 = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email              = models.EmailField(unique=True)
    nom                = models.CharField(max_length=100)
    prenom             = models.CharField(max_length=100)
    telephone          = models.CharField(max_length=20, blank=True)
    avatar_url         = models.CharField(max_length=500, blank=True)
    langue             = models.CharField(max_length=10, default='fr')
    derniere_connexion = models.DateTimeField(null=True, blank=True)
    is_active          = models.BooleanField(default=True)
    is_staff           = models.BooleanField(default=False)
    date_creation      = models.DateTimeField(auto_now_add=True)
    date_modification  = models.DateTimeField(auto_now=True)

    roles = models.ManyToManyField(
        Role,
        through='UserRole',
        related_name='utilisateurs',
        blank=True,
    )

    objects = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom']

    class Meta:
        db_table            = 'utilisateur'
        verbose_name        = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering            = ['nom', 'prenom']

    def __str__(self):
        return f"{self.prenom} {self.nom} <{self.email}>"

    @property
    def nom_complet(self):
        return f"{self.prenom} {self.nom}"

    def a_permission_erp(self, permission: str) -> bool:
        if self.is_superuser:
            return True
        return self.user_roles.filter(
            actif=True,
            role__permissions__has_key=permission
        ).exists()


class UserRole(models.Model):

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_roles')
    role        = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='user_roles')
    date_debut  = models.DateTimeField(auto_now_add=True)
    date_fin    = models.DateTimeField(null=True, blank=True)
    actif       = models.BooleanField(default=True)

    class Meta:
        db_table        = 'utilisateur_role'
        verbose_name    = 'Rôle utilisateur'
        verbose_name_plural = 'Rôles utilisateurs'
        unique_together = [('utilisateur', 'role')]

    def __str__(self):
        return f"{self.utilisateur} → {self.role}"


class Notification(models.Model):

    PRIORITE_CHOICES = [
        ('basse',    'Basse'),
        ('normale',  'Normale'),
        ('haute',    'Haute'),
        ('critique', 'Critique'),
    ]

    TYPE_CHOICES = [
        ('STOCK_BAS',     'Stock bas'),
        ('PANNE',         'Panne machine'),
        ('OF_TERMINE',    'OF terminé'),
        ('NC_OUVERTE',    'Non-conformité ouverte'),
        ('CONGE_DEMANDE', 'Congé demandé'),
        ('PAIEMENT',      'Paiement'),
        ('MAINTENANCE',   'Maintenance préventive'),
        ('INFO',          'Information'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    destinataire  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type          = models.CharField(max_length=30, choices=TYPE_CHOICES, default='INFO')
    titre         = models.CharField(max_length=200)
    message       = models.TextField()
    data          = models.JSONField(default=dict, blank=True)
    lue           = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    priorite      = models.CharField(max_length=10, choices=PRIORITE_CHOICES, default='normale')
    module_source = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table        = 'notification'
        verbose_name    = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering        = ['-date_creation']

    def __str__(self):
        return f"[{self.type}] {self.titre} → {self.destinataire}"


class HistoriqueStatut(models.Model):

    id                = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    table_source      = models.CharField(max_length=100)
    objet_id          = models.UUIDField()
    ancien_statut     = models.CharField(max_length=50, blank=True)
    nouveau_statut    = models.CharField(max_length=50)
    modifie_par       = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='historiques'
    )
    date_modification = models.DateTimeField(auto_now_add=True)
    commentaire       = models.TextField(blank=True)

    class Meta:
        db_table        = 'historique_statut'
        verbose_name    = 'Historique statut'
        verbose_name_plural = 'Historiques statuts'
        ordering        = ['-date_modification']
        indexes         = [models.Index(fields=['table_source', 'objet_id'])]

    def __str__(self):
        return f"{self.table_source} {self.ancien_statut}→{self.nouveau_statut}"


class DocumentJoint(models.Model):

    CATEGORIE_CHOICES = [
        ('photo',      'Photo'),
        ('facture',    'Facture'),
        ('contrat',    'Contrat'),
        ('bon',        'Bon de livraison'),
        ('certificat', 'Certificat'),
        ('rapport',    'Rapport'),
        ('autre',      'Autre'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    table_source = models.CharField(max_length=100)
    objet_id     = models.UUIDField()
    nom_fichier  = models.CharField(max_length=255)
    type_mime    = models.CharField(max_length=100)
    url_stockage = models.CharField(max_length=500)
    taille_ko    = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    uploade_par  = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='documents'
    )
    date_upload  = models.DateTimeField(auto_now_add=True)
    categorie    = models.CharField(max_length=20, choices=CATEGORIE_CHOICES, default='autre')

    class Meta:
        db_table        = 'document_joint'
        verbose_name    = 'Document joint'
        verbose_name_plural = 'Documents joints'
        ordering        = ['-date_upload']
        indexes         = [models.Index(fields=['table_source', 'objet_id'])]

    def __str__(self):
        return f"{self.nom_fichier} ({self.table_source}:{self.objet_id})"