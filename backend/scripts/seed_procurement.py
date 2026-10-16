# -*- coding: utf-8 -*-
import os
import django
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.procurement.models import (
    Fournisseur, CommandeAchat, LigneCommandeAchat,
    Reception, LigneReception, FactureAchat,
)
from apps.inventory.models import Produit
from apps.accounts.models import User
from django.utils import timezone

print("\n" + "="*60)
print("  SEED PROCUREMENT - Fournisseurs, Commandes, Receptions, Factures")
print("="*60)

# 0. Nettoyage
print("\n[0] Nettoyage procurement...")
FactureAchat.objects.all().delete()
LigneReception.objects.all().delete()
Reception.objects.all().delete()
LigneCommandeAchat.objects.all().delete()
CommandeAchat.objects.all().delete()
Fournisseur.objects.all().delete()
print("    OK")

try:
    user_achat = User.objects.get(email='direction@erp.com')
except User.DoesNotExist:
    user_achat = User.objects.filter(is_active=True).first()

try:
    user_compta = User.objects.get(email='comptable@erp.com')
except User.DoesNotExist:
    user_compta = user_achat

aujourd_hui = date.today()

# 1. FOURNISSEURS
print("\n[1] Creation des fournisseurs...")

fournisseurs_data = [
    {
        'code': 'FRN-001',
        'raison_sociale': 'AcierPro SARL',
        'contact': 'Monsieur Habib Rezgui',
        'email': 'habib@acierpro.tn',
        'telephone': '+216 71 100 001',
        'telephone2': '+216 98 100 001',
        'adresse': '12 Zone Industrielle Ben Arous',
        'ville': 'Ben Arous',
        'pays': 'Tunisie',
        'num_fiscal': '1234567/A/M/000',
        'num_rc': 'B123456789',
        'statut': 'actif',
        'categorie': 'matiere_premiere',
        'delai_livraison': 7,
        'score_qualite': 92,
        'devise_pref': 'TND',
        'conditions_paiement': '30j',
        'delai_paiement_jours': 30,
        'notes': 'Fournisseur principal acier - fiable',
    },
    {
        'code': 'FRN-002',
        'raison_sociale': 'MetalDist Tunis',
        'contact': 'Madame Sonia Chabbi',
        'email': 'sonia@metaldist.tn',
        'telephone': '+216 71 200 002',
        'adresse': '45 Avenue Bourguiba Sousse',
        'ville': 'Sousse',
        'pays': 'Tunisie',
        'num_fiscal': '2345678/B/M/000',
        'num_rc': 'B234567890',
        'statut': 'actif',
        'categorie': 'matiere_premiere',
        'delai_livraison': 10,
        'score_qualite': 85,
        'devise_pref': 'TND',
        'conditions_paiement': '60j',
        'delai_paiement_jours': 60,
        'notes': 'Fournisseur acier carbone et profiles',
    },
    {
        'code': 'FRN-003',
        'raison_sociale': 'AluminiumCo Sfax',
        'contact': 'Monsieur Tarek Maalej',
        'email': 'tarek@aluminiumco.tn',
        'telephone': '+216 74 300 003',
        'adresse': '8 Route de Tunis Sfax',
        'ville': 'Sfax',
        'pays': 'Tunisie',
        'num_fiscal': '3456789/C/M/000',
        'num_rc': 'B345678901',
        'statut': 'actif',
        'categorie': 'matiere_premiere',
        'delai_livraison': 14,
        'score_qualite': 88,
        'devise_pref': 'EUR',
        'conditions_paiement': '30j',
        'delai_paiement_jours': 30,
        'notes': 'Specialiste aluminium et alliages legers',
    },
    {
        'code': 'FRN-004',
        'raison_sociale': 'PlastiChem Sfax',
        'contact': 'Monsieur Nabil Ghariani',
        'email': 'nabil@plastichem.tn',
        'telephone': '+216 74 400 004',
        'adresse': '22 Zone Industrielle Sfax',
        'ville': 'Sfax',
        'pays': 'Tunisie',
        'num_fiscal': '4567890/D/M/000',
        'num_rc': 'B456789012',
        'statut': 'actif',
        'categorie': 'matiere_premiere',
        'delai_livraison': 5,
        'score_qualite': 78,
        'devise_pref': 'TND',
        'conditions_paiement': 'comptant',
        'delai_paiement_jours': 0,
        'notes': 'Granules plastiques ABS et PP',
    },
    {
        'code': 'FRN-005',
        'raison_sociale': 'LubriTech Tunis',
        'contact': 'Madame Rim Jlassi',
        'email': 'rim@lubritech.tn',
        'telephone': '+216 71 500 005',
        'adresse': '3 Rue des Artisans Ariana',
        'ville': 'Ariana',
        'pays': 'Tunisie',
        'num_fiscal': '5678901/E/M/000',
        'num_rc': 'B567890123',
        'statut': 'actif',
        'categorie': 'consommable',
        'delai_livraison': 3,
        'score_qualite': 95,
        'devise_pref': 'TND',
        'conditions_paiement': '30j',
        'delai_paiement_jours': 30,
        'notes': 'Huiles et lubrifiants industriels - livraison rapide',
    },
    {
        'code': 'FRN-006',
        'raison_sociale': 'SKF Maghreb',
        'contact': 'Monsieur Ahmed Ferchiou',
        'email': 'ahmed@skf-maghreb.com',
        'telephone': '+216 71 600 006',
        'adresse': '15 Avenue de la Republique Tunis',
        'ville': 'Tunis',
        'pays': 'Tunisie',
        'num_fiscal': '6789012/F/M/000',
        'num_rc': 'B678901234',
        'statut': 'actif',
        'categorie': 'piece_rechange',
        'delai_livraison': 21,
        'score_qualite': 98,
        'devise_pref': 'EUR',
        'conditions_paiement': '60j',
        'delai_paiement_jours': 60,
        'notes': 'Roulements et composants mecaniques de qualite',
    },
    {
        'code': 'FRN-007',
        'raison_sociale': 'CuivreImport SARL',
        'contact': 'Monsieur Walid Nasr',
        'email': 'walid@cuivreimport.tn',
        'telephone': '+216 71 700 007',
        'adresse': '7 Zone Franche Bizerte',
        'ville': 'Bizerte',
        'pays': 'Tunisie',
        'num_fiscal': '7890123/G/M/000',
        'num_rc': 'B789012345',
        'statut': 'actif',
        'categorie': 'matiere_premiere',
        'delai_livraison': 18,
        'score_qualite': 82,
        'devise_pref': 'EUR',
        'conditions_paiement': '30j',
        'delai_paiement_jours': 30,
        'notes': 'Import cuivre et bronze - delais parfois longs',
    },
    {
        'code': 'FRN-008',
        'raison_sociale': 'AbrasifPro Nabeul',
        'contact': 'Madame Olfa Triki',
        'email': 'olfa@abrasifpro.tn',
        'telephone': '+216 72 800 008',
        'adresse': '2 Route Ceramique Nabeul',
        'ville': 'Nabeul',
        'pays': 'Tunisie',
        'num_fiscal': '8901234/H/M/000',
        'num_rc': 'B890123456',
        'statut': 'inactif',
        'categorie': 'consommable',
        'delai_livraison': 7,
        'score_qualite': 65,
        'devise_pref': 'TND',
        'conditions_paiement': 'comptant',
        'delai_paiement_jours': 0,
        'notes': 'Disques abrasifs - qualite variable - mise en attente',
    },
]

