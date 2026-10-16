# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings
from .employe import Employe


class Conge(models.Model):

    TYPE_CONGE = [
        ('annuel',      'Congé annuel'),
        ('maladie',     'Congé maladie'),
        ('maternite',   'Congé maternité'),
        ('paternite',   'Congé paternité'),
        ('sans_solde',  'Sans solde'),
        ('exceptionnel','Exceptionnel'),
        ('recuperation','Récupération'),
    ]

    STATUT = [
        ('en_attente', 'En attente'),
        ('approuve',   'Approuvé'),
        ('refuse',     'Refusé'),
        ('annule',     'Annulé'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employe       = models.ForeignKey(Employe, on_delete=models.CASCADE, related_name='conges')
    date_debut    = models.DateField()
    date_fin      = models.DateField()
    nombre_jours  = models.IntegerField(default=1)
    type_conge    = models.CharField(max_length=20, choices=TYPE_CONGE, default='annuel')
    statut        = models.CharField(max_length=15, choices=STATUT, default='en_attente')
    motif         = models.TextField(blank=True)
    approuve_par  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='conges_approuves'
    )
    date_demande  = models.DateTimeField(auto_now_add=True)
    date_decision = models.DateTimeField(null=True, blank=True)
    commentaire_rh= models.TextField(blank=True)

    class Meta:
        db_table            = 'conge'
        verbose_name        = 'Congé'
        verbose_name_plural = 'Congés'
        ordering            = ['-date_demande']
        indexes             = [
            models.Index(fields=['employe', 'statut']),
            models.Index(fields=['date_debut', 'date_fin']),
        ]

    def __str__(self):
        return f"{self.employe} — {self.type_conge} ({self.date_debut} → {self.date_fin})"

    def save(self, *args, **kwargs):
        # Calcul automatique du nombre de jours
        if self.date_debut and self.date_fin:
            delta = self.date_fin - self.date_debut
            self.nombre_jours = delta.days + 1
        # Déduire du solde si approuvé
        if self.statut == 'approuve' and self.type_conge == 'annuel':
            self.employe.solde_conge = max(0, self.employe.solde_conge - self.nombre_jours)
            self.employe.save(update_fields=['solde_conge'])
        super().save(*args, **kwargs)