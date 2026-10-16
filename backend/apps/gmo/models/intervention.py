# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings
from .panne import Panne


class Intervention(models.Model):

    RESULTAT_CHOICES = [
        ('resolu',        'Panne resolue'),
        ('partiel',       'Partiellement resolu'),
        ('non_resolu',    'Non resolu — escalade'),
        ('piece_manquante','En attente piece de rechange'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    panne               = models.ForeignKey(
        Panne, on_delete=models.CASCADE, related_name='interventions'
    )
    technicien          = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='interventions_effectuees'
    )
    debut_intervention  = models.DateTimeField()
    fin_intervention    = models.DateTimeField(null=True, blank=True)
    actions_effectuees  = models.TextField()
    resultat            = models.CharField(max_length=20, choices=RESULTAT_CHOICES, default='resolu')
    pieces_utilisees    = models.TextField(blank=True, help_text='Liste des pieces remplacees')
    cout_pieces         = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    cout_main_oeuvre    = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    resolu              = models.BooleanField(default=False)
    observations        = models.TextField(blank=True)
    date_creation       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table            = 'intervention'
        verbose_name        = 'Intervention'
        verbose_name_plural = 'Interventions'
        ordering            = ['-debut_intervention']

    def __str__(self):
        return f"INT {self.panne.machine.code} | {self.technicien} | {self.resultat}"

    @property
    def duree_intervention_min(self):
        if self.fin_intervention and self.debut_intervention:
            delta = self.fin_intervention - self.debut_intervention
            return round(delta.total_seconds() / 60, 2)
        return 0

    @property
    def cout_total(self):
        return round(float(self.cout_pieces) + float(self.cout_main_oeuvre), 3)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Si resolu, cloturer la panne
        if self.resolu and self.fin_intervention:
            panne = self.panne
            if panne.statut != 'resolue':
                panne.date_fin = self.fin_intervention
                panne.statut   = 'resolue'
                panne.cout_estime = float(panne.cout_estime) + self.cout_total
                panne.save()