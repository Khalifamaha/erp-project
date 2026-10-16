# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings
from .fournisseur import Fournisseur
from .commande import CommandeAchat


class FactureAchat(models.Model):

    STATUT_CHOICES = [
        ('recue',      'Recue'),
        ('verifiee',   'Verifiee'),
        ('approuvee',  'Approuvee'),
        ('payee',      'Payee'),
        ('partiellement_payee', 'Partiellement payee'),
        ('contestee',  'Contestee'),
        ('annulee',    'Annulee'),
    ]

    MODE_PAIEMENT = [
        ('virement',  'Virement bancaire'),
        ('cheque',    'Cheque'),
        ('especes',   'Especes'),
        ('traite',    'Traite'),
        ('lc',        'Lettre de credit'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    numero              = models.CharField(max_length=50, unique=True)
    numero_fournisseur  = models.CharField(max_length=50, blank=True, help_text='Numero de facture du fournisseur')
    fournisseur         = models.ForeignKey(
        Fournisseur, on_delete=models.PROTECT, related_name='factures'
    )
    commande            = models.ForeignKey(
        CommandeAchat, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='factures'
    )
    date_facture        = models.DateField()
    date_echeance       = models.DateField()
    montant_ht          = models.DecimalField(max_digits=14, decimal_places=3)
    taux_tva            = models.DecimalField(max_digits=5, decimal_places=2, default=19)
    montant_tva         = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    montant_ttc         = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    montant_paye        = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    statut              = models.CharField(max_length=25, choices=STATUT_CHOICES, default='recue')
    mode_paiement       = models.CharField(max_length=15, choices=MODE_PAIEMENT, default='virement')
    reference_paiement  = models.CharField(max_length=100, blank=True)
    date_paiement       = models.DateField(null=True, blank=True)
    notes               = models.TextField(blank=True)
    enregistree_par     = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='factures_achat_enregistrees'
    )
    date_creation       = models.DateTimeField(auto_now_add=True)
    date_modification   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'facture_achat'
        verbose_name        = 'Facture achat'
        verbose_name_plural = 'Factures achat'
        ordering            = ['-date_facture']
        indexes             = [
            models.Index(fields=['fournisseur', 'statut']),
            models.Index(fields=['date_echeance']),
            models.Index(fields=['numero']),
        ]

    def __str__(self):
        return f"{self.numero} — {self.fournisseur.raison_sociale} — {self.montant_ttc} {self.commande.devise if self.commande else 'TND'}"

    @property
    def solde_restant(self):
        return round(float(self.montant_ttc) - float(self.montant_paye), 3)

    @property
    def est_en_retard(self):
        from django.utils import timezone
        if self.statut not in ['payee']:
            return self.date_echeance < timezone.now().date()
        return False

    def save(self, *args, **kwargs):
        # Calcul automatique TVA et TTC
        self.montant_tva = round(float(self.montant_ht) * float(self.taux_tva) / 100, 3)
        self.montant_ttc = round(float(self.montant_ht) + float(self.montant_tva), 3)
        # Mise a jour statut paiement
        if float(self.montant_paye) >= float(self.montant_ttc):
            self.statut = 'payee'
        elif float(self.montant_paye) > 0:
            self.statut = 'partiellement_payee'
        super().save(*args, **kwargs)