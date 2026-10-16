# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings
from .fournisseur import Fournisseur


class CommandeAchat(models.Model):

    STATUT_CHOICES = [
        ('brouillon',  'Brouillon'),
        ('soumise',    'Soumise au fournisseur'),
        ('confirmee',  'Confirmee par fournisseur'),
        ('partielle',  'Livraison partielle'),
        ('livree',     'Livree completement'),
        ('annulee',    'Annulee'),
    ]

    DEVISE_CHOICES = [
        ('TND', 'Dinar tunisien'),
        ('EUR', 'Euro'),
        ('USD', 'Dollar US'),
    ]

    id                   = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    numero               = models.CharField(max_length=30, unique=True)
    fournisseur          = models.ForeignKey(
        Fournisseur, on_delete=models.PROTECT, related_name='commandes'
    )
    date_commande        = models.DateField()
    date_livraison_prev  = models.DateField(null=True, blank=True)
    date_livraison_reel  = models.DateField(null=True, blank=True)
    montant_total        = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    statut               = models.CharField(max_length=15, choices=STATUT_CHOICES, default='brouillon')
    devise               = models.CharField(max_length=5, choices=DEVISE_CHOICES, default='TND')
    cree_par             = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='commandes_achat_crees'
    )
    approuve_par         = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='commandes_achat_approuves'
    )
    notes                = models.TextField(blank=True)
    conditions_livraison = models.CharField(max_length=200, blank=True)
    date_creation        = models.DateTimeField(auto_now_add=True)
    date_modification    = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'commande_achat'
        verbose_name        = 'Commande achat'
        verbose_name_plural = 'Commandes achat'
        ordering            = ['-date_commande']
        indexes             = [
            models.Index(fields=['numero']),
            models.Index(fields=['fournisseur', 'statut']),
            models.Index(fields=['date_commande']),
        ]

    def __str__(self):
        return f"{self.numero} — {self.fournisseur.raison_sociale} ({self.statut})"

    def recalculer_montant(self):
        """Recalcule le montant total depuis les lignes."""
        from django.db.models import Sum
        result = self.lignes.aggregate(
            total=Sum(
                models.ExpressionWrapper(
                    models.F('quantite_commandee') * models.F('prix_unitaire') *
                    (1 - models.F('remise_pct') / 100),
                    output_field=models.DecimalField()
                )
            )
        )
        self.montant_total = result['total'] or 0
        self.save(update_fields=['montant_total'])
        return self.montant_total

    @property
    def taux_reception(self):
        """Pourcentage de reception globale de la commande."""
        lignes = self.lignes.all()
        if not lignes:
            return 0
        total_cmd = sum(float(l.quantite_commandee) for l in lignes)
        total_rec = sum(float(l.quantite_recue) for l in lignes)
        if total_cmd == 0:
            return 0
        return round((total_rec / total_cmd) * 100, 1)


class LigneCommandeAchat(models.Model):

    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('partielle',  'Reception partielle'),
        ('complete',   'Reception complete'),
        ('annulee',    'Annulee'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    commande            = models.ForeignKey(
        CommandeAchat, on_delete=models.CASCADE, related_name='lignes'
    )
    # FK vers inventory.Produit — lazy reference
    produit             = models.ForeignKey(
        'inventory.Produit', on_delete=models.PROTECT, related_name='lignes_achat'
    )
    quantite_commandee  = models.DecimalField(max_digits=12, decimal_places=3)
    quantite_recue      = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    prix_unitaire       = models.DecimalField(max_digits=12, decimal_places=3)
    remise_pct          = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    statut              = models.CharField(max_length=15, choices=STATUT_CHOICES, default='en_attente')
    notes_reception     = models.TextField(blank=True)

    class Meta:
        db_table            = 'ligne_commande_achat'
        verbose_name        = 'Ligne commande achat'
        verbose_name_plural = 'Lignes commandes achat'
        ordering            = ['commande', 'produit__reference']

    def __str__(self):
        return f"{self.commande.numero} | {self.produit.reference} x{self.quantite_commandee}"

    @property
    def montant_ligne(self):
        base = float(self.quantite_commandee) * float(self.prix_unitaire)
        remise = base * float(self.remise_pct) / 100
        return round(base - remise, 3)

    @property
    def quantite_restante(self):
        return max(0, float(self.quantite_commandee) - float(self.quantite_recue))