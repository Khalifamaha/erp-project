# -*- coding: utf-8 -*-
import os
import django
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.comptabilite.models import ExerciceComptable, PlanComptable, EcritureComptable, Facture
from apps.accounts.models import User
from django.utils import timezone

print("\n" + "="*60)
print("  SEED COMPTABILITE")
print("="*60)

print("\n[0] Nettoyage...")
EcritureComptable.objects.all().delete()
Facture.objects.all().delete()
PlanComptable.objects.all().delete()
ExerciceComptable.objects.all().delete()
print("    OK")

try:
    user_compta = User.objects.get(email='comptable@erp.com')
    user_dir    = User.objects.get(email='direction@erp.com')
except User.DoesNotExist:
    user_compta = user_dir = User.objects.filter(is_active=True).first()

aujourd_hui = date.today()

# 1. EXERCICE COMPTABLE
print("\n[1] Creation exercice comptable...")
exercice = ExerciceComptable.objects.create(
    libelle=f"Exercice {aujourd_hui.year}",
    date_debut=date(aujourd_hui.year, 1, 1),
    date_fin=date(aujourd_hui.year, 12, 31),
    statut='ouvert',
    cloture=False,
    notes='Exercice courant',
)
print(f"    OK - {exercice.libelle}")

# 2. PLAN COMPTABLE (SCE Tunisien)
print("\n[2] Initialisation plan comptable tunisien...")
comptes_data = [
    ('101','Capital social',                    'passif',  '1','crediteur'),
    ('106','Reserves',                          'passif',  '1','crediteur'),
    ('129','Resultat de l exercice',            'passif',  '1','crediteur'),
    ('215','Materiel et outillage',             'actif',   '2','debiteur'),
    ('218','Autres immobilisations corporelles','actif',   '2','debiteur'),
    ('281','Amortissements immobilisations',    'actif',   '2','crediteur'),
    ('301','Matieres premieres',                'actif',   '3','debiteur'),
    ('355','Produits finis',                    'actif',   '3','debiteur'),
    ('401','Fournisseurs',                      'passif',  '4','crediteur'),
    ('411','Clients',                           'actif',   '4','debiteur'),
    ('421','Personnel - remuneration due',      'passif',  '4','crediteur'),
    ('431','CNSS',                              'passif',  '4','crediteur'),
    ('4437','TVA collectee',                    'passif',  '4','crediteur'),
    ('4456','TVA deductible',                   'actif',   '4','debiteur'),
    ('512','Banque',                            'actif',   '5','debiteur'),
    ('530','Caisse',                            'actif',   '5','debiteur'),
    ('601','Achats matieres premieres',         'charge',  '6','debiteur'),
    ('621','Loyers et charges locatives',       'charge',  '6','debiteur'),
    ('641','Remunerations du personnel',        'charge',  '6','debiteur'),
    ('645','Charges sociales patronales',       'charge',  '6','debiteur'),
    ('681','Dotations aux amortissements',      'charge',  '6','debiteur'),
    ('707','Ventes de produits finis',          'produit', '7','crediteur'),
    ('708','Produits des activites annexes',    'produit', '7','crediteur'),
]

comptes = {}
for numero, libelle, type_c, classe, sens in comptes_data:
    c = PlanComptable.objects.create(
        exercice=exercice, numero_compte=numero, libelle=libelle,
        type_compte=type_c, classe=classe, sens_normal=sens, actif=True,
    )
    comptes[numero] = c
print(f"    OK - {len(comptes)} comptes crees")

# 3. ECRITURES COMPTABLES
print("\n[3] Creation des ecritures comptables...")
ecritures_data = [
    {'debit':'601','credit':'401','montant':Decimal('9600.000'),'date':aujourd_hui-timedelta(days=43),'libelle':'Achat acier toles FRN-001 CA-2024-001','journal':'achats','ref':'CA-2024-001'},
    {'debit':'4456','credit':'401','montant':Decimal('1824.000'),'date':aujourd_hui-timedelta(days=43),'libelle':'TVA deductible achat acier','journal':'achats','ref':'CA-2024-001'},
    {'debit':'601','credit':'401','montant':Decimal('3136.000'),'date':aujourd_hui-timedelta(days=33),'libelle':'Achat barres acier FRN-002 CA-2024-002','journal':'achats','ref':'CA-2024-002'},
    {'debit':'641','credit':'421','montant':Decimal('25000.000'),'date':aujourd_hui-timedelta(days=5),'libelle':'Salaires mois en cours','journal':'salaires','ref':'PAIE-2024-001'},
    {'debit':'645','credit':'431','montant':Decimal('2295.000'),'date':aujourd_hui-timedelta(days=5),'libelle':'Charges CNSS patronales','journal':'salaires','ref':'PAIE-2024-001'},
    {'debit':'401','credit':'512','montant':Decimal('11424.000'),'date':aujourd_hui-timedelta(days=10),'libelle':'Reglement FRN-001 facture FA-2024-001','journal':'banque','ref':'VIR-2024-001'},
    {'debit':'411','credit':'707','montant':Decimal('15000.000'),'date':aujourd_hui-timedelta(days=15),'libelle':'Vente chassis client Alpha Corp','journal':'ventes','ref':'FAC-2024-001'},
    {'debit':'411','credit':'4437','montant':Decimal('2850.000'),'date':aujourd_hui-timedelta(days=15),'libelle':'TVA collectee vente chassis','journal':'ventes','ref':'FAC-2024-001'},
    {'debit':'512','credit':'411','montant':Decimal('17850.000'),'date':aujourd_hui-timedelta(days=3),'libelle':'Encaissement client Alpha Corp','journal':'banque','ref':'ENC-2024-001'},
]

