# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings


class ContrainteMachine(models.Model):
    """
    Periode pendant laquelle une machine est indisponible
    (maintenance, arret programme, formation...).
    Utilisee pour detecter les conflits lors du planning.
    """

    TYPE_CHOICES = [
        ('maintenance',  'Maintenance programmee'),
        ('arret',        'Arret programme'),
        ('formation',    'Formation operateur'),
        ('panne',        'Panne (auto)'),
        ('conge',        'Conge / Fermeture'),
        ('autre',        'Autre'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    machine      = models.ForeignKey(
        'production.Machine', on_delete=models.CASCADE,
        related_name='contraintes'
    )
    heure_debut  = models.DateTimeField()
    heure_fin    = models.DateTimeField()
    type_contrainte = models.CharField(max_length=15, choices=TYPE_CHOICES, default='arret')
    motif        = models.TextField(blank=True)
    cree_par     = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='contraintes_creees'
    )
    date_creation= models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table            = 'contrainte_machine'
        verbose_name        = 'Contrainte machine'
        verbose_name_plural = 'Contraintes machines'
        ordering            = ['heure_debut']
        indexes             = [
            models.Index(fields=['machine', 'heure_debut']),
        ]

    def __str__(self):
        return f"{self.machine.code} | {self.type_contrainte} | {self.heure_debut} -> {self.heure_fin}"

    @property
    def duree_heures(self):
        delta = self.heure_fin - self.heure_debut
        return round(delta.total_seconds() / 3600, 2)