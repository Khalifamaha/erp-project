# -*- coding: utf-8 -*-
import uuid
from django.db import models
from .categorie import CategorieProduit


class EmplacementStock(models.Model):

    TYPE_CHOICES = [
        ('entrepot',  'Entrepot principal'),
        ('atelier',   'Atelier de production'),
        ('quai',      'Quai expedition'),
        ('quarantaine','Zone quarantaine'),
        ('rebut',     'Zone rebut'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code         = models.CharField(max_length=20, unique=True)
    nom          = models.CharField(max_length=100)
    type         = models.CharField(max_length=15, choices=TYPE_CHOICES, default='entrepot')
    zone         = models.CharField(max_length=20, blank=True)
    allee        = models.CharField(max_length=10, blank=True)
    niveau       = models.CharField(max_length=10, blank=True)
    capacite_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    actif        = models.BooleanField(default=True)
    description  = models.TextField(blank=True)

    class Meta:
        db_table            = 'emplacement_stock'
        verbose_name        = 'Emplacement stock'
        verbose_name_plural = 'Emplacements stock'
        ordering            = ['code']

    def __str__(self):
        return f"[{self.code}] {self.nom}"


class Produit(models.Model):

    TYPE_CHOICES = [
        ('matiere_premiere', 'Matiere premiere'),
        ('produit_fini',     'Produit fini'),
        ('semi_fini',        'Semi-fini'),
        ('consommable',      'Consommable'),
        ('piece_rechange',   'Piece de rechange'),
        ('emballage',        'Emballage'),
    ]

    UNITE_CHOICES = [
        ('kg',    'Kilogramme'),
        ('g',     'Gramme'),
        ('t',     'Tonne'),
        ('m',     'Metre'),
        ('m2',    'Metre carre'),
        ('m3',    'Metre cube'),
        ('l',     'Litre'),
        ('piece', 'Piece'),
        ('boite', 'Boite'),
        ('palette','Palette'),
        ('rouleau','Rouleau'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference           = models.CharField(max_length=50, unique=True)
    designation         = models.CharField(max_length=200)
    type                = models.CharField(max_length=20, choices=TYPE_CHOICES)
    code_barre          = models.CharField(max_length=50, blank=True, unique=True, null=True)
    categorie           = models.ForeignKey(
        CategorieProduit, on_delete=models.SET_NULL,
        null=True, related_name='produits'
    )
    unite_mesure        = models.CharField(max_length=10, choices=UNITE_CHOICES, default='piece')
    unite_secondaire    = models.CharField(max_length=10, choices=UNITE_CHOICES, blank=True)
    facteur_conversion  = models.DecimalField(max_digits=10, decimal_places=4, default=1)
    stock_actuel        = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    stock_minimum       = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    stock_maximum       = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    stock_securite      = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    prix_unitaire       = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    cout_revient        = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    emplacement         = models.ForeignKey(
        EmplacementStock, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='produits'
    )
    poids_kg            = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    volume_m3           = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    code_douanier       = models.CharField(max_length=20, blank=True)
    description         = models.TextField(blank=True)
    actif               = models.BooleanField(default=True)
    date_creation       = models.DateTimeField(auto_now_add=True)
    date_modification   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'produit'
        verbose_name        = 'Produit'
        verbose_name_plural = 'Produits'
        ordering            = ['reference']
        indexes             = [
            models.Index(fields=['reference']),
            models.Index(fields=['type']),
            models.Index(fields=['stock_actuel']),
        ]

    def __str__(self):
        return f"[{self.reference}] {self.designation}"

    @property
    def est_sous_seuil(self):
        return self.stock_actuel <= self.stock_minimum

    @property
    def est_rupture(self):
        return self.stock_actuel <= 0

    @property
    def valeur_stock(self):
        return round(float(self.stock_actuel) * float(self.prix_unitaire), 3)