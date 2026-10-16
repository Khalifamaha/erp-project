# -*- coding: utf-8 -*-
import uuid
from django.db import models


class CritereQualite(models.Model):

    TYPE_MESURE_CHOICES = [
        ('dimensionnel',  'Dimensionnel (mm, cm)'),
        ('masse',         'Masse (kg, g)'),
        ('visuel',        'Visuel (conforme/non conforme)'),
        ('fonctionnel',   'Test fonctionnel'),
        ('electrique',    'Mesure electrique (V, A, Ohm)'),
        ('pression',      'Pression (bar, Pa)'),
        ('temperature',   'Temperature (C, K)'),
        ('durete',        'Durete (HRC, HB)'),
        ('rugosite',      'Rugosite (Ra, Rz)'),
        ('autre',         'Autre'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit         = models.ForeignKey(
        'inventory.Produit', on_delete=models.CASCADE, related_name='criteres_qualite'
    )
    nom             = models.CharField(max_length=200)
    type_mesure     = models.CharField(max_length=15, choices=TYPE_MESURE_CHOICES)
    valeur_min      = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    valeur_max      = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    valeur_cible    = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    unite           = models.CharField(max_length=20, blank=True)
    critique        = models.BooleanField(default=False,
                                          help_text='Si True, tout ecart bloque la production')
    methode_controle= models.TextField(blank=True)
    frequence       = models.CharField(max_length=100, blank=True,
                                       help_text='Ex: 1 piece sur 10, debut de serie...')
    actif           = models.BooleanField(default=True)
    date_creation   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table            = 'critere_qualite'
        verbose_name        = 'Critere qualite'
        verbose_name_plural = 'Criteres qualite'
        ordering            = ['produit', '-critique', 'nom']
        indexes             = [
            models.Index(fields=['produit', 'actif']),
        ]

    def __str__(self):
        return f"{self.produit.reference} | {self.nom} ({self.type_mesure})"

    def est_dans_tolerance(self, valeur):
        """Verifie si une valeur est dans les tolerances."""
        v = float(valeur)
        if self.valeur_min is not None and v < float(self.valeur_min):
            return False
        if self.valeur_max is not None and v > float(self.valeur_max):
            return False
        return True

    @property
    def tolerance_label(self):
        if self.valeur_min is not None and self.valeur_max is not None:
            return f"{self.valeur_min} - {self.valeur_max} {self.unite}"
        if self.valeur_cible is not None:
            return f"Cible: {self.valeur_cible} {self.unite}"
        return "Visuel"