# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings


class FicheNC(models.Model):
    """Fiche de Non-Conformite — workflow 8D."""

    GRAVITE_CHOICES = [
        ('mineure',  'Mineure'),
        ('moyenne',  'Moyenne'),
        ('haute',    'Haute'),
        ('critique', 'Critique — arret production'),
    ]

    TYPE_NC_CHOICES = [
        ('produit',    'Non-conformite produit'),
        ('processus',  'Non-conformite processus'),
        ('matiere',    'Non-conformite matiere premiere'),
        ('fournisseur','Non-conformite fournisseur'),
        ('systeme',    'Non-conformite systeme'),
    ]

    STATUT_CHOICES = [
        ('ouverte',    'Ouverte'),
        ('en_cours',   'En cours de traitement'),
        ('en_attente', 'En attente validation'),
        ('cloturee',   'Cloturee'),
        ('annulee',    'Annulee'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    controle            = models.ForeignKey(
        'quality.ControleQualite', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='fiches_nc'
    )
    lot                 = models.ForeignKey(
        'inventory.Lot', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='fiches_nc'
    )
    produit             = models.ForeignKey(
        'inventory.Produit', on_delete=models.PROTECT, related_name='fiches_nc'
    )
    numero_nc           = models.CharField(max_length=50, unique=True)
    gravite             = models.CharField(max_length=10, choices=GRAVITE_CHOICES, default='moyenne')
    type_nc             = models.CharField(max_length=15, choices=TYPE_NC_CHOICES, default='produit')
    description_defaut  = models.TextField()
    cause_racine        = models.TextField(blank=True)
    action_immediate    = models.TextField(blank=True)
    action_corrective   = models.TextField(blank=True)
    action_preventive   = models.TextField(blank=True)
    responsable         = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='nc_responsable'
    )
    delai_resolution    = models.DateField(null=True, blank=True)
    date_cloture        = models.DateField(null=True, blank=True)
    statut              = models.CharField(max_length=15, choices=STATUT_CHOICES, default='ouverte')
    lot_bloque          = models.BooleanField(default=False)
    ouverte_par         = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='nc_ouvertes'
    )
    cloturee_par        = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='nc_cloturees'
    )
    date_creation       = models.DateTimeField(auto_now_add=True)
    date_modification   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'fiche_nc'
        verbose_name        = 'Fiche NC'
        verbose_name_plural = 'Fiches NC'
        ordering            = ['-date_creation']
        indexes             = [
            models.Index(fields=['statut', 'gravite']),
            models.Index(fields=['produit', 'statut']),
            models.Index(fields=['numero_nc']),
        ]

    def __str__(self):
        return f"{self.numero_nc} | {self.produit.reference} | {self.gravite} | {self.statut}"

    def cloturer(self, user=None):
        from django.utils import timezone
        self.statut       = 'cloturee'
        self.date_cloture = timezone.now().date()
        self.cloturee_par = user
        self.lot_bloque   = False
        self.save(update_fields=['statut', 'date_cloture', 'cloturee_par', 'lot_bloque'])
        # Debloquer le lot
        if self.lot and self.lot.statut == 'bloque':
            self.lot.statut = 'disponible'
            self.lot.save(update_fields=['statut'])

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Bloquer le lot si necessaire
        if self.lot_bloque and self.lot and self.lot.statut == 'disponible':
            self.lot.statut = 'bloque'
            self.lot.save(update_fields=['statut'])


class SuiviActionNC(models.Model):
    """Suivi des actions correctives/preventives sur une fiche NC."""

    TYPE_ACTION_CHOICES = [
        ('immediate',   'Action immediate'),
        ('corrective',  'Action corrective'),
        ('preventive',  'Action preventive'),
        ('verification','Verification efficacite'),
    ]

    STATUT_CHOICES = [
        ('planifiee',  'Planifiee'),
        ('en_cours',   'En cours'),
        ('realisee',   'Realisee'),
        ('verifiee',   'Verifiee efficace'),
        ('abandonnee', 'Abandonnee'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fiche_nc        = models.ForeignKey(
        FicheNC, on_delete=models.CASCADE, related_name='actions'
    )
    type_action     = models.CharField(max_length=15, choices=TYPE_ACTION_CHOICES)
    description     = models.TextField()
    responsable     = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='actions_nc_responsable'
    )
    date_prevue     = models.DateField()
    date_realisation= models.DateField(null=True, blank=True)
    statut          = models.CharField(max_length=15, choices=STATUT_CHOICES, default='planifiee')
    resultat        = models.TextField(blank=True)
    date_creation   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'suivi_action_nc'
        verbose_name    = 'Suivi action NC'
        verbose_name_plural = 'Suivis actions NC'
        ordering        = ['date_prevue']

    def __str__(self):
        return f"{self.fiche_nc.numero_nc} | {self.type_action} | {self.statut}"