# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings


class Panne(models.Model):

    TYPE_CHOICES = [
        ('mecanique',   'Mecanique'),
        ('electrique',  'Electrique'),
        ('electronique','Electronique'),
        ('pneumatique', 'Pneumatique'),
        ('hydraulique', 'Hydraulique'),
        ('logiciel',    'Logiciel / Programme'),
        ('usure',       'Usure piece'),
        ('autre',       'Autre'),
    ]

    GRAVITE_CHOICES = [
        ('faible',    'Faible — production continue'),
        ('moyenne',   'Moyenne — ralentissement'),
        ('haute',     'Haute — arret partiel'),
        ('critique',  'Critique — arret total'),
    ]

    STATUT_CHOICES = [
        ('declaree',    'Declaree'),
        ('assignee',    'Assignee technicien'),
        ('en_cours',    'Intervention en cours'),
        ('resolue',     'Resolue'),
        ('non_resolue', 'Non resolue — escalade'),
    ]

    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    machine          = models.ForeignKey(
        'production.Machine', on_delete=models.CASCADE, related_name='pannes'
    )
    chaine           = models.ForeignKey(
        'production.ChaineProduction', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='pannes'
    )
    declare_par      = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='pannes_declarees'
    )
    date_debut       = models.DateTimeField()
    date_fin         = models.DateTimeField(null=True, blank=True)
    duree_minutes    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cadence_ref      = models.DecimalField(max_digits=8, decimal_places=2, default=0,
                                           help_text='Cadence machine au moment de la panne (snapshot)')
    type_panne       = models.CharField(max_length=15, choices=TYPE_CHOICES, default='mecanique')
    gravite          = models.CharField(max_length=10, choices=GRAVITE_CHOICES, default='moyenne')
    description      = models.TextField()
    statut           = models.CharField(max_length=15, choices=STATUT_CHOICES, default='declaree')
    pieces_perdues   = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                           help_text='Pieces non produites pendant la panne')
    cout_estime      = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    arret_production = models.BooleanField(default=True)
    date_creation    = models.DateTimeField(auto_now_add=True)
    date_modification= models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'panne'
        verbose_name        = 'Panne'
        verbose_name_plural = 'Pannes'
        ordering            = ['-date_debut']
        indexes             = [
            models.Index(fields=['machine', 'statut']),
            models.Index(fields=['date_debut']),
            models.Index(fields=['gravite']),
        ]

    def __str__(self):
        return f"PANNE {self.machine.code} | {self.type_panne} | {self.gravite} | {self.statut}"

    def save(self, *args, **kwargs):
        # Calcul automatique duree et pieces perdues
        if self.date_fin and self.date_debut:
            delta = self.date_fin - self.date_debut
            self.duree_minutes = round(delta.total_seconds() / 60, 2)
            # Snapshot cadence depuis la machine si non defini
            if float(self.cadence_ref) == 0:
                self.cadence_ref = self.machine.cadence_horaire
            # pieces_perdues = (duree_h) * cadence
            heures = float(self.duree_minutes) / 60
            self.pieces_perdues = round(heures * float(self.cadence_ref), 2)
        super().save(*args, **kwargs)
        # Mettre a jour le statut de la machine
        self._sync_statut_machine()

    def _sync_statut_machine(self):
        """Synchronise le statut de la machine avec le statut de la panne."""
        if self.statut in ['declaree', 'assignee', 'en_cours']:
            self.machine.statut = 'panne'
        elif self.statut == 'resolue':
            self.machine.statut = 'disponible'
        self.machine.save(update_fields=['statut'])

    @property
    def duree_heures(self):
        return round(float(self.duree_minutes) / 60, 2) if self.duree_minutes else 0

    @property
    def cout_perte_production(self):
        """Estimation du cout de perte en production."""
        prix_piece = float(self.machine.cadence_horaire) * 0  # sera enrichi
        return round(float(self.pieces_perdues) * prix_piece, 3)