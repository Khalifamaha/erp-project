# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings
from .commande import CommandeClient


class Camion(models.Model):

    STATUT_CHOICES = [
        ('disponible',  'Disponible'),
        ('en_route',    'En route'),
        ('charge',      'En cours de chargement'),
        ('maintenance', 'En maintenance'),
        ('hors_service','Hors service'),
    ]

    id                    = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    immatriculation       = models.CharField(max_length=20, unique=True)
    marque                = models.CharField(max_length=50, blank=True)
    modele                = models.CharField(max_length=50, blank=True)
    numero_serie          = models.CharField(max_length=50, blank=True)
    capacite_kg           = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    volume_m3             = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    statut                = models.CharField(max_length=15, choices=STATUT_CHOICES, default='disponible')
    prochaine_revision    = models.DateField(null=True, blank=True)
    chauffeur_nom         = models.CharField(max_length=100, blank=True)
    chauffeur_telephone   = models.CharField(max_length=30, blank=True)
    numero_permis         = models.CharField(max_length=50, blank=True)
    type_transport        = models.CharField(max_length=50, blank=True)
    date_creation         = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table            = 'camion'
        verbose_name        = 'Camion'
        verbose_name_plural = 'Camions'
        ordering            = ['immatriculation']

    def __str__(self):
        return f"{self.immatriculation} — {self.marque} {self.modele}"


class Expedition(models.Model):

    STATUT_CHOICES = [
        ('preparee',   'En preparation'),
        ('chargee',    'Chargee'),
        ('en_route',   'En route'),
        ('livree',     'Livree'),
        ('refusee',    'Refusee par client'),
        ('annulee',    'Annulee'),
    ]

    INCOTERM_CHOICES = [
        ('EXW', 'EXW'), ('FOB', 'FOB'),
        ('CIF', 'CIF'), ('DDP', 'DDP'), ('DAP', 'DAP'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    numero              = models.CharField(max_length=30, unique=True)
    camion              = models.ForeignKey(
        Camion, on_delete=models.SET_NULL, null=True, blank=True, related_name='expeditions'
    )
    commande_client     = models.ForeignKey(
        CommandeClient, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='expeditions'
    )
    date_depart         = models.DateField()
    date_arrivee_prev   = models.DateField(null=True, blank=True)
    date_arrivee_reel   = models.DateField(null=True, blank=True)
    destination         = models.CharField(max_length=200, blank=True)
    pays_destination    = models.CharField(max_length=100, default='Tunisie')
    statut              = models.CharField(max_length=15, choices=STATUT_CHOICES, default='preparee')
    poids_total         = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valeur_totale       = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    incoterm            = models.CharField(max_length=5, choices=INCOTERM_CHOICES, blank=True)
    numero_douane       = models.CharField(max_length=50, blank=True)
    numero_bl           = models.CharField(max_length=50, blank=True,
                                           help_text='Numero bon de livraison')
    responsable         = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='expeditions_responsable'
    )
    notes               = models.TextField(blank=True)
    date_creation       = models.DateTimeField(auto_now_add=True)
    date_modification   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'expedition'
        verbose_name        = 'Expedition'
        verbose_name_plural = 'Expeditions'
        ordering            = ['-date_depart']
        indexes             = [
            models.Index(fields=['statut']),
            models.Index(fields=['numero']),
            models.Index(fields=['date_depart']),
        ]

    def __str__(self):
        return f"{self.numero} — {self.destination} ({self.statut})"


class LigneExpedition(models.Model):

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expedition = models.ForeignKey(
        Expedition, on_delete=models.CASCADE, related_name='lignes'
    )
    produit    = models.ForeignKey(
        'inventory.Produit', on_delete=models.PROTECT, related_name='lignes_expedition'
    )
    lot        = models.ForeignKey(
        'inventory.Lot', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='lignes_expedition'
    )
    quantite   = models.DecimalField(max_digits=12, decimal_places=3)
    poids      = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    unite      = models.CharField(max_length=10, default='piece')

    class Meta:
        db_table        = 'ligne_expedition'
        verbose_name    = 'Ligne expedition'
        verbose_name_plural = 'Lignes expedition'

    def __str__(self):
        return f"{self.expedition.numero} | {self.produit.reference} x{self.quantite}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Sortie stock automatique a l expedition
        try:
            from apps.inventory.models import MouvementStock
            MouvementStock.enregistrer(
                produit=self.produit,
                type_mouvement='sortie_expedition',
                quantite=self.quantite,
                lot=self.lot,
                reference_doc=self.expedition.numero,
                motif=f"Expedition {self.expedition.numero}",
                expedition_id=self.expedition.id,
            )
        except Exception:
            pass