fournisseurs = {}
for fd in fournisseurs_data:
    f = Fournisseur.objects.create(**fd)
    fournisseurs[f.code] = f
    print(f"    OK - [{f.code}] {f.raison_sociale} | Score: {f.score_qualite}/100")

# Recuperer les produits
try:
    mp001 = Produit.objects.get(reference='MP-001')
    mp002 = Produit.objects.get(reference='MP-002')
    mp003 = Produit.objects.get(reference='MP-003')
    mp004 = Produit.objects.get(reference='MP-004')
    mp005 = Produit.objects.get(reference='MP-005')
    cs001 = Produit.objects.get(reference='CS-001')
    cs002 = Produit.objects.get(reference='CS-002')
    cs003 = Produit.objects.get(reference='CS-003')
    pr001 = Produit.objects.get(reference='PR-001')
    pr002 = Produit.objects.get(reference='PR-002')
    produits_ok = True
    print("\n    Produits inventory recuperes : OK")
except Produit.DoesNotExist:
    produits_ok = False
    print("\n    ATTENTION : Produits inventory non trouves - lancer seed_inventory.py d abord")
    import sys; sys.exit(1)

# 2. COMMANDES ACHAT
print("\n[2] Creation des commandes achat...")

commandes_data = [
    {
        'numero': 'CA-2024-001',
        'fournisseur': fournisseurs['FRN-001'],
        'date_commande': aujourd_hui - timedelta(days=60),
        'date_livraison_prev': aujourd_hui - timedelta(days=45),
        'date_livraison_reel': aujourd_hui - timedelta(days=43),
        'statut': 'livree',
        'devise': 'TND',
        'notes': 'Commande acier Q1 2024',
        'lignes': [
            {'produit': mp001, 'quantite_commandee': Decimal('3000'), 'prix_unitaire': Decimal('3.200'), 'remise_pct': Decimal('0')},
        ],
    },
    {
        'numero': 'CA-2024-002',
        'fournisseur': fournisseurs['FRN-002'],
        'date_commande': aujourd_hui - timedelta(days=50),
        'date_livraison_prev': aujourd_hui - timedelta(days=35),
        'date_livraison_reel': aujourd_hui - timedelta(days=33),
        'statut': 'livree',
        'devise': 'TND',
        'notes': 'Barres acier carbone',
        'lignes': [
            {'produit': mp002, 'quantite_commandee': Decimal('2000'), 'prix_unitaire': Decimal('1.600'), 'remise_pct': Decimal('2')},
        ],
    },
    {
        'numero': 'CA-2024-003',
        'fournisseur': fournisseurs['FRN-003'],
        'date_commande': aujourd_hui - timedelta(days=35),
        'date_livraison_prev': aujourd_hui - timedelta(days=15),
        'date_livraison_reel': aujourd_hui - timedelta(days=14),
        'statut': 'livree',
        'devise': 'EUR',
        'notes': 'Profils aluminium 6061',
        'lignes': [
            {'produit': mp003, 'quantite_commandee': Decimal('1000'), 'prix_unitaire': Decimal('4.900'), 'remise_pct': Decimal('0')},
        ],
    },
    {
        'numero': 'CA-2024-004',
        'fournisseur': fournisseurs['FRN-005'],
        'date_commande': aujourd_hui - timedelta(days=20),
        'date_livraison_prev': aujourd_hui - timedelta(days=17),
        'date_livraison_reel': aujourd_hui - timedelta(days=17),
        'statut': 'livree',
        'devise': 'TND',
        'notes': 'Reapprovisionnement consommables',
        'lignes': [
            {'produit': cs001, 'quantite_commandee': Decimal('200'), 'prix_unitaire': Decimal('8.500'), 'remise_pct': Decimal('5')},
            {'produit': cs002, 'quantite_commandee': Decimal('50'),  'prix_unitaire': Decimal('6.200'), 'remise_pct': Decimal('0')},
        ],
    },
    {
        'numero': 'CA-2024-005',
        'fournisseur': fournisseurs['FRN-006'],
        'date_commande': aujourd_hui - timedelta(days=30),
        'date_livraison_prev': aujourd_hui - timedelta(days=5),
        'statut': 'confirmee',
        'devise': 'EUR',
        'notes': 'Roulements et courroies maintenance',
        'lignes': [
            {'produit': pr001, 'quantite_commandee': Decimal('50'),  'prix_unitaire': Decimal('15.500'), 'remise_pct': Decimal('0')},
            {'produit': pr002, 'quantite_commandee': Decimal('20'),  'prix_unitaire': Decimal('22.000'), 'remise_pct': Decimal('0')},
        ],
    },
    {
        'numero': 'CA-2024-006',
        'fournisseur': fournisseurs['FRN-001'],
        'date_commande': aujourd_hui - timedelta(days=5),
        'date_livraison_prev': aujourd_hui + timedelta(days=5),
        'statut': 'soumise',
        'devise': 'TND',
        'notes': 'Commande urgente acier inox',
        'lignes': [
            {'produit': mp001, 'quantite_commandee': Decimal('1500'), 'prix_unitaire': Decimal('3.300'), 'remise_pct': Decimal('0')},
        ],
    },
    {
        'numero': 'CA-2024-007',
        'fournisseur': fournisseurs['FRN-004'],
        'date_commande': aujourd_hui - timedelta(days=90),
        'date_livraison_prev': aujourd_hui - timedelta(days=75),
        'date_livraison_reel': aujourd_hui - timedelta(days=74),
        'statut': 'livree',
        'devise': 'TND',
        'notes': 'Granules ABS production trimestrielle',
        'lignes': [
            {'produit': mp004, 'quantite_commandee': Decimal('800'), 'prix_unitaire': Decimal('1.900'), 'remise_pct': Decimal('3')},
        ],
    },
]

