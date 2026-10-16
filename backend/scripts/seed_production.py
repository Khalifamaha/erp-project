# -*- coding: utf-8 -*-
import os
import django
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.production.models import (
    Machine, GammeOperatoire, Operation,
    OrdreFabrication, ConsommationOF,
    ChaineProduction, AffectationEmployeChaine,
    AffectationChaine, SessionProduction,
)
from apps.inventory.models import Produit, Lot
from apps.hr.models import Employe
from apps.accounts.models import User
from django.utils import timezone

print("\n" + "="*60)
print("  SEED PRODUCTION - Machines, Gammes, OF, Chaines")
print("="*60)

# 0. Nettoyage
print("\n[0] Nettoyage production...")
SessionProduction.objects.all().delete()
AffectationChaine.objects.all().delete()
AffectationEmployeChaine.objects.all().delete()
ConsommationOF.objects.all().delete()
OrdreFabrication.objects.all().delete()
Operation.objects.all().delete()
GammeOperatoire.objects.all().delete()
ChaineProduction.objects.all().delete()
Machine.objects.all().delete()
print("    OK")

try:
    user_chef = User.objects.get(email='chef.production@erp.com')
    user_dir  = User.objects.get(email='direction@erp.com')
except User.DoesNotExist:
    user_chef = User.objects.filter(is_active=True).first()
    user_dir  = user_chef

aujourd_hui = date.today()

# 1. MACHINES
print("\n[1] Creation des machines...")

machines_data = [
    {'code':'MCH-001','nom':'Laser Trumpf TruLaser 3030','type':'laser',    'marque':'Trumpf',   'modele':'TruLaser 3030','numero_serie':'TL3030-2019-001','emplacement':'Atelier A - Zone 1','statut':'disponible','date_mise_service':date(2019,3,15),'cadence_horaire':Decimal('45.00'),'cadence_theorique':Decimal('60.00'),'taux_disponibilite':Decimal('94.50'),'prochaine_maintenance':aujourd_hui+timedelta(days=15),'fabricant':'Trumpf GmbH'},
    {'code':'MCH-002','nom':'Presse Amada HFE 100-3','type':'presse',       'marque':'Amada',    'modele':'HFE 100-3',   'numero_serie':'HFE100-2020-002','emplacement':'Atelier A - Zone 2','statut':'disponible','date_mise_service':date(2020,6,1), 'cadence_horaire':Decimal('80.00'),'cadence_theorique':Decimal('100.00'),'taux_disponibilite':Decimal('97.20'),'prochaine_maintenance':aujourd_hui+timedelta(days=45),'fabricant':'Amada Co Ltd'},
    {'code':'MCH-003','nom':'Tour CNC Haas ST-20','type':'tour',            'marque':'Haas',     'modele':'ST-20',       'numero_serie':'ST20-2018-003',  'emplacement':'Atelier B - Zone 1','statut':'disponible','date_mise_service':date(2018,9,10),'cadence_horaire':Decimal('30.00'),'cadence_theorique':Decimal('40.00'), 'taux_disponibilite':Decimal('89.00'),'prochaine_maintenance':aujourd_hui+timedelta(days=7), 'fabricant':'Haas Automation'},
    {'code':'MCH-004','nom':'Fraiseuse CNC Mazak VCN-530','type':'fraiseuse','marque':'Mazak',   'modele':'VCN-530',     'numero_serie':'VCN530-2021-004','emplacement':'Atelier B - Zone 2','statut':'disponible','date_mise_service':date(2021,2,20),'cadence_horaire':Decimal('25.00'),'cadence_theorique':Decimal('35.00'), 'taux_disponibilite':Decimal('96.80'),'prochaine_maintenance':aujourd_hui+timedelta(days=30),'fabricant':'Yamazaki Mazak'},
    {'code':'MCH-005','nom':'Poste Soudure MIG Lincoln','type':'soudure',   'marque':'Lincoln',  'modele':'Power MIG 350MP','numero_serie':'PM350-2020-001','emplacement':'Atelier C - Zone 1','statut':'disponible','date_mise_service':date(2020,1,15),'cadence_horaire':Decimal('20.00'),'cadence_theorique':Decimal('25.00'),'taux_disponibilite':Decimal('99.00'),'prochaine_maintenance':aujourd_hui+timedelta(days=60),'fabricant':'Lincoln Electric'},
    {'code':'MCH-006','nom':'Poste Soudure MIG Lincoln 2','type':'soudure', 'marque':'Lincoln',  'modele':'Power MIG 350MP','numero_serie':'PM350-2020-002','emplacement':'Atelier C - Zone 2','statut':'panne',    'date_mise_service':date(2020,1,15),'cadence_horaire':Decimal('20.00'),'cadence_theorique':Decimal('25.00'),'taux_disponibilite':Decimal('72.00'),'prochaine_maintenance':aujourd_hui,           'fabricant':'Lincoln Electric','notes':'En panne - courroie cassee'},
    {'code':'MCH-007','nom':'Plieuse Bystronic Xpert 80','type':'pliage',   'marque':'Bystronic','modele':'Xpert 80',    'numero_serie':'XP80-2022-001',  'emplacement':'Atelier A - Zone 3','statut':'disponible','date_mise_service':date(2022,5,10),'cadence_horaire':Decimal('60.00'),'cadence_theorique':Decimal('75.00'), 'taux_disponibilite':Decimal('98.50'),'prochaine_maintenance':aujourd_hui+timedelta(days=90),'fabricant':'Bystronic AG'},
    {'code':'MCH-008','nom':'Poste Assemblage Manuel 1','type':'assemblage', 'marque':'',        'modele':'',            'numero_serie':'',               'emplacement':'Atelier D - Zone 1','statut':'disponible','date_mise_service':date(2017,1,1), 'cadence_horaire':Decimal('15.00'),'cadence_theorique':Decimal('20.00'), 'taux_disponibilite':Decimal('100.00'),'prochaine_maintenance':None,                     'fabricant':''},
    {'code':'MCH-009','nom':'Poste Assemblage Manuel 2','type':'assemblage', 'marque':'',        'modele':'',            'numero_serie':'',               'emplacement':'Atelier D - Zone 2','statut':'disponible','date_mise_service':date(2017,1,1), 'cadence_horaire':Decimal('15.00'),'cadence_theorique':Decimal('20.00'), 'taux_disponibilite':Decimal('100.00'),'prochaine_maintenance':None,                     'fabricant':''},
    {'code':'MCH-010','nom':'Poste Controle Qualite 1','type':'controle',   'marque':'Mitutoyo','modele':'CNC CMM',     'numero_serie':'CMM-2021-001',   'emplacement':'Labo Qualite',      'statut':'disponible','date_mise_service':date(2021,8,1), 'cadence_horaire':Decimal('12.00'),'cadence_theorique':Decimal('15.00'), 'taux_disponibilite':Decimal('99.50'),'prochaine_maintenance':aujourd_hui+timedelta(days=120),'fabricant':'Mitutoyo Corp'},
]

