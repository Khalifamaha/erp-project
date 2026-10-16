# -*- coding: utf-8 -*-
import uuid
from django.db import models
from .produit import Produit


class Lot(models.Model):

    STATUT_CHOICES = [
        ('disponible',  'Disponible'),
        ('quarantaine', 'En quarantaine'),
        ('bloque',      'Bloque'),
        ('epuise',      'Epuise'),
        ('expire',      'Expire'),
        ('rebut',       'Rebut'),
    ]

    ORIGINE_CHOICES = [
        ('achat',      'Achat fournisseur'),
        ('production', 'Production interne'),
        ('retour',     'Retour client'),
        ('transfert',  'Transfert inter-site'),
    ]

    id                = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit           = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='lots')
    numero_lot        = models.CharField(max_length=50, unique=True)
    numero_serie      = models.CharField(max_length=50, blank=True)
    date_fabrication  = models.DateField(null=True, blank=True)
    date_expiration   = models.DateField(null=True, blank=True)
    quantite_initiale = models.DecimalField(max_digits=12, decimal_places=3)
    quantite_restante = models.DecimalField(max_digits=12, decimal_places=3)
    statut            = models.CharField(max_length=15, choices=STATUT_CHOICES, default='disponible')
    origine           = models.CharField(max_length=15, choices=ORIGINE_CHOICES, default='achat')
    ordre_fab_id      = models.UUIDField(null=True, blank=True)
    fournisseur_nom   = models.CharField(max_length=100, blank=True)
    cout_unitaire     = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    # CORRECTION : 'inventory.EmplacementStock' au lieu de 'produit.EmplacementStock'
    emplacement       = models.ForeignKey(
        'inventory.EmplacementStock',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='lots'
    )
    notes             = models.TextField(blank=True)
    date_creation     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table            = 'lot'
        verbose_name        = 'Lot'
        verbose_name_plural = 'Lots'
        ordering            = ['-date_creation']
        indexes             = [
            models.Index(fields=['produit', 'statut']),
            models.Index(fields=['numero_lot']),
            models.Index(fields=['date_expiration']),
        ]

    def __str__(self):
        return f"LOT-{self.numero_lot} | {self.produit.reference} ({self.quantite_restante} {self.produit.unite_mesure})"

    @property
    def est_expire(self):
        from django.utils import timezone
        if self.date_expiration:
            return self.date_expiration < timezone.now().date()
        return False

    @property
    def taux_consommation(self):
        if float(self.quantite_initiale) == 0:
            return 0
        consomme = float(self.quantite_initiale) - float(self.quantite_restante)
        return round((consomme / float(self.quantite_initiale)) * 100, 1)