commandes = {}
for cd in commandes_data:
    lignes_data = cd.pop('lignes')
    commande = CommandeAchat.objects.create(cree_par=user_achat, **cd)
    for ld in lignes_data:
        LigneCommandeAchat.objects.create(
            commande=commande,
            statut='complete' if commande.statut == 'livree' else 'en_attente',
            quantite_recue=ld['quantite_commandee'] if commande.statut == 'livree' else Decimal('0'),
            **ld,
        )
    commande.recalculer_montant()
    commandes[commande.numero] = commande
    print(f"    OK - {commande.numero} | {commande.fournisseur.raison_sociale} | {commande.montant_total} {commande.devise} | {commande.statut}")

# 3. RECEPTIONS
print("\n[3] Creation des receptions...")

receptions_data = [
    {
        'numero': 'REC-2024-001',
        'commande': commandes['CA-2024-001'],
        'date_reception': aujourd_hui - timedelta(days=43),
        'statut': 'acceptee',
        'num_bl': 'BL-FRN001-20240101',
        'num_camion': '123TU4567',
        'observations': 'Livraison conforme - toles bien conditionnees',
    },
    {
        'numero': 'REC-2024-002',
        'commande': commandes['CA-2024-002'],
        'date_reception': aujourd_hui - timedelta(days=33),
        'statut': 'acceptee',
        'num_bl': 'BL-FRN002-20240115',
        'num_camion': '456TU7890',
        'observations': 'Reception ok - legere trace de rouille sur 2 barres',
    },
    {
        'numero': 'REC-2024-003',
        'commande': commandes['CA-2024-003'],
        'date_reception': aujourd_hui - timedelta(days=14),
        'statut': 'acceptee',
        'num_bl': 'BL-FRN003-20240201',
        'num_camion': '789TU1234',
        'observations': 'Profils aluminium - qualite excellente',
    },
    {
        'numero': 'REC-2024-004',
        'commande': commandes['CA-2024-004'],
        'date_reception': aujourd_hui - timedelta(days=17),
        'statut': 'acceptee',
        'num_bl': 'BL-FRN005-20240210',
        'num_camion': '321TU6547',
        'observations': 'Consommables - tout conforme',
    },
    {
        'numero': 'REC-2024-005',
        'commande': commandes['CA-2024-007'],
        'date_reception': aujourd_hui - timedelta(days=74),
        'statut': 'acceptee',
        'num_bl': 'BL-FRN004-20231201',
        'num_camion': '654TU9871',
        'observations': 'Granules plastiques - sachet endommage - refuse 10kg',
    },
]

