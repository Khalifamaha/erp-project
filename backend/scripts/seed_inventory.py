# -*- coding: utf-8 -*-
import os
import django
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.inventory.models import CategorieProduit, EmplacementStock, Produit, Lot, MouvementStock
from apps.accounts.models import User

print("\n" + "="*60)
print("  SEED INVENTORY - Stock, Produits, Lots, Mouvements")
print("="*60)

# 0. Nettoyage
print("\n[0] Nettoyage inventory...")
MouvementStock.objects.all().delete()
Lot.objects.all().delete()
Produit.objects.all().delete()
EmplacementStock.objects.all().delete()
CategorieProduit.objects.all().delete()
print("    OK")

# Recuperer un user pour les mouvements
try:
    user_stock = User.objects.get(email='direction@erp.com')
except User.DoesNotExist:
    user_stock = User.objects.filter(is_active=True).first()

# 1. EMPLACEMENTS
print("\n[1] Creation des emplacements...")

emplacements_data = [
    {'code':'ENT-A1', 'nom':'Entrepot A - Zone 1',   'type':'entrepot',   'zone':'A','allee':'1','niveau':'0','capacite_max':Decimal('5000.00')},
    {'code':'ENT-A2', 'nom':'Entrepot A - Zone 2',   'type':'entrepot',   'zone':'A','allee':'2','niveau':'0','capacite_max':Decimal('5000.00')},
    {'code':'ENT-B1', 'nom':'Entrepot B - Zone 1',   'type':'entrepot',   'zone':'B','allee':'1','niveau':'0','capacite_max':Decimal('3000.00')},
    {'code':'ATL-01', 'nom':'Atelier Production 1',  'type':'atelier',    'zone':'P','allee':'1','niveau':'0','capacite_max':Decimal('500.00')},
    {'code':'ATL-02', 'nom':'Atelier Production 2',  'type':'atelier',    'zone':'P','allee':'2','niveau':'0','capacite_max':Decimal('500.00')},
    {'code':'QUAI-01','nom':'Quai Expedition',        'type':'quai',       'zone':'Q','allee':'1','niveau':'0','capacite_max':Decimal('2000.00')},
    {'code':'QAR-01', 'nom':'Zone Quarantaine',       'type':'quarantaine','zone':'C','allee':'1','niveau':'0','capacite_max':Decimal('200.00')},
    {'code':'RBT-01', 'nom':'Zone Rebut',             'type':'rebut',      'zone':'R','allee':'1','niveau':'0','capacite_max':Decimal('100.00')},
]

emplacements = {}
for ed in emplacements_data:
    e = EmplacementStock.objects.create(**ed)
    emplacements[e.code] = e
    print(f"    OK - [{e.code}] {e.nom}")

# 2. CATEGORIES
print("\n[2] Creation des categories...")

# Categories racines
cat_mp  = CategorieProduit.objects.create(nom='Matieres Premieres', type='matiere_premiere')
cat_pf  = CategorieProduit.objects.create(nom='Produits Finis',     type='produit_fini')
cat_sf  = CategorieProduit.objects.create(nom='Semi-Finis',         type='semi_fini')
cat_cons= CategorieProduit.objects.create(nom='Consommables',       type='consommable')
cat_pr  = CategorieProduit.objects.create(nom='Pieces Rechange',    type='piece_rechange')

# Sous-categories
cat_acier  = CategorieProduit.objects.create(nom='Acier et Alliages', type='matiere_premiere', parent=cat_mp)
cat_plastiq= CategorieProduit.objects.create(nom='Plastiques',        type='matiere_premiere', parent=cat_mp)
cat_chimie = CategorieProduit.objects.create(nom='Produits Chimiques',type='consommable',       parent=cat_cons)

print(f"    OK - {CategorieProduit.objects.count()} categories creees")

# 3. PRODUITS
print("\n[3] Creation des produits...")

