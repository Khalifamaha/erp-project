# -*- coding: utf-8 -*-
import uuid
from django.db import models


class Machine(models.Model):

    TYPE_CHOICES = [
        ('laser',        'Decoupe laser'),
        ('presse',       'Presse hydraulique'),
        ('tour',         'Tour CNC'),
        ('fraiseuse',    'Fraiseuse CNC'),
        ('soudure',      'Poste de soudure'),
        ('pliage',       'Plieuse'),
        ('injection',    'Presse injection plastique'),
        ('assemblage',   'Poste assemblage'),
        ('controle',     'Poste controle qualite'),
        ('autre',        'Autre'),
    ]

    STATUT_CHOICES = [
        ('disponible',   'Disponible'),
        ('en_marche',    'En marche'),
        ('panne',        'En panne'),
        ('maintenance',  'En maintenance'),
        ('arret',        'A l arret'),
    ]

    id                   = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom                  = models.CharField(max_length=100)
    code                 = models.CharField(max_length=20, unique=True)
    type                 = models.CharField(max_length=20, choices=TYPE_CHOICES)
    marque               = models.CharField(max_length=100, blank=True)
    modele               = models.CharField(max_length=100, blank=True)
    numero_serie         = models.CharField(max_length=100, blank=True)
    emplacement          = models.CharField(max_length=100, blank=True)
    statut               = models.CharField(max_length=15, choices=STATUT_CHOICES, default='disponible')
    date_mise_service    = models.DateField(null=True, blank=True)
    cadence_horaire      = models.DecimalField(max_digits=8, decimal_places=2, default=0,
                                               help_text='Pieces par heure en cadence normale')
    cadence_theorique    = models.DecimalField(max_digits=8, decimal_places=2, default=0,
                                               help_text='Cadence maximale theorique')
    taux_disponibilite   = models.DecimalField(max_digits=5, decimal_places=2, default=100,
                                               help_text='Pourcentage disponibilite (calcule)')
    prochaine_maintenance= models.DateField(null=True, blank=True)
    fabricant            = models.CharField(max_length=100, blank=True)
    notes                = models.TextField(blank=True)
    date_creation        = models.DateTimeField(auto_now_add=True)
    date_modification    = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'machine'
        verbose_name        = 'Machine'
        verbose_name_plural = 'Machines'
        ordering            = ['code']
        indexes             = [
            models.Index(fields=['code']),
            models.Index(fields=['statut']),
            models.Index(fields=['type']),
        ]

    def __str__(self):
        return f"[{self.code}] {self.nom} ({self.type})"

    def calculer_taux_disponibilite(self):
        """Calcule le taux de disponibilite depuis l historique des pannes."""
        from django.utils import timezone
        from django.db.models import Sum
        # Periode : 30 derniers jours
        debut = timezone.now() - timezone.timedelta(days=30)
        heures_totales = 30 * 24  # heures dans 30 jours
        try:
            from apps.gmo.models import Panne
            duree_pannes = Panne.objects.filter(
                machine=self,
                date_debut__gte=debut,
                date_fin__isnull=False,
            ).aggregate(total=Sum('duree_minutes'))['total'] or 0
            heures_pannes = float(duree_pannes) / 60
            taux = max(0, min(100, ((heures_totales - heures_pannes) / heures_totales) * 100))
            self.taux_disponibilite = round(taux, 2)
            self.save(update_fields=['taux_disponibilite'])
        except Exception:
            pass
        return self.taux_disponibilite