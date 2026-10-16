# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings
from .employe import Employe


class Pointage(models.Model):

    TYPE = [
        ('normal',     'Normal'),
        ('heures_sup', 'Heures supplémentaires'),
        ('nuit',       'Travail de nuit'),
        ('weekend',    'Week-end'),
        ('ferie',      'Jour férié'),
    ]

    STATUT = [
        ('en_cours',  'En cours'),
        ('termine',   'Terminé'),
        ('valide',    'Validé'),
        ('rejete',    'Rejeté'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employe             = models.ForeignKey(Employe, on_delete=models.CASCADE, related_name='pointages')
    # lien optionnel vers la chaîne (sera complété quand app production sera créée)
    chaine_id           = models.UUIDField(null=True, blank=True)
    date                = models.DateField()
    heure_entree        = models.DateTimeField()
    heure_sortie        = models.DateTimeField(null=True, blank=True)
    heures_travaillees  = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    heures_sup          = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    type                = models.CharField(max_length=15, choices=TYPE, default='normal')
    statut              = models.CharField(max_length=15, choices=STATUT, default='en_cours')
    valide_par          = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='pointages_valides'
    )
    date_creation       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table            = 'pointage'
        verbose_name        = 'Pointage'
        verbose_name_plural = 'Pointages'
        ordering            = ['-date', '-heure_entree']
        indexes             = [
            models.Index(fields=['employe', 'date']),
            models.Index(fields=['date', 'statut']),
        ]

    def __str__(self):
        return f"{self.employe} — {self.date}"

    def calculer_heures(self):
        """Calcule automatiquement les heures travaillées."""
        if self.heure_sortie and self.heure_entree:
            delta = self.heure_sortie - self.heure_entree
            total = round(delta.total_seconds() / 3600, 2)
            self.heures_travaillees = min(total, 8)
            self.heures_sup = max(0, round(total - 8, 2))
        return self

    def save(self, *args, **kwargs):
        self.calculer_heures()
        super().save(*args, **kwargs)