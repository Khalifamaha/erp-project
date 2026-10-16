# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings


class PlanningProduction(models.Model):

    SHIFT_CHOICES = [
        ('matin',   'Matin (6h-14h)'),
        ('aprem',   'Apres-midi (14h-22h)'),
        ('nuit',    'Nuit (22h-6h)'),
        ('journee', 'Journee (8h-17h)'),
    ]

    STATUT_CHOICES = [
        ('brouillon',  'Brouillon'),
        ('confirme',   'Confirme'),
        ('en_cours',   'En cours'),
        ('termine',    'Termine'),
        ('reporte',    'Reporte'),
        ('annule',     'Annule'),
    ]

    id                = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ordre             = models.ForeignKey(
        'production.OrdreFabrication', on_delete=models.CASCADE,
        related_name='plannings'
    )
    chaine            = models.ForeignKey(
        'production.ChaineProduction', on_delete=models.CASCADE,
        related_name='plannings'
    )
    machine           = models.ForeignKey(
        'production.Machine', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='plannings'
    )
    date_planifiee    = models.DateField()
    heure_debut_prev  = models.DateTimeField()
    heure_fin_prev    = models.DateTimeField()
    sequence          = models.IntegerField(default=1, help_text='Ordre dans la journee')
    quantite_planifiee= models.DecimalField(max_digits=12, decimal_places=3)
    shift             = models.CharField(max_length=10, choices=SHIFT_CHOICES, default='matin')
    statut            = models.CharField(max_length=15, choices=STATUT_CHOICES, default='brouillon')
    planifie_par      = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='plannings_crees'
    )
    notes             = models.TextField(blank=True)
    date_creation     = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'planning_production'
        verbose_name        = 'Planning production'
        verbose_name_plural = 'Plannings production'
        ordering            = ['date_planifiee', 'sequence', 'heure_debut_prev']
        indexes             = [
            models.Index(fields=['date_planifiee', 'chaine']),
            models.Index(fields=['ordre', 'statut']),
            models.Index(fields=['machine', 'date_planifiee']),
        ]

    def __str__(self):
        return f"{self.date_planifiee} | {self.chaine.code} | {self.ordre.numero} | {self.shift}"

    @property
    def duree_prevue_heures(self):
        if self.heure_fin_prev and self.heure_debut_prev:
            delta = self.heure_fin_prev - self.heure_debut_prev
            return round(delta.total_seconds() / 3600, 2)
        return 0

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.heure_fin_prev and self.heure_debut_prev:
            if self.heure_fin_prev <= self.heure_debut_prev:
                raise ValidationError("L heure de fin doit etre apres l heure de debut.")
        # Verifier chevauchement machine
        if self.machine:
            chevauchements = PlanningProduction.objects.filter(
                machine=self.machine,
                date_planifiee=self.date_planifiee,
                statut__in=['brouillon', 'confirme', 'en_cours'],
                heure_debut_prev__lt=self.heure_fin_prev,
                heure_fin_prev__gt=self.heure_debut_prev,
            ).exclude(pk=self.pk)
            if chevauchements.exists():
                conflits = chevauchements.values_list('ordre__numero', flat=True)
                raise ValidationError(
                    f"Conflit machine {self.machine.code} avec OF : {list(conflits)}"
                )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)