# -*- coding: utf-8 -*-
import uuid
from django.db import models


class Role(models.Model):

    NIVEAU_CHOICES = [
        ('direction',   'Direction'),
        ('chef',        'Chef de service'),
        ('operateur',   'Opérateur'),
        ('technicien',  'Technicien'),
        ('comptable',   'Comptable'),
        ('rh',          'Ressources humaines'),
        ('lecture',     'Lecture seule'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom         = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    permissions = models.JSONField(default=dict, blank=True)
    niveau      = models.CharField(max_length=20, choices=NIVEAU_CHOICES, default='operateur')
    systeme     = models.BooleanField(default=False)

    class Meta:
        db_table        = 'role'
        verbose_name    = 'Rôle'
        verbose_name_plural = 'Rôles'
        ordering        = ['nom']

    def __str__(self):
        return self.nom