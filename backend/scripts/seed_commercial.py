import os
import django
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.commercial.models import Client, CommandeClient, LigneCommandeClient, Camion, Expedition, LigneExpedition
from apps.inventory.models import Produit
from apps.accounts.models import User

print("\n" + "="*60)
print("  SEED COMMERCIAL - Clients, Commandes, Camions, Expeditions")
print("="*60)

print("\n[0] Nettoyage...")
LigneExpedition.objects.all().delete()
Expedition.objects.all().delete()
Camion.objects.all().delete()
LigneCommandeClient.objects.all().delete()
CommandeClient.objects.all().delete()
Client.objects.all().delete()
print("    OK")

try:
    user_com = User.objects.get(email='direction@erp.com')
    user_log = User.objects.get(email='chef.production@erp.com')
except User.DoesNotExist:
    user_com = user_log = User.objects.filter(is_active=True).first()

try:
    pf001 = Produit.objects.get(reference='PF-001')
    pf002 = Produit.objects.get(reference='PF-002')
    pf003 = Produit.objects.get(reference='PF-003')
except Produit.DoesNotExist:
    print("    ATTENTION : Produits non trouves - lancer seed_inventory.py d abord")
    import sys; sys.exit(1)

aujourd_hui = date.today()

print("\n[1] Creation des clients...")
clients_data = [
    {'code':'CLI-001','raison_sociale':'Alpha Corp Tunis',    'type':'entreprise','contact_principal':'M. Kacem Nefzi',     'email':'kacem@alphacorp.tn',  'telephone':'+216 71 001 001','ville':'Tunis',  'pays':'Tunisie','num_fiscal':'1111111/A/M/000','devise':'TND','conditions_paiement':'30j','delai_paiement_jours':30,'limite_credit':Decimal('50000'),'score_credit':95,'statut':'actif'},
    {'code':'CLI-002','raison_sociale':'Beta Industries Sfax','type':'entreprise','contact_principal':'Mme. Rania Hamdi',   'email':'rania@betaind.tn',    'telephone':'+216 74 002 002','ville':'Sfax',   'pays':'Tunisie','num_fiscal':'2222222/B/M/000','devise':'TND','conditions_paiement':'60j','delai_paiement_jours':60,'limite_credit':Decimal('80000'),'score_credit':88,'statut':'actif'},
    {'code':'CLI-003','raison_sociale':'Gamma Export Sousse', 'type':'export',    'contact_principal':'M. Sami Belhadj',    'email':'sami@gammaex.com',    'telephone':'+216 73 003 003','ville':'Sousse', 'pays':'Tunisie','num_fiscal':'3333333/C/M/000','devise':'EUR','conditions_paiement':'60j','delai_paiement_jours':60,'limite_credit':Decimal('120000'),'score_credit':82,'statut':'actif'},
    {'code':'CLI-004','raison_sociale':'Delta SARL Nabeul',   'type':'entreprise','contact_principal':'M. Walid Triki',     'email':'walid@delta.tn',      'telephone':'+216 72 004 004','ville':'Nabeul', 'pays':'Tunisie','num_fiscal':'4444444/D/M/000','devise':'TND','conditions_paiement':'30j','delai_paiement_jours':30,'limite_credit':Decimal('30000'),'score_credit':75,'statut':'actif'},
    {'code':'CLI-005','raison_sociale':'Epsilon France SAS',  'type':'export',    'contact_principal':'Mme. Sophie Dupont', 'email':'sdupont@epsilon.fr',  'telephone':'+33 1 23 45 67 89','ville':'Lyon','pays':'France','num_fiscal':'FR12345678901','devise':'EUR','conditions_paiement':'60j','delai_paiement_jours':60,'limite_credit':Decimal('200000'),'score_credit':98,'statut':'actif'},
    {'code':'CLI-006','raison_sociale':'Zeta Maroc SARL',     'type':'export',    'contact_principal':'M. Hassan Alami',    'email':'halami@zeta.ma',      'telephone':'+212 5 22 334455','ville':'Casablanca','pays':'Maroc','num_fiscal':'MA123456789','devise':'EUR','conditions_paiement':'30j','delai_paiement_jours':30,'limite_credit':Decimal('60000'),'score_credit':79,'statut':'actif'},
    {'code':'CLI-007','raison_sociale':'Eta Prospect Bizerte','type':'entreprise','contact_principal':'M. Amine Selmi',     'email':'aselmi@eta.tn',       'telephone':'+216 72 007 007','ville':'Bizerte','pays':'Tunisie','num_fiscal':'7777777/G/M/000','devise':'TND','conditions_paiement':'comptant','delai_paiement_jours':0,'limite_credit':Decimal('10000'),'score_credit':65,'statut':'prospect'},
]