produits_data = [
    # Matieres premieres
    {'reference':'MP-001','designation':'Acier inoxydable 304 - Tole 2mm',     'type':'matiere_premiere','categorie':cat_acier,  'unite_mesure':'kg',   'stock_actuel':Decimal('2500.000'),'stock_minimum':Decimal('500.000'), 'stock_maximum':Decimal('5000.000'),'stock_securite':Decimal('300.000'),'prix_unitaire':Decimal('3.500'),  'cout_revient':Decimal('3.200'), 'emplacement':emplacements['ENT-A1'],'poids_kg':Decimal('1.000'),'code_douanier':'7219.31'},
    {'reference':'MP-002','designation':'Acier carbone S235 - Barre ronde D50','type':'matiere_premiere','categorie':cat_acier,  'unite_mesure':'kg',   'stock_actuel':Decimal('1800.000'),'stock_minimum':Decimal('300.000'), 'stock_maximum':Decimal('4000.000'),'stock_securite':Decimal('200.000'),'prix_unitaire':Decimal('1.800'),  'cout_revient':Decimal('1.600'), 'emplacement':emplacements['ENT-A1'],'poids_kg':Decimal('1.000'),'code_douanier':'7214.20'},
    {'reference':'MP-003','designation':'Aluminium 6061 - Profile T',          'type':'matiere_premiere','categorie':cat_acier,  'unite_mesure':'kg',   'stock_actuel':Decimal('950.000'), 'stock_minimum':Decimal('200.000'), 'stock_maximum':Decimal('3000.000'),'stock_securite':Decimal('150.000'),'prix_unitaire':Decimal('5.200'),  'cout_revient':Decimal('4.900'), 'emplacement':emplacements['ENT-A2'],'poids_kg':Decimal('1.000'),'code_douanier':'7604.29'},
    {'reference':'MP-004','designation':'Plastique ABS - Granules',             'type':'matiere_premiere','categorie':cat_plastiq,'unite_mesure':'kg',   'stock_actuel':Decimal('600.000'), 'stock_minimum':Decimal('150.000'), 'stock_maximum':Decimal('2000.000'),'stock_securite':Decimal('100.000'),'prix_unitaire':Decimal('2.100'),  'cout_revient':Decimal('1.900'), 'emplacement':emplacements['ENT-A2'],'poids_kg':Decimal('1.000'),'code_douanier':'3903.20'},
    {'reference':'MP-005','designation':'Cuivre rouge - Fil 6mm',              'type':'matiere_premiere','categorie':cat_acier,  'unite_mesure':'kg',   'stock_actuel':Decimal('120.000'), 'stock_minimum':Decimal('100.000'), 'stock_maximum':Decimal('800.000'), 'stock_securite':Decimal('80.000'), 'prix_unitaire':Decimal('9.800'),  'cout_revient':Decimal('9.500'), 'emplacement':emplacements['ENT-A2'],'poids_kg':Decimal('1.000'),'code_douanier':'7408.11'},

    # Produits finis
    {'reference':'PF-001','designation':'Chassis assemblé modele A',           'type':'produit_fini',   'categorie':cat_pf,    'unite_mesure':'piece','stock_actuel':Decimal('245.000'), 'stock_minimum':Decimal('50.000'),  'stock_maximum':Decimal('500.000'), 'stock_securite':Decimal('30.000'), 'prix_unitaire':Decimal('185.000'), 'cout_revient':Decimal('142.000'),'emplacement':emplacements['ENT-B1'],'poids_kg':Decimal('12.500'),'code_douanier':'8302.42'},
    {'reference':'PF-002','designation':'Boitier plastique reference B200',    'type':'produit_fini',   'categorie':cat_pf,    'unite_mesure':'piece','stock_actuel':Decimal('380.000'), 'stock_minimum':Decimal('80.000'),  'stock_maximum':Decimal('800.000'), 'stock_securite':Decimal('50.000'), 'prix_unitaire':Decimal('45.000'),  'cout_revient':Decimal('32.000'), 'emplacement':emplacements['ENT-B1'],'poids_kg':Decimal('0.850'),'code_douanier':'3926.90'},
    {'reference':'PF-003','designation':'Support de fixation galvanise SFG-10','type':'produit_fini',   'categorie':cat_pf,    'unite_mesure':'piece','stock_actuel':Decimal('1200.000'),'stock_minimum':Decimal('200.000'), 'stock_maximum':Decimal('2000.000'),'stock_securite':Decimal('150.000'),'prix_unitaire':Decimal('12.500'),  'cout_revient':Decimal('8.800'),  'emplacement':emplacements['ENT-B1'],'poids_kg':Decimal('0.320'),'code_douanier':'7318.15'},

    # Semi-finis
    {'reference':'SF-001','designation':'Sous-ensemble mecanique SME-05',      'type':'semi_fini',      'categorie':cat_sf,    'unite_mesure':'piece','stock_actuel':Decimal('85.000'),  'stock_minimum':Decimal('20.000'),  'stock_maximum':Decimal('200.000'), 'stock_securite':Decimal('15.000'), 'prix_unitaire':Decimal('78.000'),  'cout_revient':Decimal('65.000'), 'emplacement':emplacements['ATL-01'],'poids_kg':Decimal('4.200')},
    {'reference':'SF-002','designation':'Plaque decoupee et pliee PDC-03',     'type':'semi_fini',      'categorie':cat_sf,    'unite_mesure':'piece','stock_actuel':Decimal('320.000'), 'stock_minimum':Decimal('50.000'),  'stock_maximum':Decimal('600.000'), 'stock_securite':Decimal('40.000'), 'prix_unitaire':Decimal('22.000'),  'cout_revient':Decimal('17.500'), 'emplacement':emplacements['ATL-01'],'poids_kg':Decimal('1.800')},

    # Consommables
    {'reference':'CS-001','designation':'Huile de coupe - Bidon 20L',          'type':'consommable',    'categorie':cat_chimie,'unite_mesure':'l',    'stock_actuel':Decimal('180.000'), 'stock_minimum':Decimal('40.000'),  'stock_maximum':Decimal('400.000'), 'stock_securite':Decimal('30.000'), 'prix_unitaire':Decimal('8.500'),   'cout_revient':Decimal('8.500'),  'emplacement':emplacements['ENT-A2']},
    {'reference':'CS-002','designation':'Electrodes de soudure type E7018',    'type':'consommable',    'categorie':cat_chimie,'unite_mesure':'kg',   'stock_actuel':Decimal('45.000'),  'stock_minimum':Decimal('20.000'),  'stock_maximum':Decimal('200.000'), 'stock_securite':Decimal('15.000'), 'prix_unitaire':Decimal('6.200'),   'cout_revient':Decimal('6.200'),  'emplacement':emplacements['ENT-A2']},
    {'reference':'CS-003','designation':'Disque abrasif D230 grain 60',        'type':'consommable',    'categorie':cat_chimie,'unite_mesure':'piece','stock_actuel':Decimal('8.000'),   'stock_minimum':Decimal('20.000'),  'stock_maximum':Decimal('200.000'), 'stock_securite':Decimal('15.000'), 'prix_unitaire':Decimal('3.800'),   'cout_revient':Decimal('3.800'),  'emplacement':emplacements['ENT-A2']},

    # Pieces de rechange
    {'reference':'PR-001','designation':'Roulement SKF 6205-2RS',              'type':'piece_rechange', 'categorie':cat_pr,    'unite_mesure':'piece','stock_actuel':Decimal('24.000'),  'stock_minimum':Decimal('10.000'),  'stock_maximum':Decimal('100.000'), 'stock_securite':Decimal('8.000'),  'prix_unitaire':Decimal('15.500'),  'cout_revient':Decimal('15.500'), 'emplacement':emplacements['ENT-B1']},
    {'reference':'PR-002','designation':'Courroie trapezoidale A-65',          'type':'piece_rechange', 'categorie':cat_pr,    'unite_mesure':'piece','stock_actuel':Decimal('6.000'),   'stock_minimum':Decimal('5.000'),   'stock_maximum':Decimal('50.000'),  'stock_securite':Decimal('4.000'),  'prix_unitaire':Decimal('22.000'),  'cout_revient':Decimal('22.000'), 'emplacement':emplacements['ENT-B1']},
]

