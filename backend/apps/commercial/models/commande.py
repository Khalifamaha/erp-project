# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings
from .client import Client


class CommandeClient(models.Model):

    STATUT_CHOICES = [
        ('brouillon',  'Brouillon'),
        ('confirmee',  'Confirmee'),
        ('en_cours',   'En cours de production'),
        ('partielle',  'Livraison partielle'),
        ('livree',     'Livree completement'),
        ('facturee',   'Facturee'),
        ('annulee',    'Annulee'),
    ]

    INCOTERM_CHOICES = [
        ('EXW', 'EXW - Depart usine'),
        ('FOB', 'FOB - Franco a bord'),
        ('CIF', 'CIF - Cout assurance fret'),
        ('DDP', 'DDP - Rendu droits acquittes'),
        ('DAP', 'DAP - Rendu au lieu'),
    ]

    id                      = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    numero                  = models.CharField(max_length=30, unique=True)
    client                  = models.ForeignKey(
        Client, on_delete=models.PROTECT, related_name='commandes'
    )
    date_commande           = models.DateField()
    date_livraison_souhaitee= models.DateField(null=True, blank=True)
    date_livraison_confirmee= models.DateField(null=True, blank=True)
    montant_total           = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    statut                  = models.CharField(max_length=15, choices=STATUT_CHOICES, default='brouillon')
    devise                  = models.CharField(max_length=5, default='TND')
    incoterm                = models.CharField(max_length=5, choices=INCOTERM_CHOICES,
                                               blank=True, default='EXW')
    commercial              = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='commandes_client'
    )
    notes                   = models.TextField(blank=True)
    date_creation           = models.DateTimeField(auto_now_add=True)
    date_modification       = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'commande_client'
        verbose_name        = 'Commande client'
        verbose_name_plural = 'Commandes clients'
        ordering            = ['-date_commande']
        indexes             = [
            models.Index(fields=['client', 'statut']),
            models.Index(fields=['numero']),
            models.Index(fields=['date_livraison_confirmee']),
        ]

    def __str__(self):
        return f"{self.numero} — {self.client.raison_sociale} ({self.statut})"

    def recalculer_montant(self):
        from django.db.models import Sum, F, ExpressionWrapper, DecimalField
        result = self.lignes.aggregate(
            total=Sum(
                ExpressionWrapper(
                    F('quantite_commandee') * F('prix_unitaire') *
                    (1 - F('remise_pct') / 100),
                    output_field=DecimalField()
                )
            )
        )
        self.montant_total = result['total'] or 0
        self.save(update_fields=['montant_total'])

    @property
    def taux_livraison(self):
        lignes = self.lignes.all()
        if not lignes:
            return 0
        total_cmd = sum(float(l.quantite_commandee) for l in lignes)
        total_liv = sum(float(l.quantite_livree) for l in lignes)
        if total_cmd == 0:
            return 0
        return round((total_liv / total_cmd) * 100, 1)


class LigneCommandeClient(models.Model):

    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('en_cours',   'En cours de production'),
        ('partielle',  'Livraison partielle'),
        ('livree',     'Livree'),
        ('annulee',    'Annulee'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    commande            = models.ForeignKey(
        CommandeClient, on_delete=models.CASCADE, related_name='lignes'
    )
    produit             = models.ForeignKey(
        'inventory.Produit', on_delete=models.PROTECT, related_name='lignes_commande_client'
    )
    quantite_commandee  = models.DecimalField(max_digits=12, decimal_places=3)
    quantite_livree     = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    prix_unitaire       = models.DecimalField(max_digits=12, decimal_places=3)
    remise_pct          = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    statut              = models.CharField(max_length=15, choices=STATUT_CHOICES, default='en_attente')
    date_livraison_prev = models.DateField(null=True, blank=True)

    class Meta:
        db_table        = 'ligne_commande_client'
        verbose_name    = 'Ligne commande client'
        verbose_name_plural = 'Lignes commandes clients'

    def __str__(self):
        return f"{self.commande.numero} | {self.produit.reference} x{self.quantite_commandee}"

    @property
    def montant_ligne(self):
        base   = float(self.quantite_commandee) * float(self.prix_unitaire)
        remise = base * float(self.remise_pct) / 100
        return round(base - remise, 3)

    @property
    def quantite_restante(self):
        return max(0, float(self.quantite_commandee) - float(self.quantite_livree))