# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings


class ExerciceComptable(models.Model):

    STATUT_CHOICES = [
        ('ouvert',  'Ouvert'),
        ('cloture', 'Cloture'),
        ('archive', 'Archive'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    libelle       = models.CharField(max_length=100)
    date_debut    = models.DateField()
    date_fin      = models.DateField()
    statut        = models.CharField(max_length=10, choices=STATUT_CHOICES, default='ouvert')
    cloture       = models.BooleanField(default=False)
    date_cloture  = models.DateTimeField(null=True, blank=True)
    cloture_par   = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='exercices_clotures'
    )
    notes         = models.TextField(blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table            = 'exercice_comptable'
        verbose_name        = 'Exercice comptable'
        verbose_name_plural = 'Exercices comptables'
        ordering            = ['-date_debut']

    def __str__(self):
        return f"{self.libelle} ({self.date_debut} - {self.date_fin})"

    def cloturer(self, user=None):
        from django.utils import timezone
        self.cloture      = True
        self.statut       = 'cloture'
        self.date_cloture = timezone.now()
        self.cloture_par  = user
        self.save(update_fields=['cloture', 'statut', 'date_cloture', 'cloture_par'])


class PlanComptable(models.Model):

    TYPE_COMPTE_CHOICES = [
        ('actif',   'Actif'),
        ('passif',  'Passif'),
        ('charge',  'Charge'),
        ('produit', 'Produit'),
        ('bilan',   'Bilan'),
    ]

    SENS_CHOICES = [
        ('debiteur',  'Debiteur'),
        ('crediteur', 'Crediteur'),
    ]

    CLASSE_CHOICES = [
        ('1', 'Classe 1 - Capitaux propres'),
        ('2', 'Classe 2 - Actifs fixes'),
        ('3', 'Classe 3 - Stocks'),
        ('4', 'Classe 4 - Tiers'),
        ('5', 'Classe 5 - Tresorerie'),
        ('6', 'Classe 6 - Charges'),
        ('7', 'Classe 7 - Produits'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exercice      = models.ForeignKey(
        ExerciceComptable, on_delete=models.CASCADE, related_name='comptes'
    )
    numero_compte = models.CharField(max_length=10)
    libelle       = models.CharField(max_length=200)
    type_compte   = models.CharField(max_length=10, choices=TYPE_COMPTE_CHOICES)
    classe        = models.CharField(max_length=1, choices=CLASSE_CHOICES)
    sens_normal   = models.CharField(max_length=10, choices=SENS_CHOICES)
    actif         = models.BooleanField(default=True)
    compte_parent = models.ForeignKey(
        'self', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='sous_comptes'
    )

    class Meta:
        db_table        = 'plan_comptable'
        verbose_name    = 'Compte comptable'
        verbose_name_plural = 'Plan comptable'
        ordering        = ['numero_compte']
        unique_together = [('exercice', 'numero_compte')]

    def __str__(self):
        return f"{self.numero_compte} - {self.libelle}"

    @property
    def solde(self):
        from django.db.models import Sum
        debits  = self.ecritures_debit.aggregate(t=Sum('montant'))['t'] or 0
        credits = self.ecritures_credit.aggregate(t=Sum('montant'))['t'] or 0
        if self.sens_normal == 'debiteur':
            return round(float(debits) - float(credits), 3)
        return round(float(credits) - float(debits), 3)