produits = {}
for pd in produits_data:
    p = Produit.objects.create(**pd)
    produits[p.reference] = p
    alerte = ' *** SOUS SEUIL ***' if p.est_sous_seuil else ''
    print(f"    OK - [{p.reference}] {p.designation[:40]} | Stock: {p.stock_actuel} {p.unite_mesure}{alerte}")

# 4. LOTS
print("\n[4] Creation des lots...")

aujourd_hui = date.today()

lots_data = [
    {'produit':produits['MP-001'],'numero_lot':'LOT-2024-001','date_fabrication':aujourd_hui-timedelta(days=60), 'date_expiration':aujourd_hui+timedelta(days=540),'quantite_initiale':Decimal('3000.000'),'quantite_restante':Decimal('2500.000'),'statut':'disponible','origine':'achat','fournisseur_nom':'AcierPro SARL',    'cout_unitaire':Decimal('3.200')},
    {'produit':produits['MP-001'],'numero_lot':'LOT-2024-002','date_fabrication':aujourd_hui-timedelta(days=10), 'date_expiration':aujourd_hui+timedelta(days=590),'quantite_initiale':Decimal('1000.000'),'quantite_restante':Decimal('1000.000'),'statut':'disponible','origine':'achat','fournisseur_nom':'AcierPro SARL',    'cout_unitaire':Decimal('3.250')},
    {'produit':produits['MP-002'],'numero_lot':'LOT-2024-003','date_fabrication':aujourd_hui-timedelta(days=45), 'date_expiration':aujourd_hui+timedelta(days=450),'quantite_initiale':Decimal('2000.000'),'quantite_restante':Decimal('1800.000'),'statut':'disponible','origine':'achat','fournisseur_nom':'MetalDist Tunis',  'cout_unitaire':Decimal('1.600')},
    {'produit':produits['MP-003'],'numero_lot':'LOT-2024-004','date_fabrication':aujourd_hui-timedelta(days=30), 'date_expiration':aujourd_hui+timedelta(days=600),'quantite_initiale':Decimal('1000.000'),'quantite_restante':Decimal('950.000'), 'statut':'disponible','origine':'achat','fournisseur_nom':'AluminumCo',       'cout_unitaire':Decimal('4.900')},
    {'produit':produits['MP-004'],'numero_lot':'LOT-2024-005','date_fabrication':aujourd_hui-timedelta(days=90), 'date_expiration':aujourd_hui+timedelta(days=270),'quantite_initiale':Decimal('800.000'), 'quantite_restante':Decimal('600.000'), 'statut':'disponible','origine':'achat','fournisseur_nom':'PlastiChem Sfax',  'cout_unitaire':Decimal('1.900')},
    {'produit':produits['MP-005'],'numero_lot':'LOT-2024-006','date_fabrication':aujourd_hui-timedelta(days=15), 'date_expiration':aujourd_hui+timedelta(days=700),'quantite_initiale':Decimal('150.000'), 'quantite_restante':Decimal('120.000'), 'statut':'disponible','origine':'achat','fournisseur_nom':'CuivreImport',      'cout_unitaire':Decimal('9.500')},
    {'produit':produits['PF-001'],'numero_lot':'LOT-PF-001',  'date_fabrication':aujourd_hui-timedelta(days=5),  'date_expiration':None,                            'quantite_initiale':Decimal('300.000'), 'quantite_restante':Decimal('245.000'), 'statut':'disponible','origine':'production','fournisseur_nom':'',         'cout_unitaire':Decimal('142.000')},
    {'produit':produits['PF-002'],'numero_lot':'LOT-PF-002',  'date_fabrication':aujourd_hui-timedelta(days=3),  'date_expiration':None,                            'quantite_initiale':Decimal('400.000'), 'quantite_restante':Decimal('380.000'), 'statut':'disponible','origine':'production','fournisseur_nom':'',         'cout_unitaire':Decimal('32.000')},
    {'produit':produits['CS-001'],'numero_lot':'LOT-CS-001',  'date_fabrication':aujourd_hui-timedelta(days=120),'date_expiration':aujourd_hui+timedelta(days=245),'quantite_initiale':Decimal('200.000'), 'quantite_restante':Decimal('180.000'), 'statut':'disponible','origine':'achat','fournisseur_nom':'LubriTech',        'cout_unitaire':Decimal('8.500')},
    {'produit':produits['CS-003'],'numero_lot':'LOT-CS-003',  'date_fabrication':aujourd_hui-timedelta(days=200),'date_expiration':aujourd_hui-timedelta(days=20), 'quantite_initiale':Decimal('50.000'),  'quantite_restante':Decimal('8.000'),  'statut':'disponible','origine':'achat','fournisseur_nom':'AbrasifPro',       'cout_unitaire':Decimal('3.800')},
]

