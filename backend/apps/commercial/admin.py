from django.contrib import admin
from .models import Client, CommandeClient, LigneCommandeClient, Camion, Expedition, LigneExpedition


class LigneCmdInline(admin.TabularInline):
    model  = LigneCommandeClient
    extra  = 0
    fields = ('produit', 'quantite_commandee', 'quantite_livree',
              'prix_unitaire', 'remise_pct', 'statut')


class LigneExpInline(admin.TabularInline):
    model  = LigneExpedition
    extra  = 0
    fields = ('produit', 'lot', 'quantite', 'poids', 'unite')


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display   = ('code', 'raison_sociale', 'type', 'pays', 'score_credit', 'statut')
    list_filter    = ('statut', 'type', 'pays')
    search_fields  = ('code', 'raison_sociale', 'num_fiscal', 'email')
    ordering       = ('raison_sociale',)
    readonly_fields= ('date_creation', 'date_modification')


@admin.register(CommandeClient)
class CommandeClientAdmin(admin.ModelAdmin):
    list_display   = ('numero', 'client', 'date_commande',
                      'date_livraison_confirmee', 'montant_total', 'statut')
    list_filter    = ('statut', 'devise')
    search_fields  = ('numero', 'client__raison_sociale')
    date_hierarchy = 'date_commande'
    readonly_fields= ('montant_total', 'date_creation', 'date_modification')
    inlines        = [LigneCmdInline]


@admin.register(Camion)
class CamionAdmin(admin.ModelAdmin):
    list_display   = ('immatriculation', 'marque', 'modele', 'capacite_kg',
                      'statut', 'chauffeur_nom', 'prochaine_revision')
    list_filter    = ('statut',)
    search_fields  = ('immatriculation', 'chauffeur_nom', 'numero_permis')


@admin.register(Expedition)
class ExpeditionAdmin(admin.ModelAdmin):
    list_display   = ('numero', 'camion', 'destination', 'date_depart',
                      'date_arrivee_prev', 'poids_total', 'statut')
    list_filter    = ('statut', 'pays_destination')
    search_fields  = ('numero', 'destination', 'numero_bl', 'numero_douane')
    date_hierarchy = 'date_depart'
    readonly_fields= ('date_creation', 'date_modification')
    inlines        = [LigneExpInline]