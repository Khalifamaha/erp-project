# -*- coding: utf-8 -*-
import uuid
from django.db import models


class Client(models.Model):

    TYPE_CHOICES = [
        ('entreprise', 'Entreprise'),
        ('particulier','Particulier'),
        ('export',     'Client export'),
    ]

    STATUT_CHOICES = [
        ('actif',    'Actif'),
        ('inactif',  'Inactif'),
        ('prospect', 'Prospect'),
        ('bloque',   'Bloque'),
    ]

    CONDITIONS_PAIEMENT = [
        ('comptant',  'Paiement comptant'),
        ('30j',       '30 jours'),
        ('60j',       '60 jours'),
        ('90j',       '90 jours'),
    ]

    id                   = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code                 = models.CharField(max_length=20, unique=True)
    raison_sociale       = models.CharField(max_length=200)
    type                 = models.CharField(max_length=12, choices=TYPE_CHOICES, default='entreprise')
    contact_principal    = models.CharField(max_length=100, blank=True)
    email                = models.EmailField(blank=True)
    telephone            = models.CharField(max_length=30, blank=True)
    adresse              = models.TextField(blank=True)
    ville                = models.CharField(max_length=100, blank=True)
    pays                 = models.CharField(max_length=100, default='Tunisie')
    num_fiscal           = models.CharField(max_length=50, blank=True)
    devise               = models.CharField(max_length=5, default='TND')
    conditions_paiement  = models.CharField(max_length=10, choices=CONDITIONS_PAIEMENT, default='30j')
    delai_paiement_jours = models.IntegerField(default=30)
    limite_credit        = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    score_credit         = models.IntegerField(default=100)
    statut               = models.CharField(max_length=10, choices=STATUT_CHOICES, default='actif')
    notes                = models.TextField(blank=True)
    date_creation        = models.DateTimeField(auto_now_add=True)
    date_modification    = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'client'
        verbose_name        = 'Client'
        verbose_name_plural = 'Clients'
        ordering            = ['raison_sociale']
        indexes             = [
            models.Index(fields=['code']),
            models.Index(fields=['statut']),
        ]

    def __str__(self):
        return f"[{self.code}] {self.raison_sociale}"

    @property
    def encours_client(self):
        from django.db.models import Sum
        return self.commandes.filter(
            statut__in=['confirmee', 'en_cours', 'partielle']
        ).aggregate(t=Sum('montant_total'))['t'] or 0

    @property
    def credit_disponible(self):
        return max(0, float(self.limite_credit) - float(self.encours_client))