lots = {}
for ld in lots_data:
    l = Lot.objects.create(**ld)
    lots[l.numero_lot] = l
    expire = ' *** EXPIRE ***' if l.est_expire else ''
    print(f"    OK - {l.numero_lot} | {l.produit.reference} | Restant: {l.quantite_restante}{expire}")

# 5. MOUVEMENTS (historique realiste)
print("\n[5] Creation des mouvements de stock...")

mouvements_data = [
    # Entrees achat
    {'produit':produits['MP-001'],'lot':lots['LOT-2024-001'],'type_mouvement':'entree_achat',      'quantite':Decimal('3000.000'),'reference_doc':'BC-2024-001','motif':'Achat fournisseur AcierPro',   'prix_unitaire':Decimal('3.200')},
    {'produit':produits['MP-002'],'lot':lots['LOT-2024-003'],'type_mouvement':'entree_achat',      'quantite':Decimal('2000.000'),'reference_doc':'BC-2024-002','motif':'Achat fournisseur MetalDist',  'prix_unitaire':Decimal('1.600')},
    {'produit':produits['MP-003'],'lot':lots['LOT-2024-004'],'type_mouvement':'entree_achat',      'quantite':Decimal('1000.000'),'reference_doc':'BC-2024-003','motif':'Achat fournisseur AluminumCo', 'prix_unitaire':Decimal('4.900')},
    # Sorties production
    {'produit':produits['MP-001'],'lot':lots['LOT-2024-001'],'type_mouvement':'sortie_production', 'quantite':Decimal('500.000'), 'reference_doc':'OF-2024-010','motif':'Consommation OF chassis A',     'prix_unitaire':Decimal('3.200')},
    {'produit':produits['MP-002'],'lot':lots['LOT-2024-003'],'type_mouvement':'sortie_production', 'quantite':Decimal('200.000'), 'reference_doc':'OF-2024-011','motif':'Consommation OF barre ronde',   'prix_unitaire':Decimal('1.600')},
    {'produit':produits['CS-001'],'lot':lots['LOT-CS-001'],  'type_mouvement':'sortie_production', 'quantite':Decimal('20.000'),  'reference_doc':'OF-2024-012','motif':'Huile de coupe atelier',        'prix_unitaire':Decimal('8.500')},
    # Entrees production (produits finis)
    {'produit':produits['PF-001'],'lot':lots['LOT-PF-001'],  'type_mouvement':'entree_production', 'quantite':Decimal('300.000'), 'reference_doc':'OF-2024-010','motif':'Production chassis A terminee',  'prix_unitaire':Decimal('142.000')},
    {'produit':produits['PF-002'],'lot':lots['LOT-PF-002'],  'type_mouvement':'entree_production', 'quantite':Decimal('400.000'), 'reference_doc':'OF-2024-013','motif':'Production boitier B200 terminee','prix_unitaire':Decimal('32.000')},
    # Sortie expedition
    {'produit':produits['PF-001'],'lot':lots['LOT-PF-001'],  'type_mouvement':'sortie_expedition', 'quantite':Decimal('55.000'),  'reference_doc':'EXP-2024-001','motif':'Expedition client Alpha Corp',  'prix_unitaire':Decimal('185.000')},
    {'produit':produits['PF-002'],'lot':lots['LOT-PF-002'],  'type_mouvement':'sortie_expedition', 'quantite':Decimal('20.000'),  'reference_doc':'EXP-2024-001','motif':'Expedition client Alpha Corp',  'prix_unitaire':Decimal('45.000')},
    # Ajustement inventaire
    {'produit':produits['CS-002'],'lot':None,                'type_mouvement':'ajustement_neg',    'quantite':Decimal('5.000'),   'reference_doc':'INV-2024-01','motif':'Ecart inventaire physique',      'prix_unitaire':Decimal('6.200')},
]