clients = {}
for cd in clients_data:
    c = Client.objects.create(**cd)
    clients[c.code] = c
    print(f"    OK - [{c.code}] {c.raison_sociale} | {c.pays} | {c.statut}")

print("\n[2] Creation des commandes clients...")
commandes_data = [
    {
        'numero':'CC-2024-001','client':clients['CLI-001'],
        'date_commande':aujourd_hui-timedelta(days=30),
        'date_livraison_confirmee':aujourd_hui-timedelta(days=5),
        'statut':'livree','devise':'TND','incoterm':'EXW',
        'lignes':[
            {'produit':pf001,'quantite_commandee':Decimal('50'),'quantite_livree':Decimal('50'),'prix_unitaire':Decimal('185'),'remise_pct':Decimal('0'),'statut':'livree'},
            {'produit':pf002,'quantite_commandee':Decimal('100'),'quantite_livree':Decimal('100'),'prix_unitaire':Decimal('45'),'remise_pct':Decimal('5'),'statut':'livree'},
        ],
    },
    {
        'numero':'CC-2024-002','client':clients['CLI-002'],
        'date_commande':aujourd_hui-timedelta(days=20),
        'date_livraison_confirmee':aujourd_hui+timedelta(days=10),
        'statut':'en_cours','devise':'TND','incoterm':'EXW',
        'lignes':[
            {'produit':pf001,'quantite_commandee':Decimal('80'),'quantite_livree':Decimal('0'),'prix_unitaire':Decimal('185'),'remise_pct':Decimal('3'),'statut':'en_cours'},
            {'produit':pf003,'quantite_commandee':Decimal('500'),'quantite_livree':Decimal('0'),'prix_unitaire':Decimal('12.5'),'remise_pct':Decimal('0'),'statut':'en_cours'},
        ],
    },
    {
        'numero':'CC-2024-003','client':clients['CLI-003'],
        'date_commande':aujourd_hui-timedelta(days=45),
        'date_livraison_confirmee':aujourd_hui-timedelta(days=10),
        'statut':'livree','devise':'EUR','incoterm':'FOB',
        'notes':'Export hors taxes',
        'lignes':[
            {'produit':pf001,'quantite_commandee':Decimal('100'),'quantite_livree':Decimal('100'),'prix_unitaire':Decimal('55'),'remise_pct':Decimal('0'),'statut':'livree'},
        ],
    },
    {
        'numero':'CC-2024-004','client':clients['CLI-005'],
        'date_commande':aujourd_hui-timedelta(days=5),
        'date_livraison_confirmee':aujourd_hui+timedelta(days=25),
        'statut':'confirmee','devise':'EUR','incoterm':'CIF',
        'lignes':[
            {'produit':pf001,'quantite_commandee':Decimal('60'),'quantite_livree':Decimal('0'),'prix_unitaire':Decimal('58'),'remise_pct':Decimal('5'),'statut':'en_attente'},
            {'produit':pf002,'quantite_commandee':Decimal('200'),'quantite_livree':Decimal('0'),'prix_unitaire':Decimal('14'),'remise_pct':Decimal('0'),'statut':'en_attente'},
        ],
    },
    {
        'numero':'CC-2024-005','client':clients['CLI-004'],
        'date_commande':aujourd_hui-timedelta(days=2),
        'date_livraison_confirmee':aujourd_hui+timedelta(days=15),
        'statut':'brouillon','devise':'TND','incoterm':'EXW',
        'lignes':[
            {'produit':pf003,'quantite_commandee':Decimal('1000'),'quantite_livree':Decimal('0'),'prix_unitaire':Decimal('12.5'),'remise_pct':Decimal('2'),'statut':'en_attente'},
        ],
    },
]

commandes = {}
for cd in commandes_data:
    lignes_data = cd.pop('lignes')
    cmd = CommandeClient.objects.create(commercial=user_com, **cd)
    for ld in lignes_data:
        LigneCommandeClient.objects.create(commande=cmd, **ld)
    cmd.recalculer_montant()
    commandes[cmd.numero] = cmd
    print(f"    OK - {cmd.numero} | {cmd.client.raison_sociale} | {cmd.montant_total} {cmd.devise} | {cmd.statut}")