for ed in ecritures_data:
    e = EcritureComptable.objects.create(
        exercice=exercice,
        compte_debit=comptes[ed['debit']],
        compte_credit=comptes[ed['credit']],
        montant=ed['montant'],
        date_ecriture=ed['date'],
        libelle=ed['libelle'],
        journal=ed['journal'],
        reference_externe=ed.get('ref',''),
        validee=True,
        valide_par=user_compta,
    )
    print(f"    OK - {e.journal} | {e.libelle[:40]} | {e.montant} DT")

# 4. FACTURES VENTE
print("\n[4] Creation des factures de vente...")
factures_data = [
    {
        'numero':'FAC-2024-001','type_facture':'facture',
        'client_nom':'Alpha Corp Tunis','devise':'TND',
        'date_emission':aujourd_hui-timedelta(days=15),
        'date_echeance':aujourd_hui+timedelta(days=15),
        'montant_ht':Decimal('15000.000'),'taux_tva':Decimal('19'),
        'montant_paye':Decimal('17850.000'),'statut':'payee',
        'exercice':exercice,
    },
    {
        'numero':'FAC-2024-002','type_facture':'facture',
        'client_nom':'Beta Industries Sfax','devise':'TND',
        'date_emission':aujourd_hui-timedelta(days=8),
        'date_echeance':aujourd_hui+timedelta(days=22),
        'montant_ht':Decimal('8500.000'),'taux_tva':Decimal('19'),
        'montant_paye':Decimal('0'),'statut':'emise',
        'exercice':exercice,
    },
    {
        'numero':'FAC-2024-003','type_facture':'facture',
        'client_nom':'Gamma Export Sousse','devise':'EUR',
        'date_emission':aujourd_hui-timedelta(days=45),
        'date_echeance':aujourd_hui-timedelta(days=15),
        'montant_ht':Decimal('22000.000'),'taux_tva':Decimal('0'),
        'montant_paye':Decimal('0'),'statut':'en_retard',
        'exercice':exercice,
        'notes':'Export hors taxes - en retard de paiement',
    },
    {
        'numero':'FAC-2024-004','type_facture':'facture',
        'client_nom':'Delta SARL Nabeul','devise':'TND',
        'date_emission':aujourd_hui-timedelta(days=2),
        'date_echeance':aujourd_hui+timedelta(days=28),
        'montant_ht':Decimal('4200.000'),'taux_tva':Decimal('19'),
        'montant_paye':Decimal('2000.000'),'statut':'partiellement_payee',
        'exercice':exercice,
    },
]

for fd in factures_data:
    f = Facture(**fd, cree_par=user_compta)
    f.montant_tva   = round(float(f.montant_ht) * float(f.taux_tva) / 100, 3)
    f.montant_ttc   = round(float(f.montant_ht) + float(f.montant_tva), 3)
    f.solde_restant = round(float(f.montant_ttc) - float(f.montant_paye), 3)
    Facture.objects.filter(numero=f.numero).delete()
    # Sauvegarder sans appeler save() pour eviter la logique de statut auto
    Facture.objects.bulk_create([f])
    f_saved = Facture.objects.get(numero=fd['numero'])
    retard = ' *** EN RETARD ***' if f_saved.est_en_retard else ''
    print(f"    OK - {f_saved.numero} | {f_saved.client_nom} | TTC: {f_saved.montant_ttc} {f_saved.devise} | {f_saved.statut}{retard}")

print("\n" + "="*60)
print("  SEED COMPTABILITE TERMINE")
print("="*60)
print(f"  Exercices    : {ExerciceComptable.objects.count()}")
print(f"  Comptes      : {PlanComptable.objects.count()}")
print(f"  Ecritures    : {EcritureComptable.objects.count()}")
print(f"  Factures     : {Facture.objects.count()}")
from django.db.models import Sum
ca = Facture.objects.aggregate(t=Sum('montant_ht'))['t'] or 0
enc= Facture.objects.aggregate(t=Sum('montant_paye'))['t'] or 0
print(f"  CA total HT  : {ca} DT")
print(f"  Encaisse     : {enc} DT")
print("="*60)