# Reinitialiser les stocks a 0 pour que les mouvements les construisent correctement
# En mode seed, on insere directement sans passer par enregistrer() pour eviter les doublons
from django.utils import timezone as tz
now = tz.now()
for i, md in enumerate(mouvements_data):
    p = md['produit']
    MouvementStock.objects.create(
        produit=md['produit'],
        lot=md.get('lot'),
        type_mouvement=md['type_mouvement'],
        quantite=md['quantite'],
        stock_avant=md['produit'].stock_actuel,
        stock_apres=md['produit'].stock_actuel,
        prix_unitaire=md.get('prix_unitaire', 0),
        reference_doc=md.get('reference_doc', ''),
        motif=md.get('motif', ''),
        utilisateur=user_stock,
    )
    print(f"    OK - {md['type_mouvement']} | {md['produit'].reference} | {md['quantite']}")

# RESUME
print("\n" + "="*60)
print("  SEED INVENTORY TERMINE")
print("="*60)
print(f"  Emplacements : {EmplacementStock.objects.count()}")
print(f"  Categories   : {CategorieProduit.objects.count()}")
print(f"  Produits     : {Produit.objects.count()}")
print(f"  Lots         : {Lot.objects.count()}")
print(f"  Mouvements   : {MouvementStock.objects.count()}")
sous_seuil = [p for p in Produit.objects.all() if p.est_sous_seuil]
print(f"  Produits sous seuil : {len(sous_seuil)}")
for p in sous_seuil:
    print(f"    -> [{p.reference}] {p.designation[:35]} | Stock: {p.stock_actuel} / Min: {p.stock_minimum}")
print("="*60)