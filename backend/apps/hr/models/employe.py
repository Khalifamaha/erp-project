# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings


class Employe(models.Model):

    TYPE_CONTRAT = [
        ('cdi',          'CDI'),
        ('cdd',          'CDD'),
        ('stage',        'Stage'),
        ('interim',      'Intérim'),
        ('apprentissage','Apprentissage'),
    ]

    STATUT = [
        ('actif',      'Actif'),
        ('suspendu',   'Suspendu'),
        ('conge',      'En congé'),
        ('demissionnaire', 'Démissionnaire'),
        ('licencie',   'Licencié'),
    ]

    DEPARTEMENT = [
        ('production',   'Production'),
        ('qualite',      'Qualité'),
        ('maintenance',  'Maintenance'),
        ('rh',           'Ressources humaines'),
        ('comptabilite', 'Comptabilité'),
        ('logistique',   'Logistique'),
        ('commercial',   'Commercial'),
        ('direction',    'Direction'),
        ('informatique', 'Informatique'),
        ('achats',       'Achats'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur         = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='employe'
    )
    matricule           = models.CharField(max_length=20, unique=True)
    nom                 = models.CharField(max_length=100)
    prenom              = models.CharField(max_length=100)
    cin                 = models.CharField(max_length=20, unique=True)
    poste               = models.CharField(max_length=100)
    departement         = models.CharField(max_length=30, choices=DEPARTEMENT)
    type_contrat        = models.CharField(max_length=20, choices=TYPE_CONTRAT, default='cdi')
    statut              = models.CharField(max_length=20, choices=STATUT, default='actif')
    date_embauche       = models.DateField()
    date_fin_contrat    = models.DateField(null=True, blank=True)
    salaire_base        = models.DecimalField(max_digits=10, decimal_places=3)
    num_cnss            = models.CharField(max_length=30, blank=True)
    rib_bancaire        = models.CharField(max_length=50, blank=True)
    niveau_qualification= models.CharField(max_length=100, blank=True)
    solde_conge         = models.IntegerField(default=0)
    telephone           = models.CharField(max_length=20, blank=True)
    telephone_urgence   = models.CharField(max_length=20, blank=True)
    contact_urgence     = models.CharField(max_length=100, blank=True)
    photo_url           = models.CharField(max_length=500, blank=True)
    date_creation       = models.DateTimeField(auto_now_add=True)
    date_modification   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'employe'
        verbose_name        = 'Employé'
        verbose_name_plural = 'Employés'
        ordering            = ['nom', 'prenom']
        indexes             = [
            models.Index(fields=['matricule']),
            models.Index(fields=['departement']),
            models.Index(fields=['statut']),
        ]

    def __str__(self):
        return f"[{self.matricule}] {self.prenom} {self.nom}"

    @property
    def nom_complet(self):
        return f"{self.prenom} {self.nom}"