machines = {}
for md in machines_data:
    m = Machine.objects.create(**md)
    machines[m.code] = m
    statut_label = ' *** EN PANNE ***' if m.statut == 'panne' else ''
    print(f"    OK - [{m.code}] {m.nom} | {m.cadence_horaire} pcs/h{statut_label}")

# 2. CHAINES DE PRODUCTION
print("\n[2] Creation des chaines de production...")

try:
    emp_chef = Employe.objects.get(matricule='EMP002')
    chef_user = emp_chef.utilisateur
except Exception:
    chef_user = user_chef

chaines_data = [
    {'code':'CH-01','nom':'Chaine Decoupe Laser',      'objectif_heure':40,'objectif_jour':320,'objectif_shift':160,'capacite_max':Decimal('500'),'type_shift':'2x8','statut':'active','chef':chef_user,'description':'Chaine decoupe laser acier et aluminium'},
    {'code':'CH-02','nom':'Chaine Pliage et Formage',  'objectif_heure':70,'objectif_jour':560,'objectif_shift':280,'capacite_max':Decimal('800'),'type_shift':'2x8','statut':'active','chef':chef_user,'description':'Chaine pliage toles et profilage'},
    {'code':'CH-03','nom':'Chaine Soudure',            'objectif_heure':18,'objectif_jour':144,'objectif_shift':72, 'capacite_max':Decimal('200'),'type_shift':'2x8','statut':'active','chef':chef_user,'description':'Chaine soudure MIG assemblage chassis'},
    {'code':'CH-04','nom':'Chaine Assemblage Final',   'objectif_heure':12,'objectif_jour':96, 'objectif_shift':48, 'capacite_max':Decimal('150'),'type_shift':'2x8','statut':'active','chef':chef_user,'description':'Assemblage final et controle visuel'},
    {'code':'CH-05','nom':'Chaine Usinage CNC',        'objectif_heure':22,'objectif_jour':176,'objectif_shift':88, 'capacite_max':Decimal('250'),'type_shift':'2x8','statut':'active','chef':chef_user,'description':'Tournage et fraisage CNC pieces unitaires'},
]

