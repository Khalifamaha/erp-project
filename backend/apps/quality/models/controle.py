# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings
from .critere import CritereQualite


class ControleQualite(models.Model):

    RESULTAT_CHOICES = [
        ('conforme',      'Conforme'),
        ('non_conforme',  'Non conforme'),
        ('a_verifier',    'A reverifier'),
        ('accepte_derog', 'Accepte en derogation'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ordre               = models.ForeignKey(
        'production.OrdreFabrication', on_delete=models.CASCADE,
        related_name='controles_qualite'
    )
    employe             = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='controles_effectues'
    )
    critere             = models.ForeignKey(
        CritereQualite, on_delete=models.PROTECT, related_name='controles'
    )
    lot                 = models.ForeignKey(
        'inventory.Lot', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='controles'
    )
    date_controle       = models.DateTimeField(auto_now_add=True)
    valeur_mesuree      = models.DecimalField(
        max_digits=12, decimal_places=4, null=True, blank=True
    )
    quantite_controlee  = models.DecimalField(max_digits=12, decimal_places=3, default=1)
    quantite_conforme   = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    quantite_rebut      = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    resultat            = models.CharField(
        max_length=15, choices=RESULTAT_CHOICES, default='conforme'
    )
    action_corrective   = models.TextField(blank=True)
    observations        = models.TextField(blank=True)
    date_creation       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table            = 'controle_qualite'
        verbose_name        = 'Controle qualite'
        verbose_name_plural = 'Controles qualite'
        ordering            = ['-date_controle']
        indexes             = [
            models.Index(fields=['ordre', 'resultat']),
            models.Index(fields=['critere', 'date_controle']),
            models.Index(fields=['lot']),
        ]

    def __str__(self):
        return f"{self.ordre.numero} | {self.critere.nom} | {self.resultat}"

    @property
    def taux_conformite(self):
        if float(self.quantite_controlee) == 0:
            return 0
        return round(
            float(self.quantite_conforme) / float(self.quantite_controlee) * 100, 1
        )

    def save(self, *args, **kwargs):
        # Determiner resultat automatiquement si valeur mesuree
        if self.valeur_mesuree is not None and self.critere:
            conforme = self.critere.est_dans_tolerance(self.valeur_mesuree)
            if not self.resultat or self.resultat == 'conforme':
                self.resultat = 'conforme' if conforme else 'non_conforme'

        # Quantite conforme = controlee - rebut si non renseignee
        if float(self.quantite_conforme) == 0 and float(self.quantite_rebut) > 0:
            self.quantite_conforme = max(
                0, float(self.quantite_controlee) - float(self.quantite_rebut)
            )

        super().save(*args, **kwargs)

        # Ouvrir automatiquement une fiche NC si non conforme et critere critique
        if self.resultat == 'non_conforme' and self.critere.critique:
            self._ouvrir_fiche_nc()

    def _ouvrir_fiche_nc(self):
        """Cree automatiquement une fiche NC si pas deja ouverte."""
        try:
            from .fiche_nc import FicheNC
            existe = FicheNC.objects.filter(
                controle=self, statut__in=['ouverte', 'en_cours']
            ).exists()
            if not existe:
                import datetime
                from django.utils import timezone
                num = f"NC-{timezone.now().strftime('%Y%m%d')}-{self.ordre.numero[-3:]}"
                FicheNC.objects.create(
                    controle=self,
                    lot=self.lot,
                    produit=self.ordre.produit,
                    numero_nc=num,
                    gravite='haute' if self.critere.critique else 'moyenne',
                    type_nc='produit',
                    description_defaut=(
                        f"Non-conformite detectee sur {self.critere.nom}. "
                        f"Valeur mesuree : {self.valeur_mesuree} {self.critere.unite}. "
                        f"Tolerance : {self.critere.tolerance_label}."
                    ),
                    statut='ouverte',
                    lot_bloque=True,
                    ouverte_par=self.employe,
                )
        except Exception:
            pass