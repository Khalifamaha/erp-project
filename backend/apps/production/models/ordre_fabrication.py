# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings
from .gamme import GammeOperatoire


class OrdreFabrication(models.Model):

    STATUT_CHOICES = [
        ('brouillon',   'Brouillon'),
        ('planifie',    'Planifie'),
        ('lance',       'Lance'),
        ('en_cours',    'En cours'),
        ('pause',       'En pause'),
        ('termine',     'Termine'),
        ('annule',      'Annule'),
    ]

    PRIORITE_CHOICES = [
        (1, 'Urgente'),
        (2, 'Haute'),
        (3, 'Normale'),
        (4, 'Basse'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    numero              = models.CharField(max_length=30, unique=True)
    produit             = models.ForeignKey(
        'inventory.Produit', on_delete=models.PROTECT, related_name='ordres_fabrication'
    )
    gamme               = models.ForeignKey(
        GammeOperatoire, on_delete=models.PROTECT, related_name='ordres'
    )
    # Lien optionnel vers commande client (sera complete quand app commercial creee)
    commande_client_id  = models.UUIDField(null=True, blank=True)
    quantite_prevue     = models.DecimalField(max_digits=12, decimal_places=3)
    quantite_produite   = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    quantite_rebutee    = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    date_debut_prev     = models.DateField(null=True, blank=True)
    date_fin_prev       = models.DateField(null=True, blank=True)
    date_debut_reel     = models.DateTimeField(null=True, blank=True)
    date_fin_reel       = models.DateTimeField(null=True, blank=True)
    statut              = models.CharField(max_length=15, choices=STATUT_CHOICES, default='brouillon')
    priorite            = models.IntegerField(choices=PRIORITE_CHOICES, default=3)
    responsable         = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='ordres_responsable'
    )
    notes_operateur     = models.TextField(blank=True)
    date_creation       = models.DateTimeField(auto_now_add=True)
    date_modification   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'ordre_fabrication'
        verbose_name        = 'Ordre de fabrication'
        verbose_name_plural = 'Ordres de fabrication'
        ordering            = ['priorite', '-date_creation']
        indexes             = [
            models.Index(fields=['numero']),
            models.Index(fields=['statut', 'priorite']),
            models.Index(fields=['produit', 'statut']),
        ]

    def __str__(self):
        return f"{self.numero} — {self.produit.reference} x{self.quantite_prevue} ({self.statut})"

    @property
    def taux_avancement(self):
        if float(self.quantite_prevue) == 0:
            return 0
        return round((float(self.quantite_produite) / float(self.quantite_prevue)) * 100, 1)

    @property
    def quantite_restante(self):
        return max(0, float(self.quantite_prevue) - float(self.quantite_produite))

    @property
    def duree_reelle_heures(self):
        if self.date_debut_reel and self.date_fin_reel:
            delta = self.date_fin_reel - self.date_debut_reel
            return round(delta.total_seconds() / 3600, 2)
        return None

    def lancer(self, user=None):
        from django.utils import timezone
        self.statut        = 'lance'
        self.date_debut_reel = timezone.now()
        self.save(update_fields=['statut', 'date_debut_reel'])

    def terminer(self, user=None):
        from django.utils import timezone
        self.statut      = 'termine'
        self.date_fin_reel = timezone.now()
        self.save(update_fields=['statut', 'date_fin_reel'])
        # Creer le lot produit fini et entrer en stock
        self._entrer_produit_fini_en_stock(user)

    def _entrer_produit_fini_en_stock(self, user=None):
        """Cree le lot PF et enregistre le mouvement d entree stock."""
        try:
            from apps.inventory.models import Lot, MouvementStock
            from django.utils import timezone as tz
            lot = Lot.objects.create(
                produit=self.produit,
                numero_lot=f"LOT-PF-{self.numero}",
                quantite_initiale=self.quantite_produite,
                quantite_restante=self.quantite_produite,
                statut='disponible',
                origine='production',
                ordre_fab_id=self.id,
                date_fabrication=tz.now().date(),
            )
            MouvementStock.enregistrer(
                produit=self.produit,
                type_mouvement='entree_production',
                quantite=self.quantite_produite,
                lot=lot,
                utilisateur=user,
                reference_doc=self.numero,
                motif=f"Production terminee OF {self.numero}",
                ordre_fab_id=self.id,
            )
        except Exception:
            pass


class ConsommationOF(models.Model):
    """Matiere premiere consommee pour un ordre de fabrication."""

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ordre               = models.ForeignKey(
        OrdreFabrication, on_delete=models.CASCADE, related_name='consommations'
    )
    produit             = models.ForeignKey(
        'inventory.Produit', on_delete=models.PROTECT, related_name='consommations_of'
    )
    lot                 = models.ForeignKey(
        'inventory.Lot', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='consommations'
    )
    quantite_prevue     = models.DecimalField(max_digits=12, decimal_places=3)
    quantite_reelle     = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    date_consommation   = models.DateTimeField(auto_now_add=True)
    saisie_par          = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='consommations_saisies'
    )

    class Meta:
        db_table            = 'consommation_of'
        verbose_name        = 'Consommation OF'
        verbose_name_plural = 'Consommations OF'

    def __str__(self):
        return f"{self.ordre.numero} | {self.produit.reference} | {self.quantite_reelle}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        # Sortie stock automatique a la consommation
        if is_new and float(self.quantite_reelle) > 0:
            try:
                from apps.inventory.models import MouvementStock
                MouvementStock.enregistrer(
                    produit=self.produit,
                    type_mouvement='sortie_production',
                    quantite=self.quantite_reelle,
                    lot=self.lot,
                    utilisateur=self.saisie_par,
                    reference_doc=self.ordre.numero,
                    motif=f"Consommation OF {self.ordre.numero}",
                    ordre_fab_id=self.ordre.id,
                )
            except Exception:
                pass