chaines = {}
for cd in chaines_data:
    c = ChaineProduction.objects.create(**cd)
    chaines[c.code] = c
    print(f"    OK - [{c.code}] {c.nom} | Obj: {c.objectif_heure} pcs/h | {c.objectif_jour} pcs/j")

# 3. AFFECTATION EMPLOYES AUX CHAINES
print("\n[3] Affectation employes aux chaines...")

try:
    emps = {e.matricule: e for e in Employe.objects.all()}
    affectations = [
        {'employe':emps.get('EMP004'),'chaine':chaines['CH-01'],'poste_occupe':'Operateur laser',    'shift':'matin', 'date_debut':date(2024,1,1)},
        {'employe':emps.get('EMP005'),'chaine':chaines['CH-02'],'poste_occupe':'Operatrice pliage',  'shift':'matin', 'date_debut':date(2024,1,1)},
        {'employe':emps.get('EMP009'),'chaine':chaines['CH-03'],'poste_occupe':'Operateur soudure',  'shift':'matin', 'date_debut':date(2024,3,1)},
    ]
    for aff in affectations:
        if aff['employe']:
            AffectationEmployeChaine.objects.create(actif=True, **aff)
            print(f"    OK - {aff['employe'].nom_complet} -> {aff['chaine'].code} ({aff['shift']})")
except Exception as e:
    print(f"    ATTENTION employes non trouves : {e}")

# 4. GAMMES OPERATOIRES
print("\n[4] Creation des gammes operatoires...")

try:
    pf001 = Produit.objects.get(reference='PF-001')
    pf002 = Produit.objects.get(reference='PF-002')
    pf003 = Produit.objects.get(reference='PF-003')
except Produit.DoesNotExist:
    print("    ATTENTION : Produits PF non trouves - lancer seed_inventory.py d abord")
    import sys; sys.exit(1)

# Gamme chassis modele A
gamme_chassis = GammeOperatoire.objects.create(
    produit=pf001, nom='Gamme Chassis Modele A', version=1, active=True,
    date_validation=aujourd_hui-timedelta(days=30), valide_par=user_dir,
    description='Gamme standard pour chassis modele A'
)
ops_chassis = [
    {'ordre':1,'nom':'Decoupe laser toles','type_operation':'decoupe',  'machine':machines['MCH-001'],'temps_unitaire_min':Decimal('8.0'), 'temps_reglage_min':Decimal('20.0'),'operateurs_requis':1,'instruction':'Decoupe selon plan ref A-001'},
    {'ordre':2,'nom':'Pliage flancs',       'type_operation':'pliage',   'machine':machines['MCH-007'],'temps_unitaire_min':Decimal('6.0'), 'temps_reglage_min':Decimal('15.0'),'operateurs_requis':1,'instruction':'Plier a 90 degres - tolerance +/-0.5mm'},
    {'ordre':3,'nom':'Soudure assemblage',  'type_operation':'soudure',  'machine':machines['MCH-005'],'temps_unitaire_min':Decimal('18.0'),'temps_reglage_min':Decimal('10.0'),'operateurs_requis':2,'instruction':'Soudure MIG - cordon 6mm - preheauffe si T<10C'},
    {'ordre':4,'nom':'Controle dimensional','type_operation':'controle', 'machine':machines['MCH-010'],'temps_unitaire_min':Decimal('5.0'), 'temps_reglage_min':Decimal('5.0'), 'operateurs_requis':1,'instruction':'Verifier cotes selon plan A-001 Rev3'},
]
for op in ops_chassis:
    Operation.objects.create(gamme=gamme_chassis, **op)
print(f"    OK - Gamme '{gamme_chassis.nom}' v{gamme_chassis.version} | {gamme_chassis.temps_total_min} min/piece")

