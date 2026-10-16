# -*- coding: utf-8 -*-
import uuid
from django.db import models


class Fournisseur(models.Model):

    STATUT_CHOICES = [
        ('actif',    'Actif'),
        ('inactif',  'Inactif'),
        ('blacklist','Liste noire'),
        ('prospect', 'Prospect'),
    ]

    CATEGORIE_CHOICES = [
        ('matiere_premiere', 'Matiere premiere'),
        ('piece_rechange',   'Piece de rechange'),
        ('consommable',      'Consommable'),
        ('service',          'Prestataire service'),
        ('transport',        'Transport logistique'),
        ('autre',            'Autre'),
    ]

    CONDITIONS_PAIEMENT = [
        ('comptant',  'Paiement comptant'),
        ('30j',       '30 jours'),
        ('60j',       '60 jours'),
        ('90j',       '90 jours'),
        ('avance',    'Paiement a l avance'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code                = models.CharField(max_length=20, unique=True)
    raison_sociale      = models.CharField(max_length=200)
    contact             = models.CharField(max_length=100, blank=True)
    email               = models.EmailField(blank=True)
    telephone           = models.CharField(max_length=30, blank=True)
    telephone2          = models.CharField(max_length=30, blank=True)
    adresse             = models.TextField(blank=True)
    ville               = models.CharField(max_length=100, blank=True)
    pays                = models.CharField(max_length=100, default='Tunisie')
    num_fiscal          = models.CharField(max_length=50, blank=True)
    num_rc              = models.CharField(max_length=50, blank=True)
    statut              = models.CharField(max_length=15, choices=STATUT_CHOICES, default='actif')
    categorie           = models.CharField(max_length=20, choices=CATEGORIE_CHOICES, default='matiere_premiere')
    delai_livraison     = models.IntegerField(default=7, help_text='Delai moyen en jours')
    score_qualite       = models.IntegerField(default=100, help_text='Score de 0 a 100')
    devise_pref         = models.CharField(max_length=5, default='TND')
    conditions_paiement = models.CharField(max_length=10, choices=CONDITIONS_PAIEMENT, default='30j')
    delai_paiement_jours= models.IntegerField(default=30)
    notes               = models.TextField(blank=True)
    date_creation       = models.DateTimeField(auto_now_add=True)
    date_modification   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'fournisseur'
        verbose_name        = 'Fournisseur'
        verbose_name_plural = 'Fournisseurs'
        ordering            = ['raison_sociale']
        indexes             = [
            models.Index(fields=['code']),
            models.Index(fields=['statut']),
            models.Index(fields=['categorie']),
        ]

    def __str__(self):
        return f"[{self.code}] {self.raison_sociale}"

    @property
    def nombre_commandes(self):
        return self.commandes.count()

    @property
    def montant_total_achats(self):
        from django.db.models import Sum
        result = self.commandes.filter(
            statut__in=['livree', 'partielle']
        ).aggregate(total=Sum('montant_total'))
        return result['total'] or 0