receptions = {}
for rd in receptions_data:
    reception = Reception.objects.create(receptionniste=user_achat, **rd)
    commande  = reception.commande
    for lca in commande.lignes.all():
        qte_acc = float(lca.quantite_commandee)
        qte_ref = 0.0
        if reception.numero == 'REC-2024-005':
            qte_ref = 10.0
            qte_acc = qte_acc - qte_ref
        LigneReception.objects.create(
            reception=reception,
            ligne_commande=lca,
            quantite_recue=lca.quantite_commandee,
            quantite_acceptee=Decimal(str(qte_acc)),
            quantite_refusee=Decimal(str(qte_ref)),
            numero_lot=f"LOT-REC-{reception.numero[-3:]}-{lca.produit.reference}",
        )
    receptions[reception.numero] = reception
    print(f"    OK - {reception.numero} | {reception.commande.numero} | {reception.statut}")

# 4. FACTURES ACHAT
print("\n[4] Creation des factures achat...")

factures_data = [
    {
        'numero': 'FA-2024-001',
        'numero_fournisseur': 'INV-FRN001-2024-001',
        'fournisseur': fournisseurs['FRN-001'],
        'commande': commandes['CA-2024-001'],
        'date_facture': aujourd_hui - timedelta(days=43),
        'date_echeance': aujourd_hui - timedelta(days=13),
        'montant_ht': Decimal('9600.000'),
        'taux_tva': Decimal('19'),
        'montant_paye': Decimal('11424.000'),
        'mode_paiement': 'virement',
        'reference_paiement': 'VIR-2024-001',
        'date_paiement': aujourd_hui - timedelta(days=10),
        'notes': 'Facture acier toles - payee',
    },
    {
        'numero': 'FA-2024-002',
        'numero_fournisseur': 'INV-FRN002-2024-005',
        'fournisseur': fournisseurs['FRN-002'],
        'commande': commandes['CA-2024-002'],
        'date_facture': aujourd_hui - timedelta(days=33),
        'date_echeance': aujourd_hui + timedelta(days=27),
        'montant_ht': Decimal('3136.000'),
        'taux_tva': Decimal('19'),
        'montant_paye': Decimal('0'),
        'mode_paiement': 'virement',
        'notes': 'Facture barres acier carbone - echeance 60j',
    },
    {
        'numero': 'FA-2024-003',
        'numero_fournisseur': 'INV-ALU-2024-012',
        'fournisseur': fournisseurs['FRN-003'],
        'commande': commandes['CA-2024-003'],
        'date_facture': aujourd_hui - timedelta(days=14),
        'date_echeance': aujourd_hui + timedelta(days=16),
        'montant_ht': Decimal('4900.000'),
        'taux_tva': Decimal('19'),
        'montant_paye': Decimal('0'),
        'mode_paiement': 'virement',
        'notes': 'Facture profils aluminium - EUR converti TND',
    },
    {
        'numero': 'FA-2024-004',
        'numero_fournisseur': 'INV-LUB-2024-033',
        'fournisseur': fournisseurs['FRN-005'],
        'commande': commandes['CA-2024-004'],
        'date_facture': aujourd_hui - timedelta(days=17),
        'date_echeance': aujourd_hui + timedelta(days=13),
        'montant_ht': Decimal('1925.000'),
        'taux_tva': Decimal('19'),
        'montant_paye': Decimal('1000.000'),
        'mode_paiement': 'cheque',
        'reference_paiement': 'CHQ-2024-042',
        'date_paiement': aujourd_hui - timedelta(days=5),
        'notes': 'Acompte verse - solde a payer',
    },
    {
        'numero': 'FA-2024-005',
        'numero_fournisseur': 'INV-FRN004-2024-089',
        'fournisseur': fournisseurs['FRN-004'],
        'commande': commandes['CA-2024-007'],
        'date_facture': aujourd_hui - timedelta(days=74),
        'date_echeance': aujourd_hui - timedelta(days=74),
        'montant_ht': Decimal('1472.800'),
        'taux_tva': Decimal('19'),
        'montant_paye': Decimal('1752.632'),
        'mode_paiement': 'virement',
        'reference_paiement': 'VIR-2023-089',
        'date_paiement': aujourd_hui - timedelta(days=72),
        'notes': 'Granules ABS - paiement comptant selon conditions',
    },
    {
        'numero': 'FA-2024-006',
        'numero_fournisseur': 'INV-FRN002-2024-RETARD',
        'fournisseur': fournisseurs['FRN-002'],
        'commande': None,
        'date_facture': aujourd_hui - timedelta(days=95),
        'date_echeance': aujourd_hui - timedelta(days=35),
        'montant_ht': Decimal('2500.000'),
        'taux_tva': Decimal('19'),
        'montant_paye': Decimal('0'),
        'mode_paiement': 'virement',
        'notes': 'Facture ancienne - EN RETARD - a regulariser',
    },
]