# Gamme boitier plastique
gamme_boitier = GammeOperatoire.objects.create(
    produit=pf002, nom='Gamme Boitier Plastique B200', version=1, active=True,
    date_validation=aujourd_hui-timedelta(days=20), valide_par=user_dir,
    description='Gamme boitier injection + assemblage'
)
ops_boitier = [
    {'ordre':1,'nom':'Preparation moule',   'type_operation':'usinage',  'machine':machines['MCH-004'],'temps_unitaire_min':Decimal('2.0'), 'temps_reglage_min':Decimal('30.0'),'operateurs_requis':1,'instruction':'Nettoyer et preparer moule ref B200'},
    {'ordre':2,'nom':'Ebavurage finition',  'type_operation':'finition', 'machine':machines['MCH-008'],'temps_unitaire_min':Decimal('3.0'), 'temps_reglage_min':Decimal('0.0'), 'operateurs_requis':1,'instruction':'Ebavurer bords - aucune arrete vive'},
    {'ordre':3,'nom':'Controle visuel',     'type_operation':'controle', 'machine':machines['MCH-010'],'temps_unitaire_min':Decimal('1.5'), 'temps_reglage_min':Decimal('5.0'), 'operateurs_requis':1,'instruction':'Controle aspect - rejeter si fissure ou inclusions'},
]
for op in ops_boitier:
    Operation.objects.create(gamme=gamme_boitier, **op)
print(f"    OK - Gamme '{gamme_boitier.nom}' v{gamme_boitier.version} | {gamme_boitier.temps_total_min} min/piece")

# Gamme support fixation
gamme_support = GammeOperatoire.objects.create(
    produit=pf003, nom='Gamme Support Fixation SFG-10', version=1, active=True,
    date_validation=aujourd_hui-timedelta(days=60), valide_par=user_dir,
    description='Support galvanise decoupe + pliage'
)
ops_support = [
    {'ordre':1,'nom':'Decoupe laser',       'type_operation':'decoupe', 'machine':machines['MCH-001'],'temps_unitaire_min':Decimal('1.5'),'temps_reglage_min':Decimal('10.0'),'operateurs_requis':1,'instruction':'Decoupe profil SFG-10 - acier S235'},
    {'ordre':2,'nom':'Pliage 90 degres',    'type_operation':'pliage',  'machine':machines['MCH-002'],'temps_unitaire_min':Decimal('0.8'),'temps_reglage_min':Decimal('8.0'), 'operateurs_requis':1,'instruction':'Pliage a froid - matrice 8mm'},
    {'ordre':3,'nom':'Controle final',      'type_operation':'controle','machine':machines['MCH-010'],'temps_unitaire_min':Decimal('0.5'),'temps_reglage_min':Decimal('0.0'), 'operateurs_requis':1,'instruction':'Controle dimensionnel par echantillonnage 10%'},
]
for op in ops_support:
    Operation.objects.create(gamme=gamme_support, **op)
print(f"    OK - Gamme '{gamme_support.nom}' v{gamme_support.version} | {gamme_support.temps_total_min} min/piece")

# 5. ORDRES DE FABRICATION
print("\n[5] Creation des ordres de fabrication...")

ordres_data = [
    {'numero':'OF-2024-001','produit':pf001,'gamme':gamme_chassis, 'quantite_prevue':Decimal('50'), 'quantite_produite':Decimal('50'),'quantite_rebutee':Decimal('2'), 'date_debut_prev':aujourd_hui-timedelta(days=30),'date_fin_prev':aujourd_hui-timedelta(days=20),'statut':'termine', 'priorite':3},
    {'numero':'OF-2024-002','produit':pf002,'gamme':gamme_boitier, 'quantite_prevue':Decimal('200'),'quantite_produite':Decimal('200'),'quantite_rebutee':Decimal('5'),'date_debut_prev':aujourd_hui-timedelta(days=25),'date_fin_prev':aujourd_hui-timedelta(days=15),'statut':'termine', 'priorite':3},
    {'numero':'OF-2024-003','produit':pf003,'gamme':gamme_support, 'quantite_prevue':Decimal('500'),'quantite_produite':Decimal('500'),'quantite_rebutee':Decimal('8'),'date_debut_prev':aujourd_hui-timedelta(days=20),'date_fin_prev':aujourd_hui-timedelta(days=10),'statut':'termine', 'priorite':3},
    {'numero':'OF-2024-004','produit':pf001,'gamme':gamme_chassis, 'quantite_prevue':Decimal('80'), 'quantite_produite':Decimal('45'), 'quantite_rebutee':Decimal('3'), 'date_debut_prev':aujourd_hui-timedelta(days=5), 'date_fin_prev':aujourd_hui+timedelta(days=5), 'statut':'en_cours','priorite':2},
    {'numero':'OF-2024-005','produit':pf002,'gamme':gamme_boitier, 'quantite_prevue':Decimal('300'),'quantite_produite':Decimal('120'),'quantite_rebutee':Decimal('4'),'date_debut_prev':aujourd_hui-timedelta(days=3), 'date_fin_prev':aujourd_hui+timedelta(days=7), 'statut':'en_cours','priorite':3},
    {'numero':'OF-2024-006','produit':pf003,'gamme':gamme_support, 'quantite_prevue':Decimal('1000'),'quantite_produite':Decimal('0'),'quantite_rebutee':Decimal('0'),'date_debut_prev':aujourd_hui+timedelta(days=2), 'date_fin_prev':aujourd_hui+timedelta(days=12),'statut':'planifie','priorite':3},
    {'numero':'OF-2024-007','produit':pf001,'gamme':gamme_chassis, 'quantite_prevue':Decimal('60'), 'quantite_produite':Decimal('0'), 'quantite_rebutee':Decimal('0'), 'date_debut_prev':aujourd_hui+timedelta(days=8), 'date_fin_prev':aujourd_hui+timedelta(days=18),'statut':'brouillon','priorite':1,'notes_operateur':'Commande urgente client Alpha Corp'},
]

