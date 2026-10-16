# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings
from .ordre_fabrication import OrdreFabrication


class ChaineProduction(models.Model):

    STATUT_CHOICES = [
        ('active',   'Active'),
        ('arret',    'A l arret'),
        ('panne',    'En panne'),
        ('maintenance', 'En maintenance'),
    ]

    TYPE_SHIFT_CHOICES = [
        ('1x8',  '1 shift x 8h'),
        ('2x8',  '2 shifts x 8h'),
        ('3x8',  '3 shifts x 8h'),
        ('5j',   '5 jours / semaine'),
        ('6j',   '6 jours / semaine'),
        ('7j',   '7 jours / semaine'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom             = models.CharField(max_length=100)
    code            = models.CharField(max_length=20, unique=True)
    objectif_heure  = models.IntegerField(default=0, help_text='Pieces par heure')
    objectif_jour   = models.IntegerField(default=0, help_text='Pieces par jour')
    objectif_shift  = models.IntegerField(default=0, help_text='Pieces par shift')
    capacite_max    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    type_shift      = models.CharField(max_length=5, choices=TYPE_SHIFT_CHOICES, default='2x8')
    statut          = models.CharField(max_length=15, choices=STATUT_CHOICES, default='active')
    chef            = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='chaines_chef'
    )
    description     = models.TextField(blank=True)
    date_creation   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table            = 'chaine_production'
        verbose_name        = 'Chaine de production'
        verbose_name_plural = 'Chaines de production'
        ordering            = ['code']

    def __str__(self):
        return f"[{self.code}] {self.nom}"


class AffectationEmployeChaine(models.Model):
    """Quel employe est affecte sur quelle chaine, quel shift."""

    SHIFT_CHOICES = [
        ('matin',  'Matin (6h-14h)'),
        ('aprem',  'Apres-midi (14h-22h)'),
        ('nuit',   'Nuit (22h-6h)'),
        ('journee','Journee (8h-17h)'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employe      = models.ForeignKey(
        'hr.Employe', on_delete=models.CASCADE, related_name='affectations_chaine'
    )
    chaine       = models.ForeignKey(
        ChaineProduction, on_delete=models.CASCADE, related_name='affectations_employes'
    )
    date_debut   = models.DateField()
    date_fin     = models.DateField(null=True, blank=True)
    poste_occupe = models.CharField(max_length=100, blank=True)
    shift        = models.CharField(max_length=10, choices=SHIFT_CHOICES, default='matin')
    actif        = models.BooleanField(default=True)

    class Meta:
        db_table        = 'affectation_employe_chaine'
        verbose_name    = 'Affectation employe chaine'
        verbose_name_plural = 'Affectations employes chaines'

    def __str__(self):
        return f"{self.employe} -> {self.chaine} ({self.shift})"


class AffectationChaine(models.Model):
    """Liaison entre un ordre de fabrication et une chaine de production."""

    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ordre          = models.ForeignKey(
        OrdreFabrication, on_delete=models.CASCADE, related_name='affectations'
    )
    chaine         = models.ForeignKey(
        ChaineProduction, on_delete=models.CASCADE, related_name='affectations'
    )
    heure_debut    = models.DateTimeField(null=True, blank=True)
    heure_fin      = models.DateTimeField(null=True, blank=True)
    quantite_entree= models.DecimalField(max_digits=12, decimal_places=3, default=0)
    quantite_sortie= models.DecimalField(max_digits=12, decimal_places=3, default=0)
    taux_rendement = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    supervise_par  = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='affectations_supervisees'
    )

    class Meta:
        db_table        = 'affectation_chaine'
        verbose_name    = 'Affectation chaine'
        verbose_name_plural = 'Affectations chaines'

    def save(self, *args, **kwargs):
        if float(self.quantite_entree) > 0:
            self.taux_rendement = round(
                (float(self.quantite_sortie) / float(self.quantite_entree)) * 100, 2
            )
        super().save(*args, **kwargs)


class SessionProduction(models.Model):
    """
    Session de production en temps reel sur une chaine.
    Mise a jour via WebSocket par les operateurs.
    """

    SHIFT_CHOICES = [
        ('matin',  'Matin'),
        ('aprem',  'Apres-midi'),
        ('nuit',   'Nuit'),
    ]

    STATUT_CHOICES = [
        ('planifiee', 'Planifiee'),
        ('en_cours',  'En cours'),
        ('pause',     'En pause'),
        ('terminee',  'Terminee'),
    ]

    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chaine           = models.ForeignKey(
        ChaineProduction, on_delete=models.CASCADE, related_name='sessions'
    )
    ordre            = models.ForeignKey(
        OrdreFabrication, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='sessions'
    )
    date_session     = models.DateField()
    shift            = models.CharField(max_length=10, choices=SHIFT_CHOICES, default='matin')
    heure_debut      = models.DateTimeField(null=True, blank=True)
    heure_fin        = models.DateTimeField(null=True, blank=True)
    compteur_pieces  = models.IntegerField(default=0)
    objectif_session = models.IntegerField(default=0)
    taux_realisation = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    statut           = models.CharField(max_length=15, choices=STATUT_CHOICES, default='planifiee')
    chef             = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='sessions_chef'
    )
    observations     = models.TextField(blank=True)
    date_creation    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'session_production'
        verbose_name    = 'Session production'
        verbose_name_plural = 'Sessions production'
        ordering        = ['-date_session', '-heure_debut']
        unique_together = [('chaine', 'date_session', 'shift')]

    def __str__(self):
        return f"{self.chaine.code} | {self.date_session} | {self.shift} | {self.compteur_pieces} pcs"

    def incrementer_compteur(self, quantite=1):
        """Incremente le compteur de pieces (appele depuis WebSocket)."""
        self.compteur_pieces += quantite
        if self.objectif_session > 0:
            self.taux_realisation = round(
                (self.compteur_pieces / self.objectif_session) * 100, 2
            )
        self.save(update_fields=['compteur_pieces', 'taux_realisation'])
        return self.compteur_pieces