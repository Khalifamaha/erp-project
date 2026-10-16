# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings
from .exercice import ExerciceComptable, PlanComptable


class EcritureComptable(models.Model):

    JOURNAL_CHOICES = [
        ('achats',   'Journal des achats'),
        ('ventes',   'Journal des ventes'),
        ('banque',   'Journal de banque'),
        ('caisse',   'Journal de caisse'),
        ('od',       'Operations diverses'),
        ('salaires', 'Journal des salaires'),
        ('stock',    'Journal des stocks'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exercice            = models.ForeignKey(
        ExerciceComptable, on_delete=models.PROTECT, related_name='ecritures'
    )
    compte_debit        = models.ForeignKey(
        PlanComptable, on_delete=models.PROTECT, related_name='ecritures_debit'
    )
    compte_credit       = models.ForeignKey(
        PlanComptable, on_delete=models.PROTECT, related_name='ecritures_credit'
    )
    facture_achat_id    = models.UUIDField(null=True, blank=True)
    facture_vente_id    = models.UUIDField(null=True, blank=True)
    paiement_employe_id = models.UUIDField(null=True, blank=True)
    montant             = models.DecimalField(max_digits=14, decimal_places=3)
    date_ecriture       = models.DateField()
    libelle             = models.CharField(max_length=300)
    journal             = models.CharField(max_length=10, choices=JOURNAL_CHOICES)
    periode_comptable   = models.CharField(max_length=7, help_text='Format YYYY-MM')
    validee             = models.BooleanField(default=False)
    valide_par          = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='ecritures_validees'
    )
    reference_externe   = models.CharField(max_length=100, blank=True)
    date_creation       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table            = 'ecriture_comptable'
        verbose_name        = 'Ecriture comptable'
        verbose_name_plural = 'Ecritures comptables'
        ordering            = ['-date_ecriture', '-date_creation']
        indexes             = [
            models.Index(fields=['exercice', 'journal']),
            models.Index(fields=['date_ecriture']),
            models.Index(fields=['periode_comptable']),
            models.Index(fields=['compte_debit']),
            models.Index(fields=['compte_credit']),
        ]

    def __str__(self):
        return f"{self.date_ecriture} | {self.journal} | {self.libelle} | {self.montant}"

    def save(self, *args, **kwargs):
        if not self.periode_comptable:
            self.periode_comptable = self.date_ecriture.strftime('%Y-%m')
        super().save(*args, **kwargs)


class Facture(models.Model):
    """Facture de vente — generee depuis une commande client."""

    TYPE_CHOICES = [
        ('facture',  'Facture'),
        ('avoir',    'Avoir'),
        ('proforma', 'Proforma'),
    ]

    STATUT_CHOICES = [
        ('brouillon',          'Brouillon'),
        ('emise',              'Emise'),
        ('payee',              'Payee'),
        ('partiellement_payee','Partiellement payee'),
        ('en_retard',          'En retard'),
        ('annulee',            'Annulee'),
    ]

    id                 = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    numero             = models.CharField(max_length=30, unique=True)
    type_facture       = models.CharField(max_length=10, choices=TYPE_CHOICES, default='facture')
    client_id          = models.UUIDField(null=True, blank=True)
    client_nom         = models.CharField(max_length=200, blank=True)
    commande_client_id = models.UUIDField(null=True, blank=True)
    exercice           = models.ForeignKey(
        ExerciceComptable, on_delete=models.PROTECT,
        related_name='factures', null=True, blank=True
    )
    date_emission      = models.DateField()
    date_echeance      = models.DateField()
    montant_ht         = models.DecimalField(max_digits=14, decimal_places=3)
    taux_tva           = models.DecimalField(max_digits=5, decimal_places=2, default=19)
    montant_tva        = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    montant_ttc        = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    montant_paye       = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    solde_restant      = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    statut             = models.CharField(max_length=25, choices=STATUT_CHOICES, default='brouillon')
    devise             = models.CharField(max_length=5, default='TND')
    notes              = models.TextField(blank=True)
    cree_par           = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='factures_creees'
    )
    date_creation      = models.DateTimeField(auto_now_add=True)
    date_modification  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'facture'
        verbose_name        = 'Facture'
        verbose_name_plural = 'Factures'
        ordering            = ['-date_emission']
        indexes             = [
            models.Index(fields=['client_id', 'statut']),
            models.Index(fields=['date_echeance']),
            models.Index(fields=['numero']),
        ]

    def __str__(self):
        return f"{self.numero} - {self.client_nom} - {self.montant_ttc} {self.devise}"

    @property
    def est_en_retard(self):
        from django.utils import timezone
        if self.statut not in ['payee', 'annulee']:
            return self.date_echeance < timezone.now().date()
        return False

    def save(self, *args, **kwargs):
        # Calcul automatique TVA et TTC
        self.montant_tva   = round(float(self.montant_ht) * float(self.taux_tva) / 100, 3)
        self.montant_ttc   = round(float(self.montant_ht) + float(self.montant_tva), 3)
        self.solde_restant = round(float(self.montant_ttc) - float(self.montant_paye), 3)
        # Mise a jour statut automatique
        if float(self.montant_paye) >= float(self.montant_ttc):
            self.statut = 'payee'
        elif float(self.montant_paye) > 0:
            self.statut = 'partiellement_payee'
        from django.utils import timezone
        if (self.statut not in ['payee', 'annulee', 'brouillon'] and
                self.date_echeance < timezone.now().date()):
            self.statut = 'en_retard'
        super().save(*args, **kwargs)

    def generer_ecritures(self):
        """Genere les ecritures comptables automatiquement depuis la facture."""
        if not self.exercice:
            return
        try:
            compte_client = PlanComptable.objects.get(
                exercice=self.exercice, numero_compte='411'
            )
            compte_ventes = PlanComptable.objects.get(
                exercice=self.exercice, numero_compte='707'
            )
            compte_tva    = PlanComptable.objects.get(
                exercice=self.exercice, numero_compte='4437'
            )
            # Ecriture HT
            EcritureComptable.objects.create(
                exercice=self.exercice,
                compte_debit=compte_client,
                compte_credit=compte_ventes,
                facture_vente_id=self.id,
                montant=self.montant_ht,
                date_ecriture=self.date_emission,
                libelle=f"Vente {self.numero} - {self.client_nom}",
                journal='ventes',
                periode_comptable=self.date_emission.strftime('%Y-%m'),
            )
            # Ecriture TVA si applicable
            if float(self.montant_tva) > 0:
                EcritureComptable.objects.create(
                    exercice=self.exercice,
                    compte_debit=compte_client,
                    compte_credit=compte_tva,
                    facture_vente_id=self.id,
                    montant=self.montant_tva,
                    date_ecriture=self.date_emission,
                    libelle=f"TVA {self.numero}",
                    journal='ventes',
                    periode_comptable=self.date_emission.strftime('%Y-%m'),
                )
        except PlanComptable.DoesNotExist:
            pass