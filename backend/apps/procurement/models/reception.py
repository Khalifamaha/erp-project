# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings
from .commande import CommandeAchat, LigneCommandeAchat


class Reception(models.Model):
    """
    Bon de reception — enregistre une livraison physique du fournisseur.
    Peut etre partielle (plusieurs receptions pour une meme commande).
    """

    STATUT_CHOICES = [
        ('en_cours',  'En cours de controle'),
        ('acceptee',  'Acceptee en stock'),
        ('refusee',   'Refusee — retour fournisseur'),
        ('partielle', 'Acceptee partiellement'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    numero          = models.CharField(max_length=30, unique=True)
    commande        = models.ForeignKey(
        CommandeAchat, on_delete=models.PROTECT, related_name='receptions'
    )
    date_reception  = models.DateField()
    statut          = models.CharField(max_length=15, choices=STATUT_CHOICES, default='en_cours')
    num_bl          = models.CharField(max_length=50, blank=True, help_text='Numero bon livraison fournisseur')
    num_camion      = models.CharField(max_length=30, blank=True)
    receptionniste  = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='receptions_effectuees'
    )
    observations    = models.TextField(blank=True)
    date_creation   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table            = 'reception'
        verbose_name        = 'Reception'
        verbose_name_plural = 'Receptions'
        ordering            = ['-date_reception']

    def __str__(self):
        return f"{self.numero} — {self.commande.numero} ({self.date_reception})"


class LigneReception(models.Model):
    """Detail de ce qui a ete effectivement recu pour chaque ligne de commande."""

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reception           = models.ForeignKey(
        Reception, on_delete=models.CASCADE, related_name='lignes'
    )
    ligne_commande      = models.ForeignKey(
        LigneCommandeAchat, on_delete=models.PROTECT, related_name='receptions'
    )
    quantite_recue      = models.DecimalField(max_digits=12, decimal_places=3)
    quantite_acceptee   = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    quantite_refusee    = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    numero_lot          = models.CharField(max_length=50, blank=True)
    date_expiration_lot = models.DateField(null=True, blank=True)
    observations        = models.TextField(blank=True)
    lot_cree            = models.ForeignKey(
        'inventory.Lot', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='ligne_reception'
    )

    class Meta:
        db_table            = 'ligne_reception'
        verbose_name        = 'Ligne reception'
        verbose_name_plural = 'Lignes reception'

    def __str__(self):
        return f"{self.reception.numero} | {self.ligne_commande.produit.reference}"

    def save(self, *args, **kwargs):
        # quantite_acceptee + quantite_refusee = quantite_recue
        if not self.quantite_acceptee and not self.quantite_refusee:
            self.quantite_acceptee = self.quantite_recue
        super().save(*args, **kwargs)