# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings


class MaintenancePreventive(models.Model):

    TYPE_CHOICES = [
        ('graissage',     'Graissage / Lubrification'),
        ('nettoyage',     'Nettoyage complet'),
        ('inspection',    'Inspection visuelle'),
        ('calibrage',     'Calibrage / Etalonnage'),
        ('remplacement',  'Remplacement piece periodique'),
        ('revision',      'Revision generale'),
        ('controle',      'Controle electrique / securite'),
        ('autre',         'Autre'),
    ]

    STATUT_CHOICES = [
        ('planifiee',  'Planifiee'),
        ('en_cours',   'En cours'),
        ('effectuee',  'Effectuee'),
        ('reportee',   'Reportee'),
        ('annulee',    'Annulee'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    machine             = models.ForeignKey(
        'production.Machine', on_delete=models.CASCADE, related_name='maintenances_preventives'
    )
    type_maintenance    = models.CharField(max_length=15, choices=TYPE_CHOICES)
    frequence_jours     = models.IntegerField(help_text='Periodicite en jours (ex: 30 = mensuelle)')
    derniere_execution  = models.DateField(null=True, blank=True)
    prochaine_execution = models.DateField(null=True, blank=True)
    description         = models.TextField()
    duree_prevue_min    = models.DecimalField(max_digits=8, decimal_places=2, default=60)
    statut              = models.CharField(max_length=15, choices=STATUT_CHOICES, default='planifiee')
    active              = models.BooleanField(default=True)
    responsable         = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='maintenances_responsable'
    )
    cout_estime         = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    pieces_requises     = models.TextField(blank=True)
    date_creation       = models.DateTimeField(auto_now_add=True)
    date_modification   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'maintenance_preventive'
        verbose_name        = 'Maintenance preventive'
        verbose_name_plural = 'Maintenances preventives'
        ordering            = ['prochaine_execution']
        indexes             = [
            models.Index(fields=['machine', 'active']),
            models.Index(fields=['prochaine_execution']),
            models.Index(fields=['statut']),
        ]

    def __str__(self):
        return f"{self.machine.code} | {self.type_maintenance} | tous les {self.frequence_jours}j"

    @property
    def est_en_retard(self):
        from django.utils import timezone
        if self.prochaine_execution and self.statut == 'planifiee':
            return self.prochaine_execution < timezone.now().date()
        return False

    @property
    def jours_avant_echeance(self):
        from django.utils import timezone
        if self.prochaine_execution:
            delta = self.prochaine_execution - timezone.now().date()
            return delta.days
        return None

    def marquer_effectuee(self, date_execution=None):
        """Marque comme effectuee et calcule la prochaine echeance."""
        from django.utils import timezone
        from datetime import timedelta
        today = date_execution or timezone.now().date()
        self.derniere_execution  = today
        self.prochaine_execution = today + timedelta(days=self.frequence_jours)
        self.statut              = 'planifiee'
        self.save(update_fields=['derniere_execution', 'prochaine_execution', 'statut'])
        # Mettre a jour la machine
        self.machine.prochaine_maintenance = self.prochaine_execution
        self.machine.save(update_fields=['prochaine_maintenance'])


class ExecutionMaintenance(models.Model):
    """Historique des executions de maintenance preventive."""

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    maintenance         = models.ForeignKey(
        MaintenancePreventive, on_delete=models.CASCADE, related_name='executions'
    )
    technicien          = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='maintenances_effectuees'
    )
    date_execution      = models.DateField()
    duree_reelle_min    = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    observations        = models.TextField(blank=True)
    pieces_remplacees   = models.TextField(blank=True)
    cout_reel           = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    date_creation       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'execution_maintenance'
        verbose_name    = 'Execution maintenance'
        verbose_name_plural = 'Executions maintenances'
        ordering        = ['-date_execution']

    def __str__(self):
        return f"{self.maintenance.machine.code} | {self.maintenance.type_maintenance} | {self.date_execution}"