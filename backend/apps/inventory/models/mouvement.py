# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.conf import settings
from django.db import transaction
from .produit import Produit
from .lot import Lot


class MouvementStock(models.Model):

    TYPE_CHOICES = [
        ('entree_achat',       'Entree achat fournisseur'),
        ('entree_production',  'Entree depuis production'),
        ('entree_retour',      'Retour client'),
        ('sortie_production',  'Consommation production'),
        ('sortie_expedition',  'Expedition client'),
        ('sortie_rebut',       'Mise au rebut'),
        ('ajustement_pos',     'Ajustement positif'),
        ('ajustement_neg',     'Ajustement negatif'),
        ('transfert',          'Transfert emplacement'),
        ('inventaire',         'Inventaire'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit         = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='mouvements')
    lot             = models.ForeignKey(Lot, on_delete=models.SET_NULL, null=True, blank=True, related_name='mouvements')
    type_mouvement  = models.CharField(max_length=25, choices=TYPE_CHOICES)
    quantite        = models.DecimalField(max_digits=12, decimal_places=3)
    stock_avant     = models.DecimalField(max_digits=12, decimal_places=3)
    stock_apres     = models.DecimalField(max_digits=12, decimal_places=3)
    prix_unitaire   = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    date_mouvement  = models.DateTimeField(auto_now_add=True)
    reference_doc   = models.CharField(max_length=100, blank=True)
    utilisateur     = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='mouvements_stock'
    )
    motif           = models.TextField(blank=True)
    # FKs optionnelles vers d'autres apps
    ordre_fab_id    = models.UUIDField(null=True, blank=True)
    expedition_id   = models.UUIDField(null=True, blank=True)
    commande_id     = models.UUIDField(null=True, blank=True)

    class Meta:
        db_table            = 'mouvement_stock'
        verbose_name        = 'Mouvement stock'
        verbose_name_plural = 'Mouvements stock'
        ordering            = ['-date_mouvement']
        indexes             = [
            models.Index(fields=['produit', 'date_mouvement']),
            models.Index(fields=['type_mouvement']),
            models.Index(fields=['reference_doc']),
        ]

    def __str__(self):
        return f"{self.type_mouvement} | {self.produit.reference} | {self.quantite}"

    @classmethod
    def enregistrer(cls, produit, type_mouvement, quantite,
                    lot=None, utilisateur=None, reference_doc='',
                    motif='', prix_unitaire=0, **extra):
        """
        Methode principale pour creer un mouvement de stock.
        Utilise select_for_update() pour eviter les race conditions.
        """
        with transaction.atomic():
            produit_lock = Produit.objects.select_for_update().get(pk=produit.pk)
            stock_avant  = produit_lock.stock_actuel

            # Determiner sens du mouvement
            types_entree = [
                'entree_achat', 'entree_production',
                'entree_retour', 'ajustement_pos', 'inventaire'
            ]
            if type_mouvement in types_entree:
                nouveau_stock = float(stock_avant) + float(quantite)
            else:
                nouveau_stock = float(stock_avant) - float(quantite)
                if nouveau_stock < 0:
                    raise ValueError(
                        f"Stock insuffisant pour {produit.reference}. "
                        f"Stock: {stock_avant}, Demande: {quantite}"
                    )

            from decimal import Decimal
            produit_lock.stock_actuel = Decimal(str(round(nouveau_stock, 3)))
            produit_lock.save(update_fields=['stock_actuel'])

            # Mettre a jour la quantite restante du lot
            if lot:
                types_sortie_lot = [
                    'sortie_production', 'sortie_expedition',
                    'sortie_rebut', 'ajustement_neg'
                ]
                if type_mouvement in types_sortie_lot:
                    lot.quantite_restante = max(
                        0,
                        float(lot.quantite_restante) - float(quantite)
                    )
                    if float(lot.quantite_restante) == 0:
                        lot.statut = 'epuise'
                    lot.save(update_fields=['quantite_restante', 'statut'])

            mvt = cls.objects.create(
                produit=produit_lock,
                lot=lot,
                type_mouvement=type_mouvement,
                quantite=quantite,
                stock_avant=stock_avant,
                stock_apres=produit_lock.stock_actuel,
                prix_unitaire=prix_unitaire,
                utilisateur=utilisateur,
                reference_doc=reference_doc,
                motif=motif,
                **extra,
            )

            # Alerte si stock sous seuil minimum
            if produit_lock.est_sous_seuil:
                cls._envoyer_alerte_stock(produit_lock)

            return mvt

    @staticmethod
    def _envoyer_alerte_stock(produit):
        try:
            from apps.accounts.models import Notification, User
            direction = User.objects.filter(
                user_roles__role__niveau__in=['direction', 'chef'],
                user_roles__actif=True,
                is_active=True,
            ).distinct()
            for user in direction:
                Notification.objects.create(
                    destinataire=user,
                    type='STOCK_BAS',
                    titre=f'Stock bas : {produit.reference}',
                    message=(
                        f'Le produit {produit.designation} a atteint son seuil minimum. '
                        f'Stock actuel : {produit.stock_actuel} {produit.unite_mesure}. '
                        f'Seuil : {produit.stock_minimum} {produit.unite_mesure}.'
                    ),
                    priorite='haute',
                    module_source='inventory',
                    data={
                        'produit_id': str(produit.id),
                        'reference': produit.reference,
                        'stock_actuel': str(produit.stock_actuel),
                        'stock_minimum': str(produit.stock_minimum),
                    }
                )
        except Exception:
            pass