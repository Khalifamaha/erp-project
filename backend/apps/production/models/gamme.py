# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings
from .machine import Machine


class GammeOperatoire(models.Model):
    """
    Gamme operatoire : sequence d operations pour fabriquer un produit.
    Versionnee — plusieurs versions peuvent exister, une seule active.
    """

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit       = models.ForeignKey(
        'inventory.Produit', on_delete=models.CASCADE, related_name='gammes'
    )
    nom           = models.CharField(max_length=200)
    version       = models.IntegerField(default=1)
    active        = models.BooleanField(default=True)
    date_validation = models.DateField(null=True, blank=True)
    valide_par    = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='gammes_validees'
    )
    description   = models.TextField(blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'gamme_operatoire'
        verbose_name        = 'Gamme operatoire'
        verbose_name_plural = 'Gammes operatoires'
        ordering            = ['produit', '-version']
        unique_together     = [('produit', 'version')]
        indexes             = [
            models.Index(fields=['produit', 'active']),
        ]

    def __str__(self):
        return f"{self.nom} v{self.version} — {self.produit.reference}"

    @property
    def temps_total_min(self):
        """Temps total de production en minutes (hors reglage)."""
        return sum(float(op.temps_unitaire_min) for op in self.operations.all())

    @property
    def temps_reglage_total_min(self):
        return sum(float(op.temps_reglage_min) for op in self.operations.all())

    def activer(self):
        """Active cette version et desactive les autres."""
        GammeOperatoire.objects.filter(
            produit=self.produit, active=True
        ).exclude(pk=self.pk).update(active=False)
        self.active = True
        self.save(update_fields=['active'])


class Operation(models.Model):
    """
    Une etape dans la gamme operatoire.
    Definie par : machine, ordre, temps unitaire, temps de reglage.
    """

    TYPE_CHOICES = [
        ('usinage',    'Usinage'),
        ('decoupe',    'Decoupe'),
        ('soudure',    'Soudure'),
        ('assemblage', 'Assemblage'),
        ('pliage',     'Pliage'),
        ('controle',   'Controle qualite'),
        ('finition',   'Finition'),
        ('emballage',  'Emballage'),
        ('autre',      'Autre'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gamme               = models.ForeignKey(
        GammeOperatoire, on_delete=models.CASCADE, related_name='operations'
    )
    machine             = models.ForeignKey(
        Machine, on_delete=models.PROTECT, related_name='operations'
    )
    ordre               = models.IntegerField(help_text='Ordre d execution (1, 2, 3...)')
    nom                 = models.CharField(max_length=200)
    type_operation      = models.CharField(max_length=15, choices=TYPE_CHOICES, default='usinage')
    temps_unitaire_min  = models.DecimalField(max_digits=8, decimal_places=3,
                                              help_text='Temps en minutes par piece')
    temps_reglage_min   = models.DecimalField(max_digits=8, decimal_places=3, default=0,
                                              help_text='Temps de reglage machine')
    operateurs_requis   = models.IntegerField(default=1)
    instruction         = models.TextField(blank=True, help_text='Instruction de travail detaillee')

    class Meta:
        db_table            = 'operation'
        verbose_name        = 'Operation'
        verbose_name_plural = 'Operations'
        ordering            = ['gamme', 'ordre']
        unique_together     = [('gamme', 'ordre')]

    def __str__(self):
        return f"{self.gamme.nom} — Op{self.ordre}: {self.nom}"

    @property
    def cadence_theorique(self):
        """Pieces par heure sur cette operation."""
        if float(self.temps_unitaire_min) == 0:
            return 0
        return round(60 / float(self.temps_unitaire_min), 2)