ordres = {}
from django.utils import timezone as tz
for od in ordres_data:
    od_clean = {k: v for k, v in od.items()}
    if od_clean['statut'] in ['en_cours', 'termine']:
        od_clean['date_debut_reel'] = tz.make_aware(
            __import__('datetime').datetime.combine(
                od_clean['date_debut_prev'], __import__('datetime').time(8, 0)
            )
        )
    if od_clean['statut'] == 'termine':
        od_clean['date_fin_reel'] = tz.make_aware(
            __import__('datetime').datetime.combine(
                od_clean['date_fin_prev'], __import__('datetime').time(17, 0)
            )
        )
    of = OrdreFabrication.objects.create(responsable=chef_user, **od_clean)
    ordres[of.numero] = of
    print(f"    OK - {of.numero} | {of.produit.reference} x{of.quantite_prevue} | {of.statut} | {of.taux_avancement}%")

# 6. SESSIONS DE PRODUCTION
print("\n[6] Creation des sessions de production...")

sessions_data = [
    {'chaine':chaines['CH-01'],'ordre':ordres['OF-2024-004'],'date_session':aujourd_hui,'shift':'matin','compteur_pieces':28,'objectif_session':160,'statut':'en_cours'},
    {'chaine':chaines['CH-02'],'ordre':ordres['OF-2024-005'],'date_session':aujourd_hui,'shift':'matin','compteur_pieces':65,'objectif_session':280,'statut':'en_cours'},
    {'chaine':chaines['CH-03'],'ordre':ordres['OF-2024-004'],'date_session':aujourd_hui,'shift':'matin','compteur_pieces':12,'objectif_session':72, 'statut':'en_cours'},
    {'chaine':chaines['CH-01'],'ordre':ordres['OF-2024-004'],'date_session':aujourd_hui-timedelta(days=1),'shift':'matin','compteur_pieces':160,'objectif_session':160,'statut':'terminee'},
    {'chaine':chaines['CH-01'],'ordre':ordres['OF-2024-004'],'date_session':aujourd_hui-timedelta(days=1),'shift':'aprem','compteur_pieces':142,'objectif_session':160,'statut':'terminee'},
]

for sd in sessions_data:
    s = SessionProduction.objects.create(chef=chef_user, heure_debut=tz.now(), **sd)
    if s.objectif_session > 0:
        s.taux_realisation = round((s.compteur_pieces / s.objectif_session) * 100, 2)
        s.save(update_fields=['taux_realisation'])
    print(f"    OK - {s.chaine.code} | {s.date_session} {s.shift} | {s.compteur_pieces}/{s.objectif_session} pcs ({s.taux_realisation}%) | {s.statut}")

# RESUME
print("\n" + "="*60)
print("  SEED PRODUCTION TERMINE")
print("="*60)
print(f"  Machines          : {Machine.objects.count()}")
print(f"    - Disponibles   : {Machine.objects.filter(statut='disponible').count()}")
print(f"    - En panne      : {Machine.objects.filter(statut='panne').count()}")
print(f"  Chaines           : {ChaineProduction.objects.count()}")
print(f"  Gammes            : {GammeOperatoire.objects.count()}")
print(f"  Operations        : {Operation.objects.count()}")
print(f"  Ordres fabrication: {OrdreFabrication.objects.count()}")
print(f"    - En cours      : {OrdreFabrication.objects.filter(statut__in=['lance','en_cours']).count()}")
print(f"    - Termines      : {OrdreFabrication.objects.filter(statut='termine').count()}")
print(f"  Sessions          : {SessionProduction.objects.count()}")
print(f"    - En cours      : {SessionProduction.objects.filter(statut='en_cours').count()}")
print("="*60)