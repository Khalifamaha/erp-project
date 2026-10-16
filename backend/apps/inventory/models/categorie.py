# -*- coding: utf-8 -*-
import uuid
from django.db import models


class CategorieProduitsManager(models.Manager):
    def racines(self):
        return self.filter(parent__isnull=True)


class CategorieProduit(models.Model):

    TYPE_CHOICES = [
        ('matiere_premiere', 'Matiere premiere'),
        ('produit_fini',     'Produit fini'),
        ('semi_fini',        'Semi-fini'),
        ('consommable',      'Consommable'),
        ('piece_rechange',   'Piece de rechange'),
        ('emballage',        'Emballage'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom           = models.CharField(max_length=100)
    type          = models.CharField(max_length=20, choices=TYPE_CHOICES)
    parent        = models.ForeignKey(
        'self', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='sous_categories'
    )
    niveau_arbre  = models.IntegerField(default=0)
    description   = models.TextField(blank=True)
    actif         = models.BooleanField(default=True)

    objects = CategorieProduitsManager()

    class Meta:
        db_table            = 'categorie_produit'
        verbose_name        = 'Categorie produit'
        verbose_name_plural = 'Categories produits'
        ordering            = ['niveau_arbre', 'nom']

    def __str__(self):
        return f"{self.nom} ({self.type})"

    def save(self, *args, **kwargs):
        if self.parent:
            self.niveau_arbre = self.parent.niveau_arbre + 1
        else:
            self.niveau_arbre = 0
        super().save(*args, **kwargs)