for fd in factures_data:
    f = FactureAchat.objects.create(enregistree_par=user_compta, **fd)
    retard = ' *** EN RETARD ***' if f.est_en_retard else ''
    print(f"    OK - {f.numero} | {f.fournisseur.raison_sociale} | TTC: {f.montant_ttc} | {f.statut}{retard}")

# RESUME
print("\n" + "="*60)
print("  SEED PROCUREMENT TERMINE")
print("="*60)
print(f"  Fournisseurs   : {Fournisseur.objects.count()}")
print(f"  Commandes      : {CommandeAchat.objects.count()}")
print(f"    - Livrees    : {CommandeAchat.objects.filter(statut='livree').count()}")
print(f"    - En cours   : {CommandeAchat.objects.filter(statut__in=['soumise','confirmee','partielle']).count()}")
print(f"  Receptions     : {Reception.objects.count()}")
print(f"  Factures achat : {FactureAchat.objects.count()}")
print(f"    - Payees     : {FactureAchat.objects.filter(statut='payee').count()}")
print(f"    - En retard  : {FactureAchat.objects.filter(date_echeance__lt=aujourd_hui).exclude(statut='payee').count()}")
from django.db.models import Sum
total_achats = CommandeAchat.objects.filter(statut='livree').aggregate(t=Sum('montant_total'))['t'] or 0
print(f"  Total achats livres : {total_achats} TND")
print("="*60)