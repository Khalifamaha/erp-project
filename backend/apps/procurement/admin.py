from django.contrib import admin
from .models import Fournisseur, CommandeAchat, LigneCommandeAchat, Reception, LigneReception, FactureAchat


class LigneCommandeInline(admin.TabularInline):
    model  = LigneCommandeAchat
    extra  = 0
    fields = ('produit', 'quantite_commandee', 'quantite_recue', 'prix_unitaire', 'remise_pct', 'statut')
    readonly_fields = ('quantite_recue', 'statut')


class LigneReceptionInline(admin.TabularInline):
    model  = LigneReception
    extra  = 0
    fields = ('ligne_commande', 'quantite_recue', 'quantite_acceptee', 'quantite_refusee', 'numero_lot')


@admin.register(Fournisseur)
class FournisseurAdmin(admin.ModelAdmin):
    list_display  = ('code', 'raison_sociale', 'pays', 'categorie', 'score_qualite', 'statut')
    list_filter   = ('statut', 'categorie', 'pays')
    search_fields = ('code', 'raison_sociale', 'num_fiscal', 'email')
    ordering      = ('raison_sociale',)


@admin.register(CommandeAchat)
class CommandeAchatAdmin(admin.ModelAdmin):
    list_display  = ('numero', 'fournisseur', 'date_commande', 'date_livraison_prev', 'montant_total', 'statut')
    list_filter   = ('statut', 'devise')
    search_fields = ('numero', 'fournisseur__raison_sociale')
    date_hierarchy= 'date_commande'
    inlines       = [LigneCommandeInline]
    readonly_fields = ('montant_total', 'date_creation', 'date_modification')


@admin.register(Reception)
class ReceptionAdmin(admin.ModelAdmin):
    list_display  = ('numero', 'commande', 'date_reception', 'num_bl', 'statut')
    list_filter   = ('statut',)
    search_fields = ('numero', 'commande__numero', 'num_bl')
    date_hierarchy= 'date_reception'
    inlines       = [LigneReceptionInline]


@admin.register(FactureAchat)
class FactureAchatAdmin(admin.ModelAdmin):
    list_display  = ('numero', 'fournisseur', 'date_facture', 'date_echeance', 'montant_ttc', 'montant_paye', 'statut')
    list_filter   = ('statut', 'mode_paiement')
    search_fields = ('numero', 'numero_fournisseur', 'fournisseur__raison_sociale')
    date_hierarchy= 'date_facture'
    readonly_fields = ('montant_tva', 'montant_ttc', 'date_creation', 'date_modification')