print("\n[3] Creation des camions...")
camions_data = [
    {'immatriculation':'100TU5001','marque':'Mercedes','modele':'Actros 2545','numero_serie':'WDB93400312345001','capacite_kg':Decimal('25000'),'volume_m3':Decimal('80'),'statut':'disponible','chauffeur_nom':'Ben Salah Mohamed','chauffeur_telephone':'+216 98 001 001','numero_permis':'TN123456','type_transport':'Tautliner'},
    {'immatriculation':'200TU5002','marque':'Volvo',   'modele':'FH 500',     'numero_serie':'YV2RT20A4KB345002','capacite_kg':Decimal('24000'),'volume_m3':Decimal('82'),'statut':'disponible','chauffeur_nom':'Trabelsi Hichem',  'chauffeur_telephone':'+216 98 002 002','numero_permis':'TN234567','type_transport':'Frigorifique'},
    {'immatriculation':'300TU5003','marque':'MAN',     'modele':'TGX 18.500', 'numero_serie':'WMA06XZZ8KM345003','capacite_kg':Decimal('22000'),'volume_m3':Decimal('75'),'statut':'en_route',   'chauffeur_nom':'Gharbi Nabil',      'chauffeur_telephone':'+216 98 003 003','numero_permis':'TN345678','type_transport':'Plateau'},
    {'immatriculation':'400TU5004','marque':'DAF',     'modele':'XF 480',     'numero_serie':'XLRTE47XS0E345004','capacite_kg':Decimal('26000'),'volume_m3':Decimal('85'),'statut':'maintenance', 'chauffeur_nom':'Sassi Slim',        'chauffeur_telephone':'+216 98 004 004','numero_permis':'TN456789','type_transport':'Tautliner','prochaine_revision':aujourd_hui+timedelta(days=30)},
]

camions = {}
for cd in camions_data:
    c = Camion.objects.create(**cd)
    camions[c.immatriculation] = c
    print(f"    OK - {c.immatriculation} | {c.marque} {c.modele} | {c.capacite_kg}kg | {c.statut}")

print("\n[4] Creation des expeditions...")
expeditions_data = [
    {
        'numero':'EXP-2024-001',
        'camion':camions['300TU5003'],
        'commande_client':commandes['CC-2024-001'],
        'date_depart':aujourd_hui-timedelta(days=5),
        'date_arrivee_prev':aujourd_hui-timedelta(days=3),
        'date_arrivee_reel':aujourd_hui-timedelta(days=3),
        'destination':'Tunis - Zone Industrielle Ben Arous',
        'pays_destination':'Tunisie',
        'statut':'livree',
        'poids_total':Decimal('712.5'),
        'valeur_totale':Decimal('13975.000'),
        'incoterm':'EXW',
        'numero_bl':'BL-EXP-2024-001',
        'notes':'Livraison conforme - client satisfait',
    },
    {
        'numero':'EXP-2024-002',
        'camion':camions['100TU5001'],
        'commande_client':commandes['CC-2024-003'],
        'date_depart':aujourd_hui-timedelta(days=10),
        'date_arrivee_prev':aujourd_hui-timedelta(days=7),
        'date_arrivee_reel':aujourd_hui-timedelta(days=8),
        'destination':'Port de Sousse - Export France',
        'pays_destination':'France',
        'statut':'livree',
        'poids_total':Decimal('1250.000'),
        'valeur_totale':Decimal('5500.000'),
        'incoterm':'FOB',
        'numero_bl':'BL-EXP-2024-002',
        'numero_douane':'D-2024-5001',
        'notes':'Export conforme douane',
    },
    {
        'numero':'EXP-2024-003',
        'camion':camions['200TU5002'],
        'commande_client':None,
        'date_depart':aujourd_hui,
        'date_arrivee_prev':aujourd_hui+timedelta(days=2),
        'destination':'Sfax Centre',
        'pays_destination':'Tunisie',
        'statut':'en_route',
        'poids_total':Decimal('0'),
        'valeur_totale':Decimal('0'),
        'incoterm':'EXW',
        'notes':'Expedition en cours de chargement',
    },
]

for ed in expeditions_data:
    e = Expedition.objects.create(responsable=user_log, **ed)
    print(f"    OK - {e.numero} | {e.destination} | {e.statut} | {e.poids_total}kg")

print("\n" + "="*60)
print("  SEED COMMERCIAL TERMINE")
print("="*60)
print(f"  Clients     : {Client.objects.count()}")
print(f"  Commandes   : {CommandeClient.objects.count()}")
print(f"  Camions     : {Camion.objects.count()}")
print(f"  Expeditions : {Expedition.objects.count()}")
from django.db.models import Sum
ca = CommandeClient.objects.aggregate(t=Sum('montant_total'))['t'] or 0
print(f"  CA total    : {ca} (multi-devises)")
print("="*60)