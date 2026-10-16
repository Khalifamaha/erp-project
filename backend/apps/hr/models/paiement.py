# -*- coding: utf-8 -*-
import uuid
from django.db import models
from .employe import Employe


class PaiementEmploye(models.Model):

    STATUT = [
        ('brouillon',  'Brouillon'),
        ('calcule',    'Calculé'),
        ('valide',     'Validé'),
        ('paye',       'Payé'),
        ('annule',     'Annulé'),
    ]

    MODE_PAIEMENT = [
        ('virement',  'Virement bancaire'),
        ('especes',   'Espèces'),
        ('cheque',    'Chèque'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employe             = models.ForeignKey(Employe, on_delete=models.CASCADE, related_name='paiements')
    periode_debut       = models.DateField()
    periode_fin         = models.DateField()
    salaire_base        = models.DecimalField(max_digits=10, decimal_places=3)
    heures_sup_montant  = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    primes              = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    deductions          = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    cotisation_cnss     = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    impot_revenu        = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    net_paye            = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    statut              = models.CharField(max_length=15, choices=STATUT, default='brouillon')
    date_paiement       = models.DateField(null=True, blank=True)
    mode_paiement       = models.CharField(max_length=15, choices=MODE_PAIEMENT, default='virement')
    reference_virement  = models.CharField(max_length=100, blank=True)
    notes               = models.TextField(blank=True)
    date_creation       = models.DateTimeField(auto_now_add=True)
    date_modification   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'paiement_employe'
        verbose_name        = 'Paiement employé'
        verbose_name_plural = 'Paiements employés'
        ordering            = ['-periode_debut']
        unique_together     = [('employe', 'periode_debut', 'periode_fin')]
        indexes             = [
            models.Index(fields=['employe', 'statut']),
            models.Index(fields=['periode_debut', 'periode_fin']),
        ]

    def __str__(self):
        return f"{self.employe} — {self.periode_debut.strftime('%m/%Y')} — {self.net_paye} DT"

    def calculer_net(self):
        """Calcule le net à payer."""
        brut = (
            self.salaire_base
            + self.heures_sup_montant
            + self.primes
        )
        # CNSS Tunisie : 9.18% part salariale
        self.cotisation_cnss = round(float(brut) * 0.0918, 3)
        total_deductions = (
            float(self.deductions)
            + float(self.cotisation_cnss)
            + float(self.impot_revenu)
        )
        self.net_paye = round(float(brut) - total_deductions, 3)
        return self

    def save(self, *args, **kwargs):
        if self.statut in ['brouillon', 'calcule']:
            self.calculer_net()
        super().save(*args, **kwargs)


class HabilitationMachine(models.Model):
    """Qui peut opérer quelle machine — lien entre RH et production."""

    NIVEAU = [
        ('debutant',    'Débutant'),
        ('intermediaire','Intermédiaire'),
        ('experimente', 'Expérimenté'),
        ('formateur',   'Formateur'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employe         = models.ForeignKey(Employe, on_delete=models.CASCADE, related_name='habilitations')
    # machine_id sera un UUID — lien réel ajouté quand app production sera créée
    machine_id      = models.UUIDField()
    machine_nom     = models.CharField(max_length=100, blank=True)
    date_obtention  = models.DateField()
    date_expiration = models.DateField(null=True, blank=True)
    niveau          = models.CharField(max_length=15, choices=NIVEAU, default='debutant')
    active          = models.BooleanField(default=True)
    valide_par_id   = models.UUIDField(null=True, blank=True)

    class Meta:
        db_table            = 'habilitation_machine'
        verbose_name        = 'Habilitation machine'
        verbose_name_plural = 'Habilitations machines'
        unique_together     = [('employe', 'machine_id')]
        ordering            = ['employe', 'machine_nom']

    def __str__(self):
        return f"{self.employe} — {self.machine_nom} ({self.niveau})"